#!/usr/bin/env node
/**
 * pdf.mjs — print an HTML file to PDF with headless Chromium.
 *
 *   CHROME_PATH=... node pdf.mjs <page.html> <out.pdf>
 *
 * Chromium's print pipeline is the same one the browser uses, so what lands on the
 * page is what the stylesheet says, with no second renderer to disagree with it.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [SRC, OUT, FOOTER] = process.argv.slice(2);
if (!SRC || !OUT) {
  console.error('usage: pdf.mjs <page.html> <out.pdf> [footer label]');
  process.exit(2);
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
const CHROME = process.env.CHROME_PATH || 'chromium';
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--disable-dev-shm-usage', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--window-size=1200,1600', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

const wsUrl = await new Promise((resolve, reject) => {
  let buffered = '';
  const timer = setTimeout(() => reject(new Error('no devtools endpoint')), 20000);
  chrome.stderr.on('data', (c) => {
    buffered += c.toString();
    const m = buffered.match(/ws:\/\/[^\s]+/);
    if (m) { clearTimeout(timer); resolve(m[0]); }
  });
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}, sessionId) => new Promise((resolve) => {
  const msgId = ++id;
  pending.set(msgId, resolve);
  ws.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }));
});

const targets = await send('Target.getTargets');
const page = targets.result.targetInfos.find((t) => t.type === 'page');
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
const cmd = (m, p) => send(m, p, sessionId);

await cmd('Page.enable');
await cmd('Page.navigate', { url: 'file://' + path.resolve(SRC) });
await new Promise((r) => setTimeout(r, 1500));

const printed = await cmd('Page.printToPDF', {
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-family:DejaVu Sans,sans-serif;font-size:7.5pt;color:#8a8496;' +
    'padding:0 16mm;display:flex;justify-content:space-between;">' +
    `<span>${(FOOTER || 'Wizardry').replace(/[<>&]/g, '')}</span>` +
    '<span class="pageNumber"></span><span style="display:none"></span></div>',
  margin: { top: '16mm', bottom: '14mm', left: '16mm', right: '16mm' },
});

fs.writeFileSync(OUT, Buffer.from(printed.result.data, 'base64'));
console.log(OUT, fs.statSync(OUT).size, 'bytes');

chrome.kill('SIGKILL');
process.exit(0);

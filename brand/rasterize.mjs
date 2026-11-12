#!/usr/bin/env node
/**
 * rasterize — render an HTML/SVG file in headless Chromium at an exact size and
 * save a PNG with a transparent background, so brand assets are produced by a
 * real renderer rather than by a converter nobody has installed here.
 *
 *   CHROME_PATH=... node rasterize.mjs <file.html> <out.png> <width> <height>
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [SRC, OUT, W, H] = process.argv.slice(2);
if (!SRC || !OUT) {
  console.error('usage: rasterize.mjs <file> <out.png> <width> <height>');
  process.exit(2);
}
const width = Number(W || 512);
const height = Number(H || 512);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'raster-'));
const CHROME = process.env.CHROME_PATH || 'chromium';
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--disable-dev-shm-usage', '--remote-debugging-port=0', '--force-device-scale-factor=1',
  `--user-data-dir=${profile}`, `--window-size=${Math.max(width, 512)},${Math.max(height, 512)}`, 'about:blank',
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
await cmd('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
await cmd('Page.navigate', { url: 'file://' + path.resolve(SRC) });
await new Promise((r) => setTimeout(r, 1200));

const shot = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, omitBackground: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
console.log(OUT, fs.statSync(OUT).size, 'bytes');

chrome.kill('SIGKILL');
process.exit(0);

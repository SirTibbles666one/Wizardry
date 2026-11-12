// The WebSocket half, shaped by the documented opcodes: Hello (10) tells the client how often to
// heartbeat (1, answered by 11), Identify (2) opens the session, and events arrive as Dispatch (0)
// with a `t` name and a `d` payload. Nothing here is Fluxer-specific beyond those numbers, which is
// the point: the bot logic never touches a socket.
import { OP } from './routes.js';

/**
 * @param {{ url: string, token: string, onEvent: (name: string, data: unknown) => void,
 *           onLog?: (level: string, message: string) => void, WebSocketImpl?: typeof WebSocket }} options
 */
export function connectGateway({ url, token, onEvent, onLog = () => {}, WebSocketImpl = globalThis.WebSocket }) {
  if (!WebSocketImpl) throw new Error('This Node version has no global WebSocket (needs Node 22+).');
  const socket = new WebSocketImpl(url);
  let heartbeat = null;
  let acked = true;

  const log = (message) => onLog('gateway', message);

  socket.addEventListener('open', () => log('socket open'));
  socket.addEventListener('close', (event) => {
    if (heartbeat) clearInterval(heartbeat);
    log(`socket closed (${event.code}${event.reason ? ` ${event.reason}` : ''})`);
  });
  socket.addEventListener('error', () => log('socket error'));

  socket.addEventListener('message', (event) => {
    let frame;
    try {
      frame = JSON.parse(String(event.data));
    } catch {
      log('unparsable frame dropped');
      return;
    }
    const { op, d, t } = frame ?? {};

    if (op === OP.HELLO) {
      const interval = Number(d?.heartbeat_interval) || 41_250;
      heartbeat = setInterval(() => {
        if (!acked) {
          log('no heartbeat ack — reconnecting');
          socket.close(4000, 'heartbeat missed');
          return;
        }
        acked = false;
        socket.send(JSON.stringify({ op: OP.HEARTBEAT, d: null }));
      }, interval);
      // Identify immediately after Hello: the session exists before the first heartbeat.
      socket.send(JSON.stringify({ op: OP.IDENTIFY, d: { token } }));
      log(`identified (heartbeat ${interval}ms)`);
      return;
    }
    if (op === OP.HEARTBEAT_ACK) {
      acked = true;
      return;
    }
    if (op === OP.RECONNECT) {
      socket.close(4000, 'server asked for reconnect');
      return;
    }
    if (op === OP.INVALID_SESSION) {
      socket.close(4000, 'invalid session');
      return;
    }
    if (op === OP.DISPATCH && t) {
      acked = true;
      try {
        onEvent(t, d);
      } catch (error) {
        onLog('error', `handler for ${t} threw: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });

  return {
    close() {
      if (heartbeat) clearInterval(heartbeat);
      socket.close(1000, 'client closed');
    },
    get socket() {
      return socket;
    },
  };
}

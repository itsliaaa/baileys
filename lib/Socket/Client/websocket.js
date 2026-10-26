var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WebSocketClient_instances, _WebSocketClient_native, _WebSocketClient_timer, _WebSocketClient_closed;
import { createRequire } from 'node:module';
import { DEFAULT_ORIGIN, WEBSOCKET_STATES } from '../../Defaults/index.js';
import { AbstractSocketClient } from './types.js';
const WS_ONLY = ['upgrade', 'ping', 'pong', 'unexpected-response'];
let WS;
const loadWS = () => WS ?? (WS = createRequire(import.meta.url)('ws'));
export class WebSocketClient extends AbstractSocketClient {
    constructor() {
        super(...arguments);
        _WebSocketClient_instances.add(this);
        this.socket = null;
        _WebSocketClient_native.set(this, false);
        _WebSocketClient_timer.set(this, null);
    }
    get isOpen() {
        return this.socket?.readyState === WEBSOCKET_STATES.OPEN;
    }
    get isClosed() {
        return this.socket === null || this.socket.readyState === WEBSOCKET_STATES.CLOSED;
    }
    get isClosing() {
        return this.socket === null || this.socket.readyState === WEBSOCKET_STATES.CLOSING;
    }
    get isConnecting() {
        return this.socket?.readyState === WEBSOCKET_STATES.CONNECTING;
    }
    connect() {
        if (this.socket)
            return;
        const { agent, connectTimeoutMs: ms, options } = this.config;
        const headers = options?.headers;
        let sock;
        if (globalThis.WebSocket) {
            __classPrivateFieldSet(this, _WebSocketClient_native, true, "f");
            sock = new globalThis.WebSocket(this.url, { headers: { Origin: DEFAULT_ORIGIN, ...headers } });
            sock.binaryType = 'arraybuffer';
            sock.onopen = () => {
                clearTimeout(__classPrivateFieldGet(this, _WebSocketClient_timer, "f"));
                this.emit('open');
            };
            sock.onmessage = ({ data }) => {
                const bin = typeof data !== 'string';
                this.emit('message', bin ? Buffer.from(data) : data, bin);
            };
            sock.onerror = e => this.emit('error', e.error ?? new Error(e.message));
            sock.onclose = e => __classPrivateFieldGet(this, _WebSocketClient_instances, "m", _WebSocketClient_closed).call(this, sock, e.code, e.reason);
            if (ms) {
                __classPrivateFieldSet(this, _WebSocketClient_timer, setTimeout(() => {
                    this.emit('error', new Error('Opening handshake has timed out'));
                    sock.close();
                }, ms), "f");
            }
        }
        else {
            __classPrivateFieldSet(this, _WebSocketClient_native, false, "f");
            sock = new (loadWS())(this.url, {
                origin: DEFAULT_ORIGIN,
                headers,
                handshakeTimeout: ms,
                timeout: ms,
                agent
            });
            sock.on('open', () => this.emit('open'));
            sock.on('message', (d, bin) => this.emit('message', d, bin));
            sock.on('error', e => this.emit('error', e));
            sock.on('close', (code, reason) => __classPrivateFieldGet(this, _WebSocketClient_instances, "m", _WebSocketClient_closed).call(this, sock, code, reason.toString()));
            for (const ev of WS_ONLY)
                sock.on(ev, (...a) => this.emit(ev, ...a));
        }
        this.socket = sock;
    }
    async close() {
        const sock = this.socket;
        if (!sock)
            return;
        if (sock.readyState === WEBSOCKET_STATES.CLOSED) {
            this.socket = null;
            return;
        }
        const done = new Promise(r => this.once('close', r));
        sock.close();
        await done;
    }
    send(data, cb) {
        const sock = this.socket;
        if (!sock)
            return false;
        if (__classPrivateFieldGet(this, _WebSocketClient_native, "f")) {
            try {
                sock.send(data);
                cb?.();
            }
            catch (e) {
                cb ? cb(e) : this.emit('error', e);
            }
        }
        else
            sock.send(data, cb);
        return true;
    }
}
_WebSocketClient_native = new WeakMap(), _WebSocketClient_timer = new WeakMap(), _WebSocketClient_instances = new WeakSet(), _WebSocketClient_closed = function _WebSocketClient_closed(sock, code, reason) {
    clearTimeout(__classPrivateFieldGet(this, _WebSocketClient_timer, "f"));
    if (this.socket === sock)
        this.socket = null;
    this.emit('close', code, reason);
};

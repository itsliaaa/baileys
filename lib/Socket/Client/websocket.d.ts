export class WebSocketClient extends AbstractSocketClient {
    constructor(...args: any[]);
    socket: any;
    get isOpen(): boolean;
    get isClosed(): boolean;
    get isClosing(): boolean;
    get isConnecting(): boolean;
    connect(): void;
    close(): Promise<void>;
    send(str: any, cb: any): boolean;
}
import { AbstractSocketClient } from './types.js';
//# sourceMappingURL=websocket.d.ts.map
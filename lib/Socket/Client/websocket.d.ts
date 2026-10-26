export class WebSocketClient extends AbstractSocketClient {
    socket: null;
    get isOpen(): boolean;
    get isClosed(): boolean;
    get isClosing(): boolean;
    get isConnecting(): boolean;
    connect(): void;
    close(): Promise<void>;
    send(data: any, cb: any): boolean;
    #private;
}
import { AbstractSocketClient } from './types.js';

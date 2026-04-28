export function makeSocket(config: any): {
    type: string;
    ws: WebSocketClient;
    ev: {
        process(handler: any): () => void;
        emit(event: any, evData: any): any;
        isBuffering(): boolean;
        buffer: () => void;
        flush: () => boolean;
        createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
        on: (...args: any[]) => any;
        off: (...args: any[]) => any;
        removeAllListeners: (...args: any[]) => any;
        destroy(): void;
    };
    authState: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<any>;
            set: (data: any) => Promise<void>;
            isInTransaction: () => boolean;
            transaction: (work: any, key: any) => Promise<any>;
        };
    };
    signalRepository: any;
    readonly user: any;
    generateMessageTag: () => string;
    query: (node: any, timeoutMs: any) => Promise<any>;
    waitForMessage: (msgId: any, timeoutMs?: any) => Promise<any>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: any) => Promise<void>;
    sendNode: (frame: any) => Promise<void>;
    logout: (msg: any) => Promise<void>;
    end: (error: any) => Promise<void>;
    registerSocketEndHandler: (handler: any) => void;
    onUnexpectedError: (err: any, msg: any) => void;
    uploadPreKeys: (count?: 5, retryCount?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    digestKeyBundle: () => Promise<void>;
    rotateSignedPreKey: () => Promise<void>;
    requestPairingCode: (phoneNumber: any, customPairingCode: any) => Promise<any>;
    updateServerTimeOffset: ({ attrs }: {
        attrs: any;
    }) => void;
    sendUnifiedSession: () => Promise<void>;
    wamBuffer: BinaryInfo;
    /** Waits for the connection to WA to reach a state */
    waitForConnectionUpdate: (check: any, timeoutMs: any) => Promise<void>;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    onWhatsApp: (...phoneNumber: any[]) => Promise<any>;
};
import { WebSocketClient } from './Client/index.js';
import { BinaryInfo } from '../WAM/BinaryInfo.js';
//# sourceMappingURL=socket.d.ts.map
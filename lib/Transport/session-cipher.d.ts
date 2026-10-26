export default SessionCipher;
declare class SessionCipher {
    constructor(storage: any, protocolAddress: any);
    addr: ProtocolAddress;
    storage: any;
    _encodeTupleByte(number1: any, number2: any): number;
    _decodeTupleByte(byte: any): number[];
    toString(): string;
    getRecord(): Promise<any>;
    storeRecord(record: any): Promise<void>;
    queueJob(awaitable: any): Promise<any>;
    encrypt(data: any): Promise<any>;
    decryptWithSessions(data: any, sessions: any): Promise<{
        session: any;
        plaintext: any;
    }>;
    decryptWhisperMessage(data: any): Promise<any>;
    decryptPreKeyWhisperMessage(data: any): Promise<any>;
    doDecryptWhisperMessage(messageBuffer: any, session: any): Promise<any>;
    fillMessageKeys(chain: any, counter: any): void;
    maybeStepRatchet(session: any, remoteKey: any, previousCounter: any): void;
    calculateRatchet(session: any, remoteKey: any, sending: any): void;
    hasOpenSession(): Promise<any>;
    closeOpenSession(): Promise<any>;
}
import { ProtocolAddress } from './internals.js';

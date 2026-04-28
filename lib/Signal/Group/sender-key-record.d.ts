export class SenderKeyRecord {
    static deserialize(data: any): SenderKeyRecord;
    constructor(serialized: any);
    MAX_STATES: number;
    senderKeyStates: SenderKeyState[];
    isEmpty(): boolean;
    getSenderKeyState(keyId: any): SenderKeyState | undefined;
    addSenderKeyState(id: any, iteration: any, chainKey: any, signatureKey: any): void;
    setSenderKeyState(id: any, iteration: any, chainKey: any, keyPair: any): void;
    serialize(): any[];
}
import { SenderKeyState } from './sender-key-state.js';
//# sourceMappingURL=sender-key-record.d.ts.map
export function queueJob(key: any, run: any): Promise<any>;
export function generateRegistrationId(): number;
export function generateSignedPreKey(identityKeyPair: any, signedKeyId: any): {
    keyId: any;
    keyPair: {
        pubKey: any;
        privKey: any;
    };
    signature: any;
};
export function generatePreKey(keyId: any): {
    keyId: any;
    keyPair: {
        pubKey: any;
        privKey: any;
    };
};
export namespace BaseKeyType {
    let OURS: number;
    let THEIRS: number;
}
export namespace ChainType {
    let SENDING: number;
    let RECEIVING: number;
}
export class SignalError extends Error {
}
export class UntrustedIdentityKeyError extends SignalError {
    constructor(addr: any, identityKey: any);
    addr: any;
    identityKey: any;
}
export class SessionError extends SignalError {
    constructor(message: any);
}
export class MessageCounterError extends SessionError {
}
export class PreKeyError extends SessionError {
}
export namespace errors {
    export { SignalError };
    export { UntrustedIdentityKeyError };
    export { SessionError };
    export { MessageCounterError };
    export { PreKeyError };
}
export class ProtocolAddress {
    static from(encodedAddress: any): ProtocolAddress;
    constructor(id: any, deviceId: any);
    id: string;
    deviceId: number;
    toString(): string;
    is(other: any): boolean;
}
export const generateIdentityKeyPair: typeof generateKeyPair;
export default ProtocolAddress;
import { generateKeyPair } from './curve.js';

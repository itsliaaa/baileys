import { calculateSignature, generateKeyPair } from './curve.js';
import { randomBytes } from 'node:crypto';
export const BaseKeyType = {
    OURS: 1,
    THEIRS: 2
};
export const ChainType = {
    SENDING: 1,
    RECEIVING: 2
};
export class SignalError extends Error {
}
export class UntrustedIdentityKeyError extends SignalError {
    constructor(addr, identityKey) {
        super();
        this.name = 'UntrustedIdentityKeyError';
        this.addr = addr;
        this.identityKey = identityKey;
    }
}
export class SessionError extends SignalError {
    constructor(message) {
        super(message);
        this.name = 'SessionError';
    }
}
export class MessageCounterError extends SessionError {
    constructor(message) {
        super(message);
        this.name = 'MessageCounterError';
    }
}
export class PreKeyError extends SessionError {
    constructor(message) {
        super(message);
        this.name = 'PreKeyError';
    }
}
export const errors = {
    SignalError,
    UntrustedIdentityKeyError,
    SessionError,
    MessageCounterError,
    PreKeyError
};
const queues = new Map();
async function drain(key, queue) {
    try {
        while (queue.head < queue.jobs.length) {
            const job = queue.jobs[queue.head++];
            queue.jobs[queue.head - 1] = null;
            try {
                job.resolve(await job.run());
            }
            catch (error) {
                job.reject(error);
            }
            if (queue.head >= 1024 && queue.head * 2 >= queue.jobs.length) {
                queue.jobs = queue.jobs.slice(queue.head);
                queue.head = 0;
            }
        }
    }
    finally {
        if (queues.get(key) === queue) {
            queues.delete(key);
        }
    }
}
export function queueJob(key, run) {
    if (typeof run !== 'function') {
        return Promise.reject(new TypeError('Job must be a function'));
    }
    let queue = queues.get(key);
    const start = !queue;
    if (!queue) {
        queue = { jobs: [], head: 0 };
        queues.set(key, queue);
    }
    const promise = new Promise((resolve, reject) => {
        queue.jobs.push({ run, resolve, reject });
    });
    if (start) {
        void drain(key, queue);
    }
    return promise;
}
export class ProtocolAddress {
    static from(encodedAddress) {
        if (typeof encodedAddress !== 'string' || !encodedAddress.match(/.*\.\d+/)) {
            throw new Error('Invalid address encoding');
        }
        const parts = encodedAddress.split('.');
        return new this(parts[0], parseInt(parts[1]));
    }
    constructor(id, deviceId) {
        if (typeof id !== 'string') {
            throw new TypeError('id required for addr');
        }
        if (id.indexOf('.') !== -1) {
            throw new TypeError('encoded addr detected');
        }
        this.id = id;
        if (typeof deviceId !== 'number') {
            throw new TypeError('number required for deviceId');
        }
        this.deviceId = deviceId;
    }
    toString() {
        return `${this.id}.${this.deviceId}`;
    }
    is(other) {
        if (!(other instanceof ProtocolAddress)) {
            return false;
        }
        return other.id === this.id && other.deviceId === this.deviceId;
    }
}
function isNonNegativeInteger(n) {
    return (typeof n === 'number' && (n % 1) === 0 && n >= 0);
}
export const generateIdentityKeyPair = generateKeyPair;
export function generateRegistrationId() {
    var registrationId = Uint16Array.from(randomBytes(2))[0];
    return registrationId & 0x3fff;
}
export function generateSignedPreKey(identityKeyPair, signedKeyId) {
    if (!(identityKeyPair.privKey instanceof Buffer) ||
        identityKeyPair.privKey.byteLength != 32 ||
        !(identityKeyPair.pubKey instanceof Buffer) ||
        identityKeyPair.pubKey.byteLength != 33) {
        throw new TypeError('Invalid argument for identityKeyPair');
    }
    if (!isNonNegativeInteger(signedKeyId)) {
        throw new TypeError('Invalid argument for signedKeyId: ' + signedKeyId);
    }
    const keyPair = generateKeyPair();
    const sig = calculateSignature(identityKeyPair.privKey, keyPair.pubKey);
    return {
        keyId: signedKeyId,
        keyPair: keyPair,
        signature: sig
    };
}
export function generatePreKey(keyId) {
    if (!isNonNegativeInteger(keyId)) {
        throw new TypeError('Invalid argument for keyId: ' + keyId);
    }
    const keyPair = generateKeyPair();
    return {
        keyId,
        keyPair
    };
}
export default ProtocolAddress;

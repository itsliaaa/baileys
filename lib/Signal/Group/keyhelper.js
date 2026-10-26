import { randomBytes, randomInt } from 'node:crypto';
import { curve } from '../../Transport/index.js';
export function generateSenderKey() {
    return randomBytes(32);
}
export function generateSenderKeyId() {
    return randomInt(2147483647);
}
export function generateSenderSigningKey(key) {
    if (!key) {
        key = curve.generateKeyPair();
    }
    return {
        public: Buffer.from(key.pubKey),
        private: Buffer.from(key.privKey)
    };
}

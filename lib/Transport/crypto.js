import { createCipheriv, createDecipheriv, createHmac, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { hkdf } from 'whatsapp-rust-bridge';
function assertBuffer(value) {
    if (!Buffer.isBuffer(value)) {
        throw TypeError(`Expected Buffer instead of: ${value.constructor.name}`);
    }
    return value;
}
export function encrypt(key, data, iv) {
    assertBuffer(key);
    assertBuffer(data);
    assertBuffer(iv);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
}
export function decrypt(key, data, iv) {
    assertBuffer(key);
    assertBuffer(data);
    assertBuffer(iv);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
export function calculateMAC(key, data) {
    assertBuffer(key);
    assertBuffer(data);
    const hmac = createHmac('sha256', key);
    hmac.update(data);
    return Buffer.from(hmac.digest());
}
export function hash(data) {
    assertBuffer(data);
    const sha512 = createHash('sha512');
    sha512.update(data);
    return sha512.digest();
}
export function deriveSecrets(input, salt, info, chunks) {
    assertBuffer(input);
    assertBuffer(salt);
    assertBuffer(info);
    if (salt.byteLength != 32) {
        throw new Error('Got salt of incorrect length');
    }
    chunks = chunks || 3;
    assert(chunks >= 1 && chunks <= 3);
    const result = hkdf(input, chunks * 32, { salt, info: info.toString('utf8') });
    const output = new Array(chunks);
    for (let i = 0; i < chunks; i++) {
        output[i] = Buffer.from(result.buffer, result.byteOffset + (i * 32), 32);
    }
    return output;
}
export function verifyMAC(data, key, mac, length) {
    const calculatedMac = calculateMAC(key, data).slice(0, length);
    if (mac.length !== length || calculatedMac.length !== length) {
        throw new Error('Bad MAC length');
    }
    if (!mac.equals(calculatedMac)) {
        throw new Error('Bad MAC');
    }
}

import { generateKeyPair as wasmGenerateKeyPair, calculateAgreement as wasmCalculateAgreement, calculateSignature as wasmCalculateSignature, verifySignature as wasmVerifySignature, getPublicFromPrivateKey as wasmGetPublicFromPrivateKey } from 'whatsapp-rust-bridge';
function validatePrivKey(privKey) {
    if (privKey === undefined) {
        throw new Error('Undefined private key');
    }
    if (!Buffer.isBuffer(privKey)) {
        throw new Error(`Invalid private key type: ${privKey?.constructor?.name ?? typeof privKey}`);
    }
    if (privKey.byteLength != 32) {
        throw new Error(`Incorrect private key length: ${privKey.byteLength}`);
    }
}
function scrubPubKeyFormat(pubKey) {
    if (!Buffer.isBuffer(pubKey)) {
        throw new Error(`Invalid public key type: ${pubKey?.constructor?.name ?? typeof pubKey}`);
    }
    if ((pubKey.byteLength !== 33 || pubKey[0] !== 5) && pubKey.byteLength !== 32) {
        throw new Error('Invalid public key');
    }
    if (pubKey.byteLength == 33) {
        return pubKey.slice(1);
    }
    else {
        console.error('WARNING: Expected pubkey of length 33, please report the ST and client that generated the pubkey');
        return pubKey;
    }
}
export function getPublicFromPrivateKey(privKey) {
    return Buffer.from(wasmGetPublicFromPrivateKey(privKey));
}
export function generateKeyPair() {
    const kp = wasmGenerateKeyPair();
    return {
        pubKey: Buffer.from(kp.pubKey),
        privKey: Buffer.from(kp.privKey)
    };
}
export function calculateAgreement(pubKey, privKey) {
    pubKey = scrubPubKeyFormat(pubKey);
    validatePrivKey(privKey);
    return Buffer.from(wasmCalculateAgreement(pubKey, privKey));
}
export function calculateSignature(privKey, message) {
    validatePrivKey(privKey);
    if (!message) {
        throw new Error('Invalid message');
    }
    return Buffer.from(wasmCalculateSignature(privKey, message));
}
export function verifySignature(pubKey, msg, sig, isInit) {
    if (isInit)
        return true;
    pubKey = scrubPubKeyFormat(pubKey);
    if (!msg) {
        throw new Error('Invalid message');
    }
    if (!sig || sig.byteLength != 64) {
        throw new Error('Invalid signature');
    }
    return wasmVerifySignature(pubKey, msg, sig);
}

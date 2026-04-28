/**
 * encrypt AES 256 GCM;
 * where the tag tag is suffixed to the ciphertext
 * */
export function aesEncryptGCM(plaintext: any, key: any, iv: any, additionalData: any): any;
/**
 * decrypt AES 256 GCM;
 * where the auth tag is suffixed to the ciphertext
 * */
export function aesDecryptGCM(ciphertext: any, key: any, iv: any, additionalData: any): any;
export function aesEncryptCTR(plaintext: any, key: any, iv: any): any;
export function aesDecryptCTR(ciphertext: any, key: any, iv: any): any;
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
export function aesDecrypt(buffer: any, key: any): any;
/** decrypt AES 256 CBC */
export function aesDecryptWithIV(buffer: any, key: any, IV: any): any;
export function aesEncrypt(buffer: any, key: any): any;
export function aesEncrypWithIV(buffer: any, key: any, IV: any): any;
export function hmacSign(buffer: any, key: any, variant?: string): any;
export function sha256(buffer: any): any;
export function derivePairingCodeKey(pairingCode: any, salt: any): Promise<any>;
export function generateSignalPubKey(pubKey: any): any;
export namespace Curve {
    function generateKeyPair(): {
        private: any;
        public: any;
    };
    function sharedKey(privateKey: any, publicKey: any): any;
    function sign(privateKey: any, buf: any): any;
    function verify(pubKey: any, message: any, signature: any): boolean;
}
export function signedKeyPair(identityKeyPair: any, keyId: any): {
    keyPair: {
        private: any;
        public: any;
    };
    signature: any;
    keyId: any;
};
//# sourceMappingURL=crypto.d.ts.map
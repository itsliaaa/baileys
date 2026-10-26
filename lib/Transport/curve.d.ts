export function getPublicFromPrivateKey(privKey: any): any;
export function generateKeyPair(): {
    pubKey: any;
    privKey: any;
};
export function calculateAgreement(pubKey: any, privKey: any): any;
export function calculateSignature(privKey: any, message: any): any;
export function verifySignature(pubKey: any, msg: any, sig: any, isInit: any): any;

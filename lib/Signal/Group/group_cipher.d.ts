export class GroupCipher {
    constructor(senderKeyStore: any, senderKeyName: any);
    senderKeyStore: any;
    senderKeyName: any;
    encrypt(paddedPlaintext: any): Promise<any>;
    decrypt(senderKeyMessageBytes: any): Promise<any>;
    getSenderKey(senderKeyState: any, iteration: any): any;
    getPlainText(iv: any, key: any, ciphertext: any): Promise<any>;
    getCipherText(iv: any, key: any, plaintext: any): Promise<any>;
}
//# sourceMappingURL=group_cipher.d.ts.map
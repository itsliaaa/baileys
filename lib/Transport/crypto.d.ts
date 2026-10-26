export function encrypt(key: any, data: any, iv: any): any;
export function decrypt(key: any, data: any, iv: any): any;
export function calculateMAC(key: any, data: any): any;
export function hash(data: any): any;
export function deriveSecrets(input: any, salt: any, info: any, chunks: any): any[];
export function verifyMAC(data: any, key: any, mac: any, length: any): void;

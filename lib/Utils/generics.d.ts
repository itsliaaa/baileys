export function promiseTimeout(ms: any, promise: any): Promise<any>;
export function bindWaitForEvent(ev: any, event: any): (check: any, timeoutMs: any) => Promise<void>;
export function trimUndefined(obj: any): any;
export function bytesToCrockford(buffer: any): string;
export function encodeNewsletterMessage(message: any): any;
export namespace BufferJSON {
    function replacer(k: any, value: any): any;
    function reviver(_: any, value: any): any;
}
export function getKeyAuthor(key: any, meId?: string): any;
export function isStringNullOrEmpty(value: any): boolean;
export function writeRandomPadMax16(msg: any): any;
export function unpadRandomMax16(e: any): Uint8Array<any>;
export function generateParticipantHashV2(participants: any): string;
export function encodeWAMessage(message: any): any;
export function generateRegistrationId(): number;
export function encodeBigEndian(e: any, t?: number): Uint8Array<ArrayBuffer>;
export function toNumber(t: any): any;
export function unixTimestampSeconds(date?: number): number;
export function debouncedTimeout(intervalMs: number | undefined, task: any): {
    start: (newIntervalMs: any, newTask: any) => void;
    cancel: () => void;
    setTask: (newTask: any) => any;
    setInterval: (newInterval: any) => any;
};
export function delay(ms: any): Promise<any>;
export function delayCancellable(ms: any): {
    delay: Promise<any>;
    cancel: () => void;
};
export function generateMessageIDV2(userId: any): string;
export function generateMessageID(): string;
export function bindWaitForConnectionUpdate(ev: any): (check: any, timeoutMs: any) => Promise<void>;
export function fetchLatestBaileysVersion(options?: {}): Promise<{
    version: number[];
    isLatest: boolean;
    error?: undefined;
} | {
    version: number[];
    isLatest: boolean;
    error: unknown;
}>;
export function fetchLatestWaWebVersion(options?: {}): Promise<{
    version: number[];
    isLatest: boolean;
    error?: undefined;
} | {
    version: number[];
    isLatest: boolean;
    error: unknown;
}>;
export function generateMdTagPrefix(): string;
export function getStatusFromReceiptType(type: any): any;
export function getErrorCodeFromStreamError(node: any): {
    reason: any;
    statusCode: number;
};
export function getCallStatusFromNode({ tag, attrs }: {
    tag: any;
    attrs: any;
}): string;
export function getCodeFromWSError(error: any): number;
export function isWABusinessPlatform(platform: any): boolean;
//# sourceMappingURL=generics.d.ts.map
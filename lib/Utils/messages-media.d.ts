/** generates all the keys required to encrypt/decrypt & sign a media message */
export function getMediaKeys(buffer: any, mediaType: any): Promise<{
    iv: any;
    cipherKey: any;
    macKey: any;
}>;
export function getAudioDuration(buffer: any): Promise<any>;
/**
  referenced from and modifying https://github.com/wppconnect-team/wa-js/blob/main/src/chat/functions/prepareAudioWaveform.ts
 */
export function getAudioWaveform(buffer: any, logger: any): Promise<Uint8Array<ArrayBuffer> | undefined>;
/** generates a thumbnail for a given media, if required */
export function generateThumbnail(file: any, mediaType: any, options: any): Promise<{
    thumbnail: any;
    originalImageDimensions: {
        width: any;
        height: any;
    } | undefined;
}>;
export function extensionForMediaMessage(message: any): any;
export function getImageProcessingLibrary(): Promise<any>;
export function hkdfInfoKey(type: any): string;
export function getRawMediaUploadData(media: any, mediaType: any, logger: any): Promise<{
    filePath: any;
    fileSha256: any;
    fileLength: number;
}>;
export function extractVideoThumb(path: any, time: any, size: any): Promise<any>;
export function extractImageThumb(bufferOrFilePath: any, width?: number): Promise<{
    buffer: any;
    original: {
        width: any;
        height: any;
    };
}>;
export function encodeBase64EncodedStringForUpload(b64: any): string;
export function generateProfilePicture(mediaUpload: any, dimensions: any): Promise<{
    img: any;
}>;
export function mediaMessageSHA256B64(message: any): any;
export function toReadable(buffer: any): any;
export function toBuffer(stream: any): Promise<any>;
export function getStream(item: any, opts: any): Promise<{
    stream: any;
    type: string;
}>;
export function getHttpStream(url: any, options?: {}): Promise<any>;
export function encryptedStream(media: any, mediaType: any, { logger, saveOriginalFileIfRequired, opts }?: {}): Promise<{
    mediaKey: any;
    originalFilePath: any;
    encFilePath: any;
    mac: any;
    fileEncSha256: any;
    fileSha256: any;
    fileLength: number;
}>;
export function getUrlFromDirectPath(directPath: any): string;
export function downloadContentFromMessage({ mediaKey, directPath, url }: {
    mediaKey: any;
    directPath: any;
    url: any;
}, type: any, opts?: {}): Promise<any>;
export function downloadEncryptedContent(downloadUrl: any, { cipherKey, iv }: {
    cipherKey: any;
    iv: any;
}, { startByte, endByte, options }?: {}): Promise<any>;
export function uploadWithNodeHttp({ url, filePath, headers, timeoutMs, agent }: {
    url: any;
    filePath: any;
    headers: any;
    timeoutMs: any;
    agent: any;
}, redirectCount?: number): Promise<any>;
export function getWAUploadToServer({ customUploadHosts, fetchAgent, logger, options }: {
    customUploadHosts: any;
    fetchAgent: any;
    logger: any;
    options: any;
}, refreshMediaConn: any): (filePath: any, { mediaType, fileEncSha256B64, timeoutMs, newsletter }: {
    mediaType: any;
    fileEncSha256B64: any;
    timeoutMs: any;
    newsletter: any;
}) => Promise<{
    mediaUrl: any;
    directPath: any;
    meta_hmac: any;
    fbid: any;
    ts: any;
    thumbnailDirectPath: any;
    thumbnailSha256: any;
}>;
export function encryptMediaRetryRequest(key: any, mediaKey: any, meId: any): {
    tag: string;
    attrs: {
        id: any;
        to: string;
        type: string;
    };
    content: ({
        tag: string;
        attrs: {
            jid?: undefined;
            from_me?: undefined;
            participant?: undefined;
        };
        content: {
            tag: string;
            attrs: {};
            content: any;
        }[];
    } | {
        tag: string;
        attrs: {
            jid: any;
            from_me: string;
            participant: any;
        };
        content?: undefined;
    })[];
};
export function decodeMediaRetryNode(node: any): {
    key: {
        id: any;
        remoteJid: any;
        fromMe: boolean;
        participant: any;
    };
};
export function decryptMediaRetryData({ ciphertext, iv }: {
    ciphertext: any;
    iv: any;
}, mediaKey: any, msgId: any): proto.MediaRetryNotification;
export function getStatusCodeForMediaRetry(code: any): any;
import { proto } from '../../WAProto/index.js';
//# sourceMappingURL=messages-media.d.ts.map
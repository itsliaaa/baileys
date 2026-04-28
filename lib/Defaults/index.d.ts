export const UNAUTHORIZED_CODES: number[];
export const BIZ_BOT_SUPPORT_PAYLOAD: "{\"version\":1,\"is_ai_message\":true,\"should_upload_client_logs\":false,\"should_show_system_message\":false,\"ticket_id\":\"7004947587700716\",\"citation_items\":[],\"ticket_locale\":\"us\"}";
export const DEFAULT_ORIGIN: "https://web.whatsapp.com";
export const CALL_VIDEO_PREFIX: "https://call.whatsapp.com/video/";
export const CALL_AUDIO_PREFIX: "https://call.whatsapp.com/voice/";
export const DEF_CALLBACK_PREFIX: "CB:";
export const DEF_TAG_PREFIX: "TAG:";
export const DONATE_URL: "https://saweria.co/itsliaaa";
export const LIBRARY_NAME: "itsliaaa/baileys";
export const PHONE_CONNECTION_CB: "CB:Pong";
export const WA_ADV_ACCOUNT_SIG_PREFIX: any;
export const WA_ADV_DEVICE_SIG_PREFIX: any;
export const WA_ADV_HOSTED_ACCOUNT_SIG_PREFIX: any;
export const WA_ADV_HOSTED_DEVICE_SIG_PREFIX: any;
export const WA_DEFAULT_EPHEMERAL: number;
/** Status messages older than 24 hours are considered expired */
export const STATUS_EXPIRY_SECONDS: number;
/** WA Web enforces a 14-day maximum age for placeholder resend requests */
export const PLACEHOLDER_MAX_AGE_SECONDS: number;
export const NOISE_MODE: "Noise_XX_25519_AESGCM_SHA256\0\0\0\0";
export const DICT_VERSION: 3;
export const KEY_BUNDLE_TYPE: any;
export const NOISE_WA_HEADER: any;
export const LEXER_REGEX: RegExp;
/** from: https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url */
export const URL_REGEX: RegExp;
export namespace WA_CERT_DETAILS {
    let SERIAL: number;
    let ISSUER: string;
    let PUBLIC_KEY: any;
}
export const PROCESSABLE_HISTORY_TYPES: proto.HistorySync.HistorySyncType[];
export namespace DEFAULT_CONNECTION_CONFIG {
    export { version };
    export let browser: any[];
    export let waWebSocketUrl: string;
    export let connectTimeoutMs: number;
    export let keepAliveIntervalMs: number;
    export let logger: any;
    export let emitOwnEvents: boolean;
    export let defaultQueryTimeoutMs: number;
    export let customUploadHosts: never[];
    export let retryRequestDelayMs: number;
    export let maxMsgRetryCount: number;
    export let fireInitQueries: boolean;
    export let auth: undefined;
    export let markOnlineOnConnect: boolean;
    export let syncFullHistory: boolean;
    export function patchMessageBeforeSending(msg: any): any;
    export function shouldSyncHistoryMessage({ syncType }: {
        syncType: any;
    }): boolean;
    export function shouldIgnoreJid(): boolean;
    export let linkPreviewImageThumbnailWidth: number;
    export namespace transactionOpts {
        let maxCommitRetries: number;
        let delayBetweenTriesMs: number;
    }
    export let generateHighQualityLinkPreview: boolean;
    export let enableAutoSessionRecreation: boolean;
    export let enableRecentMessageCache: boolean;
    export let options: {};
    export namespace appStateMacVerification {
        let patch: boolean;
        let snapshot: boolean;
    }
    export let countryCode: string;
    export function getMessage(): Promise<undefined>;
    export function cachedGroupMetadata(): Promise<undefined>;
    export { makeLibSignalRepository as makeSignalRepository };
}
export const MEDIA_PATH_MAP: {
    image: string;
    video: string;
    document: string;
    audio: string;
    sticker: string;
    'sticker-pack': string;
    'thumbnail-sticker-pack': string;
    'thumbnail-link': string;
    'product-catalog-image': string;
    'md-app-state': string;
    'md-msg-hist': string;
    'biz-cover-photo': string;
};
export const NEWSLETTER_MEDIA_PATH_MAP: {
    image: string;
    video: string;
    document: string;
    audio: string;
    sticker: string;
    'thumbnail-link': string;
};
export const MEDIA_HKDF_KEY_MAPPING: {
    audio: string;
    document: string;
    gif: string;
    image: string;
    ppic: string;
    product: string;
    ptt: string;
    'sticker-pack': string;
    'thumbnail-sticker-pack': string;
    sticker: string;
    video: string;
    'thumbnail-document': string;
    'thumbnail-image': string;
    'thumbnail-video': string;
    'thumbnail-link': string;
    'md-msg-hist': string;
    'md-app-state': string;
    'product-catalog-image': string;
    'payment-bg-image': string;
    ptv: string;
    'biz-cover-photo': string;
};
export const MEDIA_KEYS: string[];
/** 120s timeout for history sync stall detection, same as WA Web's handleChunkProgress / restartPausedTimer (g = 120) */
export const HISTORY_SYNC_PAUSED_TIMEOUT_MS: 120000;
export const MIN_PREKEY_COUNT: 5;
export const INITIAL_PREKEY_COUNT: 812;
export const UPLOAD_TIMEOUT: 30000;
export const MIN_UPLOAD_INTERVAL: 5000;
export namespace DEFAULT_CACHE_TTLS {
    let SIGNAL_STORE: number;
    let MSG_RETRY: number;
    let CALL_OFFER: number;
    let USER_DEVICES: number;
}
export namespace TimeMs {
    let Minute: number;
    let Hour: number;
    let Day: number;
    let Week: number;
}
export namespace BOT_RENDERING_CONFIG_METADATA {
    let bloksVersioningId: string;
    let pixelDensity: number;
}
import { proto } from '../../WAProto/index.js';
declare const version: number[];
import { makeLibSignalRepository } from '../Signal/libsignal.js';
export {};
//# sourceMappingURL=index.d.ts.map
/**
 * Decrypt a poll vote
 * @param vote encrypted vote
 * @param ctx additional info about the poll required for decryption
 * @returns list of SHA256 options
 */
export function decryptPollVote({ encPayload, encIv }: {
    encPayload: any;
    encIv: any;
}, { pollCreatorJid, pollMsgId, pollEncKey, voterJid }: {
    pollCreatorJid: any;
    pollMsgId: any;
    pollEncKey: any;
    voterJid: any;
}): proto.Message.PollVoteMessage;
/**
 * Decrypt an event response
 * @param response encrypted event response
 * @param ctx additional info about the event required for decryption
 * @returns event response message
 */
export function decryptEventResponse({ encPayload, encIv }: {
    encPayload: any;
    encIv: any;
}, { eventCreatorJid, eventMsgId, eventEncKey, responderJid }: {
    eventCreatorJid: any;
    eventMsgId: any;
    eventEncKey: any;
    responderJid: any;
}): proto.Message.EventResponseMessage;
export function cleanMessage(message: any, meId: any, meLid: any): void;
export function isRealMessage(message: any): boolean;
export function shouldIncrementChatUnread(message: any): boolean;
export function getChatId({ remoteJid, participant, fromMe }: {
    remoteJid: any;
    participant: any;
    fromMe: any;
}): any;
export default processMessage;
import { proto } from '../../WAProto/index.js';
declare function processMessage(message: any, { shouldProcessHistoryMsg, placeholderResendCache, ev, creds, signalRepository, keyStore, logger, options, getMessage }: {
    shouldProcessHistoryMsg: any;
    placeholderResendCache: any;
    ev: any;
    creds: any;
    signalRepository: any;
    keyStore: any;
    logger: any;
    options: any;
    getMessage: any;
}): Promise<void>;
//# sourceMappingURL=process-message.d.ts.map
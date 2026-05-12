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
/**
 * Decrypt a `secretEncryptedMessage` carrying a `MESSAGE_EDIT` payload.
 *
 * WhatsApp started wrapping message edits in an E2EE envelope (May 2026).
 * The new content is encrypted with a key derived from the original
 * message's `messageContextInfo.messageSecret` using HKDF-SHA256
 * + AES-256-GCM, same family as polls and event responses but with
 * different constants (validated against live WhatsApp Android traffic):
 *
 *   info = msgId || origSenderJid || editorJid || "Message Edit"
 *   aad  = (empty)              <-- differs from Poll Vote / Event Response
 *   key  = HKDF-SHA256(salt=zeros, ikm=messageSecret, info, L=32)
 *
 * The decrypted plaintext is a regular `proto.Message` whose
 * `protocolMessage.editedMessage` field holds the new content — same
 * shape as the legacy `protocolMessage.editedMessage` edit path, so
 * consumers can treat the result identically.
 *
 * @param edit encrypted edit payload (encPayload + encIv from SecretEncryptedMessage)
 * @param ctx info about the original message required for decryption
 * @returns decoded outer `Message` whose `protocolMessage.editedMessage`
 *   carries the new content (extendedTextMessage / conversation / etc.)
 */
export function decryptMessageEdit({ encPayload, encIv }: {
    encPayload: any;
    encIv: any;
}, { originalSenderJid, originalMsgId, editEncKey, editorJid }: {
    originalSenderJid: any;
    originalMsgId: any;
    editEncKey: any;
    editorJid: any;
}): proto.Message;
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
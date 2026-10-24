/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
export function getAggregateVotesInPollMessage({ message, pollUpdates }: {
    message: any;
    pollUpdates: any;
}, meId: any): any[];
/**
 * Aggregates all event responses in an event message.
 * @param msg the event creation message
 * @param meId your jid
 * @returns A list of response types & their responders
 */
export function getAggregateResponsesInEventMessage({ eventResponses }: {
    eventResponses: any;
}, meId: any): any[];
export function extractUrlFromText(text: any): any;
export function generateLinkPreviewIfRequired(text: any, getUrlInfo: any, logger: any): Promise<any>;
export function prepareWAMessageMedia(message: any, options: any): Promise<proto.Message>;
export function prepareDisappearingMessageSettingContent(ephemeralExpiration: any): proto.Message;
export function generateForwardMessageContent(message: any, forceForward: any): any;
export function hasNonNullishProperty(message: any, key: any): boolean;
export function hasOptionalProperty(obj: any, key: any): boolean;
export function hasValidAlbumMedia(message: any): boolean;
export function hasValidInteractiveHeader(message: any): boolean;
export function hasValidCarouselHeader(message: any): boolean;
export function markViewOnce(m: any): void;
export function generateWAMessageContent(message: any, options: any): Promise<any>;
export function generateWAMessageFromContent(jid: any, message: any, options: any): proto.WebMessageInfo;
export function generateWAMessage(jid: any, content: any, options: any): Promise<proto.WebMessageInfo>;
export function getContentType(content: any): string | undefined;
export function normalizeMessageContent(content: any): any;
export function extractMessageContent(content: any): any;
export function getDevice(id: any): "unknown" | "android" | "web" | "ios" | "desktop";
export function updateMessageWithReceipt(msg: any, receipt: any): void;
export function updateMessageWithReaction(msg: any, reaction: any): void;
export function updateMessageWithPollUpdate(msg: any, update: any): void;
export function updateMessageWithEventResponse(msg: any, update: any): void;
export function aggregateMessageKeysNotFromMe(keys: any): any[];
export function downloadMediaMessage(message: any, type: any, options: any, ctx: any): Promise<any>;
export function assertMediaContent(content: any): any;
export function shouldIncludeBizBinaryNode(message: any): boolean;
import { proto } from '../../WAProto/index.js';

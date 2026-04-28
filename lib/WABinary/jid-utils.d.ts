export const S_WHATSAPP_NET: "@s.whatsapp.net";
export const OFFICIAL_BIZ_JID: "16505361212@c.us";
export const SERVER_JID: "server@c.us";
export const PSA_WID: "0@c.us";
export const STORIES_JID: "status@broadcast";
export const META_AI_JID: "13135550002@c.us";
export const WAJIDDomains: any;
export function getServerFromDomainType(initialServer: any, domainType: any): any;
export function jidEncode(user: any, server: any, device: any, agent: any): string;
export function jidDecode(jid: any): {
    server: any;
    user: any;
    domainType: any;
    device: number | undefined;
} | undefined;
export function areJidsSameUser(jid1: any, jid2: any): boolean;
export function isJidMetaAI(jid: any): any;
export function isPnUser(jid: any): any;
export function isLidUser(jid: any): any;
export function isJidBroadcast(jid: any): any;
export function isJidGroup(jid: any): any;
export function isJidStatusBroadcast(jid: any): boolean;
export function isJidNewsletter(jid: any): any;
export function isHostedPnUser(jid: any): any;
export function isHostedLidUser(jid: any): any;
export function isJidBot(jid: any): any;
export function jidNormalizedUser(jid: any): string;
export function transferDevice(fromJid: any, toJid: any): string;
//# sourceMappingURL=jid-utils.d.ts.map
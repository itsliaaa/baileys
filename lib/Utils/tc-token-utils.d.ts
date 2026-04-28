/** Read the persisted tctoken JID index and return its entries (never contains the sentinel key itself). */
export function readTcTokenIndex(keys: any): Promise<any[]>;
/** Build a SignalDataSet fragment that writes the merged index (persisted ∪ added) under the sentinel key. */
export function buildMergedTcTokenIndexWrite(keys: any, addedJids: any): Promise<{
    __index: {
        token: any;
    };
}>;
export function isTcTokenExpired(timestamp: any): boolean;
export function shouldSendNewTcToken(senderTimestamp: any): boolean;
/** Resolve JID to LID for tctoken storage (WA Web stores under LID) */
export function resolveTcTokenJid(jid: any, getLIDForPN: any): Promise<any>;
/** Resolve target JID for issuing privacy token based on AB prop 14303 */
export function resolveIssuanceJid(jid: any, issueToLid: any, getLIDForPN: any, getPNForLID: any): Promise<any>;
export function buildTcTokenFromJid({ authState, jid, baseContent, getLIDForPN }: {
    authState: any;
    jid: any;
    baseContent?: never[] | undefined;
    getLIDForPN: any;
}): Promise<any[] | undefined>;
export function storeTcTokensFromIqResult({ result, fallbackJid, keys, getLIDForPN, onNewJidStored }: {
    result: any;
    fallbackJid: any;
    keys: any;
    getLIDForPN: any;
    onNewJidStored: any;
}): Promise<void>;
/** Sentinel key under `tctoken` store holding a JSON array of tracked storage JIDs for cross-session pruning. */
export const TC_TOKEN_INDEX_KEY: "__index";
//# sourceMappingURL=tc-token-utils.d.ts.map
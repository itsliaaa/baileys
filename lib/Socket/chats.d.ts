export function makeChatsSocket(config: any): {
    serverProps: {
        /** AB prop 10518: gate tctoken on 1:1 messages. Default true (safe: avoids 463). */
        privacyTokenOn1to1: boolean;
        /** AB prop 9666: gate tctoken on profile picture IQs. WA Web default: true. */
        profilePicPrivacyToken: boolean;
        /** AB prop 14303: issue tctokens to LID instead of PN. WA Web default: false. */
        lidTrustedTokenIssueToLid: boolean;
    };
    createCallLink: (type: any, event: any, timeoutMs: any) => Promise<any>;
    getBotListV2: () => Promise<{
        jid: any;
        personaId: any;
    }[]>;
    messageMutex: {
        mutex(code: any): any;
    };
    receiptMutex: {
        mutex(code: any): any;
    };
    appStatePatchMutex: {
        mutex(code: any): any;
    };
    notificationMutex: {
        mutex(code: any): any;
    };
    fetchPrivacySettings: (force?: boolean) => Promise<any>;
    upsertMessage: (...args: any[]) => Promise<any>;
    appPatch: (patchCreate: any) => Promise<void>;
    sendPresenceUpdate: (type: any, toJid: any) => Promise<void>;
    presenceSubscribe: (toJid: any) => Promise<void>;
    profilePictureUrl: (jid: any, type: string | undefined, timeoutMs: any) => Promise<any>;
    fetchBlocklist: () => Promise<any>;
    fetchStatus: (...jids: any[]) => Promise<any>;
    fetchDisappearingDuration: (...jids: any[]) => Promise<any>;
    findUserId: (pnLid: any) => Promise<any>;
    updateProfilePicture: (jid: any, content: any, dimensions: any) => Promise<void>;
    removeProfilePicture: (jid: any) => Promise<void>;
    updateProfileStatus: (status: any) => Promise<void>;
    updateProfileName: (name: any) => Promise<void>;
    updateBlockStatus: (jid: any, action: any) => Promise<void>;
    updateDisableLinkPreviewsPrivacy: (isPreviewsDisabled: any) => Promise<void>;
    updateCallPrivacy: (value: any) => Promise<void>;
    updateMessagesPrivacy: (value: any) => Promise<void>;
    updateLastSeenPrivacy: (value: any) => Promise<void>;
    updateOnlinePrivacy: (value: any) => Promise<void>;
    updateProfilePicturePrivacy: (value: any) => Promise<void>;
    updateStatusPrivacy: (value: any) => Promise<void>;
    updateReadReceiptsPrivacy: (value: any) => Promise<void>;
    updateGroupsAddPrivacy: (value: any) => Promise<void>;
    updateDefaultDisappearingMode: (duration: any) => Promise<void>;
    getBusinessProfile: (jid: any) => Promise<{
        wid: any;
        address: any;
        description: any;
        website: any[];
        email: any;
        category: any;
        business_hours: {
            timezone: any;
            business_config: any;
        };
    } | undefined>;
    resyncAppState: (...args: any[]) => Promise<any>;
    chatModify: (mod: any, jid: any) => Promise<void>;
    cleanDirtyBits: (type: any, fromTimestamp: any) => Promise<void>;
    addOrEditContact: (jid: any, contact: any) => Promise<void>;
    removeContact: (jid: any) => Promise<void>;
    addLabel: (jid: any, labels: any) => Promise<void>;
    addChatLabel: (jid: any, labelId: any) => Promise<void>;
    removeChatLabel: (jid: any, labelId: any) => Promise<void>;
    addMessageLabel: (jid: any, messageId: any, labelId: any) => Promise<void>;
    removeMessageLabel: (jid: any, messageId: any, labelId: any) => Promise<void>;
    star: (jid: any, messages: any, star: any) => Promise<void>;
    addOrEditQuickReply: (quickReply: any) => Promise<void>;
    removeQuickReply: (timestamp: any) => Promise<void>;
    type: string;
    ws: import("./Client/websocket.js").WebSocketClient;
    ev: {
        process(handler: any): () => void;
        emit(event: any, evData: any): any;
        isBuffering(): boolean;
        buffer: () => void;
        flush: () => boolean;
        createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
        on: (...args: any[]) => any;
        off: (...args: any[]) => any;
        removeAllListeners: (...args: any[]) => any;
        destroy(): void;
    };
    authState: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<any>;
            set: (data: any) => Promise<void>;
            isInTransaction: () => boolean;
            transaction: (work: any, key: any) => Promise<any>;
        };
    };
    signalRepository: any;
    user: any;
    generateMessageTag: () => string;
    query: (node: any, timeoutMs: any) => Promise<any>;
    waitForMessage: (msgId: any, timeoutMs?: any) => Promise<any>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: any) => Promise<void>;
    sendNode: (frame: any) => Promise<void>;
    logout: (msg: any) => Promise<void>;
    end: (error: any) => Promise<void>;
    registerSocketEndHandler: (handler: any) => void;
    onUnexpectedError: (err: any, msg: any) => void;
    uploadPreKeys: (count?: number, retryCount?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    digestKeyBundle: () => Promise<void>;
    rotateSignedPreKey: () => Promise<void>;
    requestPairingCode: (phoneNumber: any, customPairingCode: any) => Promise<any>;
    updateServerTimeOffset: ({ attrs }: {
        attrs: any;
    }) => void;
    sendUnifiedSession: () => Promise<void>;
    wamBuffer: import("../index.js").BinaryInfo;
    waitForConnectionUpdate: (check: any, timeoutMs: any) => Promise<void>;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    onWhatsApp: (...phoneNumber: any[]) => Promise<any>;
};
//# sourceMappingURL=chats.d.ts.map
export function makeLtHashGenerator({ indexValueMap, hash }: {
    indexValueMap: any;
    hash: any;
}): {
    mix: ({ indexMac, valueMac, operation }: {
        indexMac: any;
        valueMac: any;
        operation: any;
    }) => void;
    finish: () => {
        hash: any;
        indexValueMap: any;
    };
};
export function newLTHashState(): {
    version: number;
    hash: any;
    indexValueMap: {};
};
export function encodeSyncdPatch({ type, index, syncAction, apiVersion, operation }: {
    type: any;
    index: any;
    syncAction: any;
    apiVersion: any;
    operation: any;
}, myAppStateKeyId: any, state: any, getAppStateSyncKey: any): Promise<{
    patch: {
        patchMac: any;
        snapshotMac: any;
        keyId: {
            id: any;
        };
        mutations: {
            operation: any;
            record: {
                index: {
                    blob: any;
                };
                value: {
                    blob: any;
                };
                keyId: {
                    id: any;
                };
            };
        }[];
    };
    state: any;
}>;
export function decodeSyncdMutations(msgMutations: any, initialState: any, getAppStateSyncKey: any, onMutation: any, validateMacs: any): Promise<{
    hash: any;
    indexValueMap: any;
}>;
export function ensureLTHashStateVersion(state: any): any;
export const MAX_SYNC_ATTEMPTS: 2;
export function isMissingKeyError(error: any): boolean;
export function isAppStateSyncIrrecoverable(error: any, attempts: any): boolean;
export function decodeSyncdPatch(msg: any, name: any, initialState: any, getAppStateSyncKey: any, onMutation: any, validateMacs: any): Promise<{
    hash: any;
    indexValueMap: any;
}>;
export function extractSyncdPatches(result: any, options: any): Promise<{}>;
export function downloadExternalBlob(blob: any, options: any): Promise<any>;
export function downloadExternalPatch(blob: any, options: any): Promise<proto.SyncdMutations>;
export function decodeSyncdSnapshot(name: any, snapshot: any, getAppStateSyncKey: any, minimumVersionNumber: any, validateMacs?: boolean): Promise<{
    state: {
        version: number;
        hash: any;
        indexValueMap: {};
    };
    mutationMap: {};
}>;
export function decodePatches(name: any, syncds: any, initial: any, getAppStateSyncKey: any, options: any, minimumVersionNumber: any, logger: any, validateMacs?: boolean): Promise<{
    state: any;
    mutationMap: {};
}>;
export function chatModificationToAppPatch(mod: any, jid: any): {
    syncAction: {
        muteAction: {
            muted: boolean;
            muteEndTimestamp: any;
        };
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        archiveChatAction: {
            archived: boolean;
            messageRange: any;
        };
        muteAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        markChatAsReadAction: {
            read: any;
            messageRange: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        deleteMessageForMeAction: {
            deleteMedia: any;
            messageTimestamp: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        clearChatAction: {
            messageRange: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        pinAction: {
            pinned: boolean;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        contactAction: any;
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        privacySettingDisableLinkPreviewsAction: any;
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: string[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        starAction: {
            starred: boolean;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        deleteChatAction: {
            messageRange: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        pushNameSetting: {
            name: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: string[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        quickReplyAction: {
            count: number;
            deleted: any;
            keywords: never[];
            message: any;
            shortcut: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        labelEditAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        labelEditAction: {
            name: any;
            color: any;
            predefinedId: any;
            deleted: any;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelAssociationAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
} | {
    syncAction: {
        labelAssociationAction: {
            labeled: boolean;
        };
        muteAction?: undefined;
        archiveChatAction?: undefined;
        markChatAsReadAction?: undefined;
        deleteMessageForMeAction?: undefined;
        clearChatAction?: undefined;
        pinAction?: undefined;
        contactAction?: undefined;
        privacySettingDisableLinkPreviewsAction?: undefined;
        starAction?: undefined;
        deleteChatAction?: undefined;
        pushNameSetting?: undefined;
        quickReplyAction?: undefined;
        labelEditAction?: undefined;
    };
    index: any[];
    type: string;
    apiVersion: number;
    operation: proto.SyncdMutation.SyncdOperation;
};
export function processSyncAction(syncAction: any, ev: any, me: any, initialSyncOpts: any, logger: any): void;
import { proto } from '../../WAProto/index.js';
//# sourceMappingURL=chat-utils.d.ts.map
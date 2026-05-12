export function tokenizeCode(code: any, language?: string): {
    highlightType: any;
    codeContent: string | undefined;
}[];
export function toUnified(submessages: any): {
    response_id: any;
    sections: any;
};
export function buildAdditionalBotMetadataContext(submessages: any): {
    sources: {
        provider: number;
        thumbnailCdnUrl: any;
        sourceProviderUrl: any;
        sourceQuery: string;
        faviconCdnUrl: string;
        citationNumber: number;
        sourceTitle: any;
    }[];
    mediaDetailsMetadataList: {
        id: any;
        previewMedia: {
            fileSha256: string;
            mediaKey: string;
            fileEncSha256: string;
            directPath: string;
            mediaKeyTimestamp: number;
            mimetype: string;
        };
    }[];
};
export function prepareRichResponseMessage(content: any): {
    messageContextInfo: {
        botMessageSecret: any;
        botMetadata: {
            pluginMetadata: {};
            verificationMetadata: {
                proofs: {
                    certificateChain: Uint8Array<ArrayBuffer>[];
                    version: number;
                    useCase: number;
                    signature: Uint8Array<ArrayBuffer>;
                }[];
            };
            botRenderingConfigMetadata: {
                bloksVersioningId: string;
                pixelDensity: number;
            };
        };
    };
    botForwardedMessage: {
        message: {
            richResponseMessage: any;
        };
    };
};
export function botMetadataSignature(): Uint8Array<ArrayBuffer>;
export function botMetadataCertificate(length?: number): Uint8Array<ArrayBuffer>;
export function wrapToBotForwardedMessage(richResponseMessage: any): {
    messageContextInfo: {
        botMessageSecret: any;
        botMetadata: {
            pluginMetadata: {};
            verificationMetadata: {
                proofs: {
                    certificateChain: Uint8Array<ArrayBuffer>[];
                    version: number;
                    useCase: number;
                    signature: Uint8Array<ArrayBuffer>;
                }[];
            };
            botRenderingConfigMetadata: {
                bloksVersioningId: string;
                pixelDensity: number;
            };
        };
    };
    botForwardedMessage: {
        message: {
            richResponseMessage: any;
        };
    };
};
//# sourceMappingURL=rich-message-utils.d.ts.map
export function tokenizeCode(code: any, language?: string): {
    highlightType: any;
    codeContent: string | undefined;
}[];
export function toUnified(submessages: any): {
    response_id: any;
    sections: any;
};
export function prepareRichResponseMessage(content: any): {
    messageContextInfo: {
        deviceListMetadata: {
            senderAccountType: number;
        };
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
            botInfrastructureDiagnostics: {
                toolsUsed: never[];
                botBackend: number;
            };
            botModeSelectionMetadata: {
                mode: never[];
                overrideMode: number[];
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
        deviceListMetadata: {
            senderAccountType: number;
        };
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
            botInfrastructureDiagnostics: {
                toolsUsed: never[];
                botBackend: number;
            };
            botModeSelectionMetadata: {
                mode: never[];
                overrideMode: number[];
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
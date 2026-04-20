/**
 * Lia@Changes 09-04-26 [WIP]
 * Adds support for tables and code blocks with richResponseMessage (wrapped inside botForwardedMessage).
 *
 * If you use or copy this code, please credit my name or project.
 * @itsliaaa/baileys
 */
import { getRandomValues, randomUUID, randomBytes } from 'crypto';
import { BOT_RENDERING_CONFIG_METADATA, DONATE_URL, LEXER_REGEX } from '../Defaults/index.js';
import { LANGUAGE_KEYWORDS } from '../WABinary/constants.js';
import { CodeHighlightType, RichSubMessageType } from '../Types/RichType.js';
import { proto } from '../../WAProto/index.js';
import { unixTimestampSeconds } from './generics.js';
const textEncoder = new TextEncoder();
const NOOP = new Set([]);
export const tokenizeCode = (code, language = 'javascript') => {
    const keywords = LANGUAGE_KEYWORDS[language] || NOOP;
    const blocks = [];
    LEXER_REGEX.lastIndex = 0;
    let match;
    while ((match = LEXER_REGEX.exec(code)) !== null) {
        if (match[1]) {
            blocks.push({ highlightType: CodeHighlightType.COMMENT, codeContent: match[1] });
        }
        else if (match[2]) {
            blocks.push({ highlightType: CodeHighlightType.STRING, codeContent: match[2] });
        }
        else if (match[3]) {
            blocks.push({
                highlightType: keywords.has(match[3]) ? CodeHighlightType.KEYWORD : CodeHighlightType.METHOD,
                codeContent: match[3],
            });
        }
        else if (match[4]) {
            blocks.push({
                highlightType: keywords.has(match[4]) ? CodeHighlightType.KEYWORD : CodeHighlightType.DEFAULT,
                codeContent: match[4],
            });
        }
        else if (match[5]) {
            blocks.push({ highlightType: CodeHighlightType.NUMBER, codeContent: match[5] });
        }
        else {
            blocks.push({ highlightType: CodeHighlightType.DEFAULT, codeContent: match[6] });
        }
    }
    return blocks;
};
// Lia@Changes 09-04-26 --- Inject buffer into unifiedResponse.data to support proper rendering of rich messages (ex: tables and code blocks)
export const toUnified = (submessages) =>
    ({
        response_id: randomUUID(),
        sections: submessages.map((submessage, index) => {
            switch (submessage.messageType) {
                case RichSubMessageType.CODE:
                    const codeMetadata = submessage.codeMetadata;
                    return {
                        view_model: {
                            primitive: {
                                language: codeMetadata.codeLanguage,
                                code_blocks: codeMetadata.codeBlocks.map((block) => ({ content: block.codeContent, type: CodeHighlightType[block.highlightType] })),
                                __typename: 'GenAICodeUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
                case RichSubMessageType.CONTENT_ITEMS:
                    return {
                        view_model: {
                            primitives: submessage.contentItemsMetadata.itemsMetadata.map((item) => {
                                const reelItem = item.reelItem
                                return {
                                    reels_url: reelItem.videoUrl,
                                    thumbnail_url: reelItem.thumbnailUrl,
                                    creator: reelItem.creator || '@itsliaaa/baileys',
                                    avatar_url: reelItem.profileIconUrl,
                                    reels_title: reelItem.title,
                                    likes_count: reelItem.likesCount || 0,
                                    shares_count: reelItem.sharesCount || 0,
                                    view_count: reelItem.viewCount || 0,
                                    reel_source: reelItem.reelSource || 'IG',
                                    is_verified: reelItem.isVerified || false,
                                    __typename: 'GenAIReelPrimitive'
                                }
                            }),
                            __typename: 'GenAIHScrollLayoutViewModel'
                        }
                    };
                case RichSubMessageType.LATEX:
                    const latexMetadata = submessage.latexMetadata;
                    const item = {
                        latex_expression: latexMetadata.expressions[0]?.latexExpression,
                        font_height: latexMetadata.expressions[0]?.fontHeight,
                        padding: 15,
                        latex_image: {
                            url: latexMetadata.expressions[0]?.url,
                            width: latexMetadata.expressions[0]?.width || 388,
                            height: latexMetadata.expressions[0]?.height || 160
                        }
                    };
                    return {
                        view_model: {
                            primitive: {
                                item,
                                ...item,
                                __typename: 'GenAILatexUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
                case RichSubMessageType.TABLE:
                    const tableMetadata = submessage.tableMetadata;
                    return {
                        view_model: {
                            primitive: {
                                title: tableMetadata.title,
                                rows: tableMetadata.rows.map((row) => ({ is_header: row.isHeading, cells: row.items, markdown_cells: [] })),
                                __typename: 'GenATableUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
                case RichSubMessageType.TEXT:
                    const shouldAddInlineEntity = index == 0;
                    const inlineEntity = [{
                        key: 'Starseed',
                        metadata: {
                            reference_id: 1,
                            reference_url: DONATE_URL,
                            reference_title: 'For Donation via Saweria',
                            reference_display_name: 'Donate',
                            sources: [{
                                source_type: 'THIRD_PARTY',
                                source_display_name: 'Donate',
                                source_subtitle: '',
                                source_url: DONATE_URL
                            }],
                            __typename: 'GenAISearchCitationItem'
                        }
                    }];
                    const textEntity = shouldAddInlineEntity ?
                        '{{Starseed}}¹{{/Starseed}}' :
                        '';
                    return {
                        view_model: {
                            primitive: {
                                text: submessage.messageText + textEntity,
                                inline_entities: shouldAddInlineEntity ?
                                    inlineEntity :
                                    [],
                                __typename: 'GenAIMarkdownTextUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
            }
            return submessage;
        })
    });
// Lia@Note 17-04-26 --- WIP
export const buildAdditionalBotMetadataContext = (submessages) => {
    const sources = [];
    const mediaDetailsMetadataList = [];
    for (let i = 0; i < submessages.length; i++) {
        const submessage = submessages[i];
        switch (submessage.messageType) {
            case RichSubMessageType.CONTENT_ITEMS:
                const itemsMetadata = submessage.contentItemsMetadata.itemsMetadata;
                for (let n = 0; n < itemsMetadata.length; n++) {
                    const reelItem = itemsMetadata[n].reelItem;
                    sources.push({
                        provider: 0,
                        thumbnailCdnUrl: reelItem.thumbnailUrl,
                        sourceProviderUrl: reelItem.videoUrl,
                        sourceQuery: '',
                        faviconCdnUrl: '',
                        citationNumber: i + 1,
                        sourceTitle: reelItem.title
                    });
                    mediaDetailsMetadataList.push({
                        id: randomBytes(32).toString('hex'),
                        previewMedia: {
                            fileSha256: '',
                            mediaKey: '',
                            fileEncSha256: '',
                            directPath: '',
                            mediaKeyTimestamp: unixTimestampSeconds(),
                            mimetype: 'image/jpeg'
                        }
                    });
                }
                break;
            case RichSubMessageType.LATEX:
                const expressions = submessage.latexMetadata.expressions;
                for (let n = 0; n < expressions.length; n++) {
                    const expression = expressions[n];
                    mediaDetailsMetadataList.push({
                        id: randomBytes(32).toString('hex'),
                        previewMedia: {
                            fileSha256: '',
                            mediaKey: '',
                            fileEncSha256: '',
                            directPath: '',
                            mediaKeyTimestamp: unixTimestampSeconds(),
                            mimetype: 'image/jpeg'
                        }
                    });
                }
                break;
        }
    }
    return { sources, mediaDetailsMetadataList };
}
export const prepareRichResponseMessage = (content) => {
    const { code, contentText, expressions, footerText, headerText, items, language, richResponse, table, text, title } = content;
    let submessages = [];
    if (Array.isArray(richResponse)) {
        submessages = richResponse.map((submessage) => {
            if (submessage.text) {
                return {
                    messageType: RichSubMessageType.TEXT,
                    messageText: submessage.text
                };
            }
            else if (submessage.code) {
                return {
                    messageType: RichSubMessageType.CODE,
                    codeMetadata: {
                        codeLanguage: submessage.language,
                        codeBlocks: submessage.code
                    }
                };
            }
            else if (submessage.expressions) {
                return {
                    messageType: RichSubMessageType.LATEX,
                    latexMetadata: {
                        text: submessage.text,
                        expressions: submessage.expressions
                    }
                };
            }
            else if (submessage.items) {
                return {
                    messageType: RichSubMessageType.CONTENT_ITEMS,
                    contentItemsMetadata: {
                        itemsMetadata: submessage.items
                    }
                };
            }
            else if (submessage.table) {
                return {
                    messageType: RichSubMessageType.TABLE,
                    tableMetadata: {
                        title: submessage.title,
                        rows: submessage.table
                    }
                };
            }
            return submessage;
        });
    }
    else {
        if (headerText) {
            submessages.push({
                messageType: RichSubMessageType.TEXT,
                messageText: headerText
            });
        }
        if (contentText) {
            submessages.push({
                messageType: RichSubMessageType.TEXT,
                messageText: contentText
            });
        }
        if (code) {
            language ??= 'javascript';
            submessages.push({
                messageType: RichSubMessageType.CODE,
                codeMetadata: {
                    codeLanguage: language,
                    codeBlocks: tokenizeCode(code, language)
                }
            });
        }
        else if (expressions) {
            submessages.push({
                messageType: RichSubMessageType.LATEX,
                latexMetadata: {
                    text,
                    expressions
                }
            });
        }
        else if (items) {
            submessages.push({
                messageType: RichSubMessageType.CONTENT_ITEMS,
                contentItemsMetadata: {
                    itemsMetadata: items.map((item) => ({ reelItem: item })),
                    contentType: proto.AIRichResponseContentItemsMetadata.ContentType.CAROUSEL
                }
            });
        }
        else if (table) {
            const tableRows = table.map((items, index) => ({
                isHeading: index == 0,
                items
            }));
            submessages.push({
                messageType: RichSubMessageType.TABLE,
                tableMetadata: {
                    title,
                    rows: tableRows
                }
            });
        }
        if (footerText) {
            submessages.push({
                messageType: RichSubMessageType.TEXT,
                messageText: footerText
            });
        }
    }
    const unified = toUnified(submessages);
    const message = wrapToBotForwardedMessage({
        submessages,
        messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
        unifiedResponse: {
            data: textEncoder.encode(JSON.stringify(unified))
        },
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
            forwardOrigin: 4
        }
    });
    // Lia@Note 17-04-26 --- TODO: Fill mediaDetailsMetadataList and sources field
    const { sources, mediaDetailsMetadataList } = buildAdditionalBotMetadataContext(submessages);
    const botMetadata = message.messageContextInfo.botMetadata;
    if (sources.length > 0) {
        botMetadata.richResponseSourcesMetadata = { sources };
    }
    if (mediaDetailsMetadataList.length > 0) {
        botMetadata.unifiedResponseMutation = { mediaDetailsMetadataList };
    }
    return message;
}
// Lia@Note 17-04-26 --- signature and certificateChain for proofs[] field
export const botMetadataSignature = () => {
    const signature = new Uint8Array(64);
    getRandomValues(signature);
    return signature;
}
export const botMetadataCertificate = (length = 700) => {
    const certificate = new Uint8Array(length);
    certificate[0] = 48;
    certificate[1] = 130;
    getRandomValues(certificate.subarray(2));
    return certificate;
}
export const wrapToBotForwardedMessage = (richResponseMessage) =>
    ({
        messageContextInfo: {
            botMetadata: {
                pluginMetadata: {},
                // Lia@Note 09-04-26 --- TODO: Fill verificationMetadata field
                verificationMetadata: {
                    proofs: [
                        {
                            certificateChain: [
                                botMetadataCertificate(684),
                                botMetadataCertificate(892)
                            ],
                            version: 1,
                            useCase: 1,
                            signature: botMetadataSignature()
                        }
                    ]
                },
                botRenderingConfigMetadata: BOT_RENDERING_CONFIG_METADATA
            }
        },
        botForwardedMessage: {
            message: { richResponseMessage }
        }
    });
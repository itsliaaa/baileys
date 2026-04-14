/**
 * Lia@Changes 09-04-26 [WIP]
 * Adds support for tables and code blocks with richResponseMessage (wrapped inside botForwardedMessage).
 *
 * If you use or copy this code, please credit my name or project.
 */
import { randomUUID } from 'crypto';
import { FORWARDED_AI_BOT_INFO, LEXER_REGEX } from '../Defaults/index.js';
import { CodeHighlightType, RichSubMessageType } from '../Types/RichType.js';
const textEncoder = new TextEncoder();
const CPP_KEYWORDS = new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case',
    'catch', 'char', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
    'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete',
    'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float',
    'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
    'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register',
    'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
    'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try',
    'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile',
    'wchar_t', 'while', 'xor', 'xor_eq'
]);
const CSS_KEYWORDS = new Set([
    'import', 'media', 'font-face', 'keyframes', 'supports', 'charset',
    'important', 'root', 'hover', 'active', 'focus', 'visited', 'before', 'after',
    'not', 'nth-child', 'first-child', 'last-child', 'only-child',
    'none', 'inherit', 'initial', 'unset', 'auto', 'transparent', 'currentcolor'
]);
const GO_KEYWORDS = new Set([
    'break', 'default', 'func', 'interface', 'select', 'case', 'defer', 'go', 'map', 'struct',
    'chan', 'else', 'goto', 'package', 'switch', 'const', 'fallthrough', 'if', 'range', 'type',
    'continue', 'for', 'import', 'return', 'var', 'true', 'false', 'nil'
]);
const HTML_KEYWORDS = new Set([
    'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
    'header', 'footer', 'main', 'section', 'article', 'aside', 'nav',
    'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'form', 'input', 'button', 'select', 'textarea', 'label', 'option',
    'canvas', 'svg', 'iframe', 'video', 'audio', 'source'
]);
const JS_KEYWORDS = new Set([
    'import', 'export', 'from', 'default', 'as',
    'const', 'let', 'var', 'function', 'class', 'extends', 'new',
    'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'try', 'catch', 'finally', 'throw',
    'async', 'await', 'yield',
    'typeof', 'instanceof', 'in', 'of', 'delete', 'void',
    'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
    'this', 'super', 'static', 'get', 'set',
    'debugger', 'with'
]);
const PYTHON_KEYWORDS = new Set([
    'import', 'from', 'as', 'def', 'class', 'return', 'if', 'elif', 'else',
    'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise',
    'with', 'yield', 'lambda', 'pass', 'del', 'global', 'nonlocal', 'assert',
    'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'async', 'await',
    'self', 'print'
]);
const RUST_KEYWORDS = new Set([
    'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern', 'false', 'fn', 'for',
    'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return',
    'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use',
    'where', 'while', 'async', 'await', 'dyn', 'abstract', 'become', 'box', 'do', 'final',
    'macro', 'override', 'priv', 'typeof', 'unsized', 'virtual', 'yield'
]);
const NOOP = new Set([]);
export const LANGUAGE_KEYWORDS = {
    css: CSS_KEYWORDS,
    html: HTML_KEYWORDS,
    javascript: JS_KEYWORDS,
    typescript: JS_KEYWORDS,
    js: JS_KEYWORDS,
    ts: JS_KEYWORDS,
    python: PYTHON_KEYWORDS,
    py: PYTHON_KEYWORDS,
    go: GO_KEYWORDS,
    golang: GO_KEYWORDS,
    cpp: CPP_KEYWORDS,
    'c++': CPP_KEYWORDS,
    rust: RUST_KEYWORDS,
    rs: RUST_KEYWORDS,
};
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
const toUnified = (submessages) =>
    ({
        response_id: randomUUID(),
        sections: submessages.map((submessage) => {
            switch (submessage.messageType) {
                case RichSubMessageType.TEXT:
                    return {
                        view_model: {
                            primitive: { text: submessage.messageText, inline_entities: [], __typename: 'GenAIMarkdownTextUXPrimitive' },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
                case RichSubMessageType.TABLE:
                    return {
                        view_model: {
                            primitive: {
                                title: submessage.tableMetadata.title,
                                rows: submessage.tableMetadata.rows.map((row) => ({ is_header: row.isHeading, cells: row.items })),
                                __typename: 'GenATableUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
                case RichSubMessageType.CODE:
                    return {
                        view_model: {
                            primitive: {
                                language: submessage.codeMetadata.codeLanguage,
                                code_blocks: submessage.codeMetadata.codeBlocks.map((block) => ({ content: block.codeContent, type: CodeHighlightType[block.highlightType] })),
                                __typename: 'GenAICodeUXPrimitive'
                            },
                            __typename: 'GenAISingleLayoutViewModel'
                        }
                    };
            }
            return submessage;
        })
    });
export const prepareRichCodeBlock = ({ header, code, footer, language } = {}) => {
    language ??= 'javascript';
    const submessages = [];
    if (header) {
        submessages.push({
           messageType: 2,
           messageText: header
        });
    }
    submessages.push({
        messageType: 5,
        codeMetadata: {
            codeLanguage: language,
            codeBlocks: tokenizeCode(code, language)
        }
    });
    if (footer) {
        submessages.push({
            messageType: 2,
            messageText: footer
        });
    }
    const unified = toUnified(submessages);
    return {
        submessages,
        messageType: 1,
        unifiedResponse: {
            data: textEncoder.encode(JSON.stringify(unified))
        },
        contextInfo: FORWARDED_AI_BOT_INFO
    };
};
export const prepareRichTable = ({ header, title, table, footer } = {}) => {
    const tableRows = table.map((items, index) => ({
        isHeading: index == 0,
        items
    }));
    const submessages = [];
    if (header) {
        submessages.push({
            messageType: 2,
            messageText: header
        });
    }
    submessages.push({
        messageType: 4,
        tableMetadata: {
            title,
            rows: tableRows
        }
    });
    if (footer) {
        submessages.push({
            messageType: 2,
            messageText: footer
        });
    }
    const unified = toUnified(submessages);
    return {
        submessages,
        messageType: 1,
        unifiedResponse: {
            data: textEncoder.encode(JSON.stringify(unified))
        },
        contextInfo: FORWARDED_AI_BOT_INFO
    };
};
export const prepareRichResponseMessage = (content) => {
    const submessages = content.map((submessage) => {
        if (submessage.text) {
            return {
                messageType: 2,
                messageText: submessage.text
            };
        }
        else if (submessage.code) {
            return {
                messageType: 5,
                codeMetadata: {
                    codeLanguage: submessage.language,
                    codeBlocks: submessage.code
                }
            };
        }
        else if (submessage.table) {
            return {
                messageType: 4,
                tableMetadata: {
                    title: submessage.title,
                    rows: submessage.table
                }
            };
        }
        return submessage;
    });
    const unified = toUnified(submessages);
    return {
        submessages,
        messageType: 1,
        unifiedResponse: {
            data: textEncoder.encode(JSON.stringify(unified))
        },
        contextInfo: FORWARDED_AI_BOT_INFO
    };
}
export const wrapToBotForwardedMessage = (message) =>
    ({
        messageContextInfo: {
            botMetadata: {
                // Lia@Note 09-04-26 --- TODO: Fill verificationMetadata field
                verificationMetadata: {},
                botRenderingConfigMetadata: {
                    bloksVersioningId: '0903aa5f7f47de66789d5f4c86d3bd6e05e4bc3ff85e454a9f907d5ed7fef97c',
                    pixelDensity: 2.75
                }
            }
        },
        botForwardedMessage: { message }
    });
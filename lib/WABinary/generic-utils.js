import { Boom } from '@hapi/boom';
import { proto } from '../../WAProto/index.js';
import {} from './types.js';
// some extra useful utilities
const indexCache = new WeakMap();
export const getBinaryNodeChildren = (node, childTag) => {
    if (!node || !Array.isArray(node.content))
        return [];
    let index = indexCache.get(node);
    // Build the index once per node
    if (!index) {
        index = new Map();
        for (const child of node.content) {
            let arr = index.get(child.tag);
            if (!arr)
                index.set(child.tag, (arr = []));
            arr.push(child);
        }
        indexCache.set(node, index);
    }
    // Return first matching child
    return index.get(childTag) || [];
};
export const getBinaryNodeChild = (node, childTag) => {
    return getBinaryNodeChildren(node, childTag)[0];
};
export const getAllBinaryNodeChildren = ({ content }) => {
    if (Array.isArray(content)) {
        return content;
    }
    return [];
};
export const getBinaryNodeChildBuffer = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content;
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return child;
    }
};
export const getBinaryNodeChildString = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content;
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return Buffer.from(child).toString('utf-8');
    }
    else if (typeof child === 'string') {
        return child;
    }
};
export const getBinaryNodeChildUInt = (node, childTag, length) => {
    const buff = getBinaryNodeChildBuffer(node, childTag);
    if (buff) {
        return bufferToUInt(buff, length);
    }
};
export const assertNodeErrorFree = (node) => {
    const errNode = getBinaryNodeChild(node, 'error');
    if (errNode) {
        throw new Boom(errNode.attrs.text || 'Unknown error', { data: +errNode.attrs.code });
    }
};
export const reduceBinaryNodeToDictionary = (node, tag) => {
    const nodes = getBinaryNodeChildren(node, tag);
    const dict = nodes.reduce((dict, { attrs }) => {
        if (typeof attrs.name === 'string') {
            dict[attrs.name] = attrs.value || attrs.config_value;
        }
        else {
            dict[attrs.config_code] = attrs.value || attrs.config_value;
        }
        return dict;
    }, {});
    return dict;
};
export const getBinaryNodeMessages = ({ content }) => {
    const msgs = [];
    if (Array.isArray(content)) {
        for (const item of content) {
            if (item.tag === 'message') {
                msgs.push(proto.WebMessageInfo.decode(item.content).toJSON());
            }
        }
    }
    return msgs;
};
function bufferToUInt(e, t) {
    let a = 0;
    for (let i = 0; i < t; i++) {
        a = 256 * a + e[i];
    }
    return a;
}
const tabs = (n) => '\t'.repeat(n);
export function binaryNodeToString(node, i = 0) {
    if (!node) {
        return node;
    }
    if (typeof node === 'string') {
        return tabs(i) + node;
    }
    if (node instanceof Uint8Array) {
        return tabs(i) + Buffer.from(node).toString('hex');
    }
    if (Array.isArray(node)) {
        return node.map(x => tabs(i + 1) + binaryNodeToString(x, i + 1)).join('\n');
    }
    const children = binaryNodeToString(node.content, i + 1);
    const tag = `<${node.tag} ${Object.entries(node.attrs || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}='${v}'`)
        .join(' ')}`;
    const content = children ? `>\n${children}\n${tabs(i)}</${node.tag}>` : '/>';
    return tag + content;
}
/**
 * Lia@Changes 30-01-26
 * ---
 * Produce the binary node (WABinary-like JSON shape) required for the specific
 * interactive button / list type.
 * compatible with observed official client traffic.
 *
 * NOTE: Returning different "v" (version) and "name" values influences how
 * WhatsApp renders & validates flows. The constants here are empirically derived.
 *
 * @param {object} message Normalized message content (after Baileys normalization).
 * @returns {object} A node with shape { tag, attrs, [content] } to inject into additionalNodes.
 */
const FLOWS_MAP = {
    mpm: true,
    cta_catalog: true,
    send_location: true,
    call_permission_request: true,
    wa_payment_transaction_details: true,
    automated_greeting_message_view_catalog: true
};
const qualityAttribute = {
    tag: 'quality_control',
    attrs: { source_type: 'third_party' }
};
const defaultContent = [qualityAttribute]
const listContent = [
    {
        tag: 'list',
        attrs: { v: '2', type: 'product_list' }
    },
    qualityAttribute
];
export const getBizBinaryNode = (message) => {
    const flowMsg = message.interactiveMessage?.nativeFlowMessage;
    const buttonName = flowMsg?.buttons?.[0]?.name;
    if (buttonName === 'review_and_pay' || buttonName === 'payment_info') {
        return {
            tag: 'biz',
            attrs: {
                native_flow_name: buttonName === 'review_and_pay' ?
                    'order_details' :
                    buttonName
            },
            content: defaultContent
        };
    }
    if (buttonName && FLOWS_MAP[buttonName]) {
        return {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        {
                            tag: 'native_flow',
                            attrs: { v: '2', name: buttonName }
                        }
                    ]
                },
                qualityAttribute
            ]
        };
    }
    if (flowMsg || message.buttonsMessage || message.templateMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        {
                            tag: 'native_flow',
                            attrs: { v: '9', name: 'mixed' }
                        }
                    ]
                },
                qualityAttribute
            ]
        };
    }
    if (message.listMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: listContent
        };
    }
    return {
        tag: 'biz',
        attrs: {},
        content: defaultContent
    };
}
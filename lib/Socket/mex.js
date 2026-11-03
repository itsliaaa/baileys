import { Boom } from '@hapi/boom';
import { brotliDecompressSync, gunzipSync, inflateRawSync, inflateSync } from 'zlib';
import { getBinaryNodeChild, S_WHATSAPP_NET } from '../WABinary/index.js';
const toBuffer = (content) => {
    if (Buffer.isBuffer(content)) return content;
    if (content instanceof Uint8Array) return Buffer.from(content);
    if (typeof content === 'string') return Buffer.from(content, 'utf-8');
    return null;
};
const tryParseJSON = (str) => {
    if (typeof str !== 'string') return undefined;
    // quita BOM y bytes de control al inicio/fin
    const clean = str.replace(/^[\uFEFF\x00-\x1F\x7F]+/, '').replace(/[\x00-\x1F\x7F]+$/, '');
    if (!clean) return undefined;
    const isObj = (v) => typeof v === 'object' && v !== null;
    try {
        const v = JSON.parse(clean);
        if (isObj(v)) return v;
    }
    catch { }
    // JSON con bytes extra antes/después
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try {
            const v = JSON.parse(clean.slice(start, end + 1));
            if (isObj(v)) return v;
        }
        catch { }
    }
    return undefined;
};
/** Lector genérico de protobuf (sin schema): devuelve los strings legibles que encuentre. */
const extractProtoStrings = (buf, depth = 0, out = []) => {
    if (depth > 8 || out.length > 200) return out;
    let i = 0;
    const readVarint = () => {
        let result = 0, shift = 0, b;
        do {
            if (i >= buf.length || shift > 49) throw new Error('varint');
            b = buf[i++];
            result += (b & 0x7f) * 2 ** shift;
            shift += 7;
        } while (b & 0x80);
        return result;
    };
    try {
        while (i < buf.length) {
            const key = readVarint();
            const wire = key % 8;
            if (key < 8) return out;
            if (wire === 0) readVarint();
            else if (wire === 1) i += 8;
            else if (wire === 5) i += 4;
            else if (wire === 2) {
                const len = readVarint();
                if (len < 0 || i + len > buf.length) return out;
                const chunk = buf.subarray(i, i + len);
                i += len;
                const before = out.length;
                extractProtoStrings(chunk, depth + 1, out);
                if (out.length === before) {
                    const str = chunk.toString('utf-8');
                    if (str && !/[\x00-\x08\x0E-\x1F\uFFFD]/.test(str)) out.push(str);
                }
            }
            else return out;
        }
    }
    catch { }
    return out;
};
/**
 * Decodifica el contenido de <result> de una consulta w:mex.
 * WhatsApp a veces responde con bytes extra / comprimido / binario en lugar de JSON plano.
 */
export const decodeMexContent = (content) => {
    const buf = toBuffer(content);
    if (!buf || !buf.length) return undefined;
    let data = tryParseJSON(buf.toString('utf-8'));
    if (data !== undefined) return data;
    for (const fn of [inflateSync, inflateRawSync, gunzipSync, brotliDecompressSync]) {
        try {
            data = tryParseJSON(fn(buf).toString('utf-8'));
            if (data !== undefined) return data;
        }
        catch { }
    }
    // ¿JSON envuelto dentro de un mensaje protobuf?
    for (const str of extractProtoStrings(buf)) {
        data = tryParseJSON(str);
        if (data !== undefined) return data;
    }
    return undefined;
};
const describeRawMex = (content) => {
    const buf = toBuffer(content) || Buffer.alloc(0);
    const latin = buf.toString('latin1');
    const newsletterMatch = latin.match(/(\d{10,})(@newsletter)?/);
    return {
        size: buf.length,
        hex: buf.subarray(0, 256).toString('hex'),
        strings: extractProtoStrings(buf).slice(0, 30),
        newsletterJid: newsletterMatch ? `${newsletterMatch[1]}@newsletter` : undefined
    };
};
const wMexQuery = (variables, queryId, query, generateMessageTag) => {
    return query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            to: S_WHATSAPP_NET,
            xmlns: 'w:mex'
        },
        content: [
            {
                tag: 'query',
                attrs: { query_id: queryId },
                content: Buffer.from(JSON.stringify({ variables }), 'utf-8')
            }
        ]
    });
};
export const executeWMexQuery = async (variables, queryId, dataPath, query, generateMessageTag) => {
    const result = await wMexQuery(variables, queryId, query, generateMessageTag);
    const child = getBinaryNodeChild(result, 'result');
    if (child?.content) {
        const data = decodeMexContent(child.content);
        if (data === undefined) {
            const raw = describeRawMex(child.content);
            throw new Boom(`MEX: WhatsApp devolvió una respuesta no-JSON (query ${queryId}, ${raw.size} bytes)`, {
                statusCode: 422,
                data: { code: 'MEX_NON_JSON', queryId, dataPath, ...raw }
            });
        }
        if (data.errors && data.errors.length > 0) {
            const errorMessages = data.errors.map((err) => err.message || 'Unknown error').join(', ');
            const firstError = data.errors[0];
            const errorCode = firstError.extensions?.error_code || 400;
            throw new Boom(`GraphQL server error: ${errorMessages}`, { statusCode: errorCode, data: firstError });
        }
        const response = dataPath ? data?.data?.[dataPath] : data?.data;
        if (typeof response !== 'undefined') {
            return response;
        }
    }
    const action = (dataPath || '').startsWith('xwa2_')
        ? dataPath.substring(5).replace(/_/g, ' ')
        : dataPath?.replace(/_/g, ' ');
    throw new Boom(`Failed to ${action}, unexpected response structure.`, { statusCode: 400, data: result });
};
//# sourceMappingURL=mex.js.map
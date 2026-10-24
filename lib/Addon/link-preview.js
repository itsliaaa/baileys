import { TEXT_DECODER } from '../Defaults/index.js';
import { HttpError } from './http-error.js';
const MAX = 262144;
const TAG = /<(meta|link)\b([^>]*)>|<title[^>]*>([^<]*)/gi;
const ATTR = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
const ENT = /&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos));/gi;
const MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const txt = s => s && s.replace(ENT, (_, d, h, n) => {
    if (n)
        return MAP[n.toLowerCase()];
    const c = d ? +d : parseInt(h, 16);
    return c <= 0x10FFFF ? String.fromCodePoint(c) : '';
}).replace(/\s+/g, ' ').trim();
async function readHead(res) {
    let html = '';
    for await (const chunk of res.body) {
        html += TEXT_DECODER.decode(chunk, { stream: true });
        const i = html.search(/<\/head>|<body/i);
        if (i !== -1)
            return html.slice(0, i);
        if (html.length > MAX)
            break;
    }
    return html;
}
export async function getLinkPreview(url, timeout = 3000) {
    const res = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
        headers: {
            Accept: 'text/html',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
        }
    });
    if (!res.ok)
        throw new HttpError(`HTTP ${res.status} ${res.statusText}`);
    if (!/html/i.test(res.headers.get('content-type') ?? '')) {
        await res.body?.cancel();
        return { url: res.url };
    }
    const base = res.url;
    const abs = v => {
        try {
            return v && new URL(v, base).href;
        }
        catch { }
    };
    const m = {};
    let title, icon;
    for (const [, kind, attrs, t] of (await readHead(res)).matchAll(TAG)) {
        if (t !== undefined) {
            title ?? (title = t);
            continue;
        }
        const a = {};
        for (const x of attrs.matchAll(ATTR))
            a[x[1].toLowerCase()] = x[2] ?? x[3] ?? x[4];
        if (kind.toLowerCase() === 'meta') {
            const k = (a.property ?? a.name ?? a.itemprop)?.toLowerCase();
            if (k && a.content)
                m[k] ?? (m[k] = a.content);
        }
        else if (a.href) {
            const r = a.rel?.toLowerCase() ?? '';
            if (/(^|\s)icon(\s|$)/.test(r))
                icon ?? (icon = a.href);
            else if (r === 'image_src')
                m.image_src ?? (m.image_src = a.href);
        }
    }
    return {
        url: base,
        title: txt(m['og:title'] ?? m['twitter:title'] ?? title),
        description: txt(m['og:description'] ?? m['twitter:description'] ?? m.description),
        favicon: abs(icon ?? '/favicon.ico'),
        image: abs(m['og:image'] ?? m['og:image:secure_url'] ?? m['twitter:image'] ?? m['twitter:image:src'] ?? m.image ?? m.image_src),
        video: abs(m['og:video'] ?? m['og:video:secure_url'] ?? m['og:video:url'] ?? m['twitter:player:stream'])
    };
}

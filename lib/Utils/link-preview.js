import { getLinkPreview } from '../Addon/index.js';
import { prepareWAMessageMedia } from './messages.js';
import { extractImageThumb, getHttpStream } from './messages-media.js';
const URL_PROTOCOL_REGEX = /^https?:\/\//;
const THUMBNAIL_WIDTH_PX = 192;
/** Fetches an image and generates a thumbnail for it */
const getCompressedJpegThumbnail = async (url, { thumbnailWidth, fetchOpts }) => {
    const stream = await getHttpStream(url, fetchOpts);
    const result = await extractImageThumb(stream, thumbnailWidth);
    return result;
};
/**
 * Given a piece of text, checks for any URL present, generates link preview for the same and returns it
 * Return undefined if the fetch failed or no URL was found
 * @param text first matched URL in text
 * @returns the URL info required to generate link preview
 */
export const getUrlInfo = async (text, opts = {
    thumbnailWidth: THUMBNAIL_WIDTH_PX,
    fetchOpts: { timeout: 3000 }
}) => {
    try {
        const previewLink = URL_PROTOCOL_REGEX.test(text) ? text : 'https://' + text;
        const info = await getLinkPreview(previewLink, opts.fetchOpts.timeout);
        if (info?.title) {
            const urlInfo = {
                'canonical-url': info.url,
                'matched-text': text,
                title: info.title,
                description: info.description,
                originalThumbnailUrl: info.image,
                'preview-type': info.video ? 1 : 0
            };
            if (opts.uploadImage) {
                await Promise.all([
                    (async () => {
                        const { imageMessage } = await prepareWAMessageMedia({ image: { url: info.image } }, {
                            upload: opts.uploadImage,
                            mediaTypeOverride: 'thumbnail-link',
                            options: opts.fetchOpts
                        });
                        urlInfo.jpegThumbnail = imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined;
                        urlInfo.highQualityThumbnail = imageMessage;
                    })(),
                    info.favicon
                        ? (async () => {
                            const { imageMessage } = await prepareWAMessageMedia({ image: { url: info.favicon } }, {
                                upload: opts.uploadImage,
                                mediaTypeOverride: 'thumbnail-link',
                                options: opts.fetchOpts
                            });
                            urlInfo.favicon = imageMessage;
                        })()
                        : Promise.resolve()
                ]);
            }
            else {
                try {
                    urlInfo.jpegThumbnail = info.image ? (await getCompressedJpegThumbnail(info.image, opts)).buffer : undefined;
                }
                catch (error) {
                    opts.logger?.debug({ err: error.stack, url: previewLink }, 'error in generating thumbnail');
                }
            }
            return urlInfo;
        }
    }
    catch (error) {
        if (!error.message.includes('receive a valid')) {
            throw error;
        }
    }
};

import { Boom } from '@hapi/boom';
import { randomBytes } from 'crypto';
import { zip } from 'fflate';
import { promises as fs } from 'fs';
import {} from 'stream';
import { proto } from '../../WAProto/index.js';
import { CALL_AUDIO_PREFIX, CALL_VIDEO_PREFIX, DONATE_URL, LIBRARY_NAME, MEDIA_KEYS, URL_REGEX, WA_DEFAULT_EPHEMERAL } from '../Defaults/index.js';
import { AssociationType, ButtonHeaderType, ButtonType, CarouselCardType, ListType, ProtocolType, WAMessageStatus, WAProto } from '../Types/index.js';
import { isPnUser, isLidUser, isJidGroup, isJidNewsletter, isJidStatusBroadcast, jidNormalizedUser } from '../WABinary/index.js';
import { sha256 } from './crypto.js';
import { generateMessageIDV2, getKeyAuthor, unixTimestampSeconds } from './generics.js';
import { bufferToFile, downloadContentFromMessage, encryptedStream, generateThumbnail, getAudioDuration, getAudioWaveform, getImageProcessingLibrary, getRawMediaUploadData, getStream, toBuffer } from './messages-media.js';
import { shouldIncludeReportingToken } from './reporting-utils.js';
const MIMETYPE_MAP = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    audio: 'audio/ogg; codecs=opus',
    sticker: 'image/webp',
    'product-catalog-image': 'image/jpeg'
};
const MessageTypeProto = {
    image: WAProto.Message.ImageMessage,
    video: WAProto.Message.VideoMessage,
    audio: WAProto.Message.AudioMessage,
    sticker: WAProto.Message.StickerMessage,
    document: WAProto.Message.DocumentMessage
};
const mediaAnnotation = [{
    polygonVertices: [{
        x: 60.71664810180664,
        y: -36.39784622192383
    }, {
        x: -16.710189819335938,
        y: 49.263675689697266
    }, {
        x: -56.585853576660156,
        y: 37.85963439941406
    }, {
        x: 20.840980529785156,
        y: -47.80188751220703
    }],
    newsletter: {
        // Lia@Note 03-02-26 --- You can change jid, message id, and name via .env (⁠≧⁠▽⁠≦⁠)
        newsletterJid: process.env.NEWSLETTER_ID ? process.env.NEWSLETTER_ID : Buffer.from('313230333633343034303036363434313339406e6577736c6574746572', 'hex').toString(),
        serverMessageId: process.env.NEWSLETTER_MESSAGE_ID ? process.env.NEWSLETTER_MESSAGE_ID : Buffer.from('313033', 'hex').toString(),
        newsletterName: process.env.NEWSLETTER_NAME ? process.env.NEWSLETTER_NAME : Buffer.from('f09d96b2f09d978df09d96baf09d978bf09d96bff09d96baf09d9785f09d9785', 'hex').toString(),
        contentType: proto.ContextInfo.ForwardedNewsletterMessageInfo.ContentType.UPDATE,
        accessibilityText: ''
    }
}];
/**
 * Uses a regex to test whether the string contains a URL, and returns the URL if it does.
 * @param text eg. hello https://google.com
 * @returns the URL, eg. https://google.com
 */
export const extractUrlFromText = (text) => text.match(URL_REGEX)?.[0];
export const generateLinkPreviewIfRequired = async (text, getUrlInfo, logger) => {
    const url = extractUrlFromText(text);
    if (!!getUrlInfo && url) {
        try {
            const urlInfo = await getUrlInfo(url);
            return urlInfo;
        }
        catch (error) {
            // ignore if fails
            logger?.warn({ trace: error.stack }, 'url generation failed');
        }
    }
};
const assertColor = async (color) => {
    let assertedColor;
    if (typeof color === 'number') {
        assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1;
    }
    else {
        let hex = color.trim().replace('#', '');
        if (hex.length <= 6) {
            hex = 'FF' + hex.padStart(6, '0');
        }
        assertedColor = parseInt(hex, 16);
        return assertedColor;
    }
};
export const prepareWAMessageMedia = async (message, options) => {
    const logger = options.logger;
    let mediaType;
    for (const key of MEDIA_KEYS) {
        if (key in message) {
            mediaType = key;
        }
    }
    if (!mediaType) {
        throw new Boom('Invalid media type', { statusCode: 400 });
    }
    const uploadData = {
        ...message,
        media: message[mediaType]
    };
    if (uploadData.image || uploadData.video) {
        uploadData.annotations = mediaAnnotation;
    }
    delete uploadData[mediaType];
    // check if cacheable + generate cache key
    const cacheableKey = typeof uploadData.media === 'object' &&
        'url' in uploadData.media &&
        !!uploadData.media.url &&
        !!options.mediaCache &&
        mediaType + ':' + uploadData.media.url;
    if (mediaType === 'document' && !uploadData.fileName) {
        uploadData.fileName = LIBRARY_NAME;
    }
    if (!uploadData.mimetype) {
        uploadData.mimetype = MIMETYPE_MAP[mediaType];
    }
    if (cacheableKey) {
        const mediaBuff = await options.mediaCache.get(cacheableKey);
        if (mediaBuff) {
            logger?.debug({ cacheableKey }, 'got media cache hit');
            const obj = proto.Message.decode(mediaBuff);
            const key = `${mediaType}Message`;
            Object.assign(obj[key], { ...uploadData, media: undefined });
            return obj;
        }
    }
    const isNewsletter = !!options.jid && isJidNewsletter(options.jid);
    const requiresDurationComputation = mediaType === 'audio' && typeof uploadData.seconds === 'undefined';
    const requiresThumbnailComputation = (mediaType === 'image' || mediaType === 'video') && typeof uploadData['jpegThumbnail'] === 'undefined';
    const requiresWaveformProcessing = mediaType === 'audio' && uploadData.ptt === true;
    const requiresAudioBackground = options.backgroundColor && mediaType === 'audio' && uploadData.ptt === true;
    const requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation || requiresWaveformProcessing;
    // Lia@Changes 06-02-26 --- Add few support for sending media to newsletter (⁠≧⁠▽⁠≦⁠)
    if (isNewsletter) {
        logger?.info({ key: cacheableKey }, 'Preparing raw media for newsletter');
        const { filePath, fileSha256, fileLength } = await getRawMediaUploadData(uploadData.media, options.mediaTypeOverride || mediaType, logger);
        const fileSha256B64 = fileSha256.toString('base64');
        const [{ mediaUrl, directPath }] = await Promise.all([
            (async () => {
                const result = options.upload(filePath, {
                    fileEncSha256B64: fileSha256B64,
                    mediaType,
                    timeoutMs: options.mediaUploadTimeoutMs,
                    newsletter: isNewsletter
                });
                logger?.debug({ mediaType, cacheableKey }, 'uploaded media');
                return result;
            })(),
            (async () => {
                try {
                    if (requiresThumbnailComputation) {
                        const { thumbnail } = await generateThumbnail(filePath, mediaType, options);
                        uploadData.jpegThumbnail = thumbnail;
                        logger?.debug('generated thumbnail');
                    }
                    if (requiresDurationComputation) {
                        uploadData.seconds = await getAudioDuration(filePath);
                        logger?.debug('computed audio duration');
                    }
                }
                catch (error) {
                    logger?.warn({ trace: error.stack }, 'failed to obtain extra info');
                }
            })()
        ]).finally(async () => {
            try {
                await fs.unlink(filePath);
                logger?.debug('removed tmp files');
            }
            catch (error) {
                logger?.warn('failed to remove tmp file');
            }
        });
        delete uploadData.media;
        const obj = proto.Message.create({
            // todo: add more support here
            [`${mediaType}Message`]: MessageTypeProto[mediaType].fromObject({
                url: mediaUrl,
                directPath,
                fileSha256,
                fileLength,
                ...uploadData
            })
        });
        if (uploadData.ptv) {
            obj.ptvMessage = obj.videoMessage;
            delete obj.videoMessage;
        }
        if (obj.stickerMessage) {
            obj.stickerMessage.stickerSentTs = Date.now();
        }
        if (cacheableKey) {
            logger?.debug({ cacheableKey }, 'set cache');
            await options.mediaCache.set(cacheableKey, WAProto.Message.encode(obj).finish());
        }
        return obj;
    }
    const { mediaKey, encFilePath, originalFilePath, fileEncSha256, fileSha256, fileLength } = await encryptedStream(uploadData.media, options.mediaTypeOverride || mediaType, {
        logger,
        saveOriginalFileIfRequired: requiresOriginalForSomeProcessing,
        opts: options.options
    });
    const fileEncSha256B64 = fileEncSha256.toString('base64');
    const [{ mediaUrl, directPath }] = await Promise.all([
        (async () => {
            const result = await options.upload(encFilePath, {
                fileEncSha256B64,
                mediaType,
                timeoutMs: options.mediaUploadTimeoutMs
            });
            logger?.debug({ mediaType, cacheableKey }, 'uploaded media');
            return result;
        })(),
        (async () => {
            try {
                if (requiresThumbnailComputation) {
                    const { thumbnail, originalImageDimensions } = await generateThumbnail(originalFilePath, mediaType, options);
                    uploadData.jpegThumbnail = thumbnail;
                    if (!uploadData.width && originalImageDimensions) {
                        uploadData.width = originalImageDimensions.width;
                        uploadData.height = originalImageDimensions.height;
                        logger?.debug('set dimensions');
                    }
                    logger?.debug('generated thumbnail');
                }
                if (requiresDurationComputation) {
                    uploadData.seconds = await getAudioDuration(originalFilePath);
                    logger?.debug('computed audio duration');
                }
                if (requiresWaveformProcessing) {
                    uploadData.waveform = await getAudioWaveform(originalFilePath, logger);
                    logger?.debug('processed waveform');
                }
                if (requiresAudioBackground) {
                    uploadData.backgroundArgb = await assertColor(options.backgroundColor);
                    logger?.debug('computed backgroundColor audio status');
                }
            }
            catch (error) {
                logger?.warn({ trace: error.stack }, 'failed to obtain extra info');
            }
        })()
    ]).finally(async () => {
        try {
            await fs.unlink(encFilePath);
            if (originalFilePath) {
                await fs.unlink(originalFilePath);
            }
            logger?.debug('removed tmp files');
        }
        catch (error) {
            logger?.warn('failed to remove tmp file');
        }
    });
    delete uploadData.media;
    const obj = proto.Message.create({
        [`${mediaType}Message`]: MessageTypeProto[mediaType].fromObject({
            url: mediaUrl,
            directPath,
            mediaKey,
            fileEncSha256,
            fileSha256,
            fileLength,
            mediaKeyTimestamp: unixTimestampSeconds(),
            ...uploadData
        })
    });
    if (uploadData.ptv) {
        obj.ptvMessage = obj.videoMessage;
        delete obj.videoMessage;
    }
    if (obj.stickerMessage) {
        obj.stickerMessage.stickerSentTs = Date.now();
    }
    if (cacheableKey) {
        logger?.debug({ cacheableKey }, 'set cache');
        await options.mediaCache.set(cacheableKey, WAProto.Message.encode(obj).finish());
    }
    return obj;
};
export const prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {
    ephemeralExpiration = ephemeralExpiration || 0;
    const content = {
        ephemeralMessage: {
            message: {
                protocolMessage: {
                    type: ProtocolType.EPHEMERAL_SETTING,
                    ephemeralExpiration
                }
            }
        }
    };
    return content;
};
// Lia@Changes 31-01-26 --- Extract product message into a standalone function so it can also be reused as the header for interactive messages
const prepareProductMessage = async (message, options) => {
    if (!message.businessOwnerJid) {
        throw new Boom('"businessOwnerJid" is missing from the content', { statusCode: 400 });
    }
    const { imageMessage } = await prepareWAMessageMedia({ image: message.image || message.product.productImage }, options);
    // Lia@Changes 01-02-26 --- Add product message default value
    const content = {
        ...message,
        product: {
            currencyCode: 'IDR',
            priceAmount1000: 1000,
            title: LIBRARY_NAME,
            ...message.product,
            productImage: imageMessage
        }
    };
    delete content.image;
    return content;
};
/**
 * Lia@Note 30-01-26
 * ---
 * Credits: Work on ensuring stickerPackMessage fields are valid by @jlucaso1 (https://github.com/jlucaso1).
 * based on https://github.com/WhiskeySockets/Baileys/pull/1561
 */
const prepareStickerPackMessage = async (message, options) => {
    const { cover, stickers = [], name = '📦 Sticker Pack', publisher = 'GitHub: itsliaaa', description = '🏷️ itsliaaa/baileys' } = message;
    if (stickers.length > 60) {
        throw new Boom('Sticker pack exceeds the maximum limit of 60 stickers', { statusCode: 400 });
    }
    if (stickers.length === 0) {
        throw new Boom('Sticker pack must contain at least one sticker', { statusCode: 400 });
    }
    if (!cover) {
        throw new Boom('Sticker pack must contain a cover', { statusCode: 400 });
    }
    // Lia@Changes 01-02-26 --- Add caching for sticker pack (similiar to prepareWAMessageMedia)
    const cacheableKey = Array.isArray(stickers) &&
        stickers.length &&
        !!options.mediaCache &&
        'sticker:' + stickers
            .reduce((acc, x) => {
                const url = typeof x.data === 'object' &&
                    'url' in x.data &&
                    !!x.data.url &&
                    x.data.url;
                if (url) acc.push(url);
                return acc;
            }, [])
            .join('@');
    if (cacheableKey) {
        const mediaBuff = await options.mediaCache.get(cacheableKey);
        if (mediaBuff) {
            options.logger?.debug({ cacheableKey }, 'got media cache hit');
            return proto.Message.StickerPackMessage.decode(mediaBuff);
        }
    }
    const lib = await getImageProcessingLibrary();
    const stickerPackIdValue = generateMessageIDV2();
    const stickerData = {};
    const stickerPromises = stickers.map(async (sticker, i) => {
        const { stream } = await getStream(sticker.data);
        const buffer = await toBuffer(stream);
        let webpBuffer,
            isAnimated = false;
        const isWebP = isWebPBuffer(buffer);
        if (isWebP) {
            // Already WebP - preserve original to keep exif metadata and animation
            webpBuffer = buffer;
            isAnimated = isAnimatedWebP(buffer);
        }
        else if ('sharp' in lib && typeof lib.sharp?.default === 'function') {
            // Convert to WebP, preserving metadata
            webpBuffer = await lib
                .sharp
                .default(buffer)
                .resize(512, 512, { fit: 'inside' })
                .webp({ quality: 80 })
                .toBuffer();
            // Non-WebP inputs converted to WebP are not animated
            isAnimated = false;
        }
        else {
            throw new Boom('No image processing library (sharp) available for converting sticker to WebP. Either install sharp or provide stickers in WebP format.');
        }
        if (webpBuffer.length > 1024 * 1024) {
           throw new Boom(`Sticker at index ${i} exceeds the 1MB size limit`, { statusCode: 400 });
        }
        const hash = sha256(webpBuffer).toString('base64').replace(/\//g, '-');
        const fileName = hash + '.webp';
        stickerData[fileName] = [new Uint8Array(webpBuffer), { level: 0 }];
        return {
            fileName,
            mimetype: 'image/webp',
            isAnimated,
            emojis: sticker.emojis || ['✨'],
            accessibilityLabel: sticker.accessibilityLabel || '‎'
        };
    });
    const stickerMetadata = await Promise.all(stickerPromises);
    // Process and add cover/tray icon to the ZIP
    const trayIconFileName = stickerPackIdValue + '.webp';
    const { stream: coverStream } = await getStream(cover);
    const coverBuffer = await toBuffer(coverStream);
    let coverWebpBuffer;
    const isCoverWebP = isWebPBuffer(coverBuffer);
    if (isCoverWebP) {
        // Already WebP - preserve original to keep exif metadata
        coverWebpBuffer = coverBuffer;
    }
    else if ('sharp' in lib && typeof lib.sharp?.default === 'function') {
        coverWebpBuffer = await lib
            .sharp
            .default(coverBuffer)
            .resize(512, 512, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();
    }
    else {
        throw new Boom('No image processing library (sharp) available for converting cover to WebP. Either install sharp or provide cover in WebP format.');
    }
    // Add cover to ZIP data
    stickerData[trayIconFileName] = [new Uint8Array(coverWebpBuffer), { level: 0 }];
    const zipBuffer = await new Promise((resolve, reject) => {
        zip(stickerData, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(Buffer.from(data));
            }
        });
    });
    const stickerPackSize = zipBuffer.length;
    const stickerPackUpload = await encryptedStream(zipBuffer, 'sticker-pack', {
        logger: options.logger,
        opts: options.options
    });
    const stickerPackUploadResult = await options.upload(stickerPackUpload.encFilePath, {
        fileEncSha256B64: stickerPackUpload.fileEncSha256.toString('base64'),
        mediaType: 'sticker-pack',
        timeoutMs: options.mediaUploadTimeoutMs
    });
    await fs.unlink(stickerPackUpload.encFilePath);
    const obj = {
        name: name,
        publisher: publisher,
        stickerPackId: stickerPackIdValue,
        packDescription: description,
        stickerPackOrigin: proto.Message.StickerPackMessage.StickerPackOrigin.USER_CREATED,
        stickerPackSize: stickerPackSize,
        stickers: stickerMetadata,
        fileSha256: stickerPackUpload.fileSha256,
        fileEncSha256: stickerPackUpload.fileEncSha256,
        mediaKey: stickerPackUpload.mediaKey,
        directPath: stickerPackUploadResult.directPath,
        fileLength: stickerPackUpload.fileLength,
        mediaKeyTimestamp: unixTimestampSeconds(),
        trayIconFileName: trayIconFileName
    };
    try {
        // Reuse the cover buffer we already processed for thumbnail generation
        let thumbnailBuffer;
        if ('sharp' in lib && typeof lib.sharp?.default === 'function') {
            thumbnailBuffer = await lib
                .sharp
                .default(coverBuffer)
                .resize(252, 252)
                .jpeg()
                .toBuffer();
        }
        else if ('jimp' in lib && typeof lib.jimp?.Jimp === 'object') {
            const jimpImage = await lib.jimp.Jimp.read(coverBuffer);
            thumbnailBuffer = await jimpImage
                .resize({ w: 252, h: 252 })
                .getBuffer('image/jpeg');
        }
        else {
            throw new Error('No image processing library available for thumbnail generation');
        }
        if (!thumbnailBuffer || thumbnailBuffer.length === 0) {
            throw new Error('Failed to generate thumbnail buffer');
        }
        const thumbUpload = await encryptedStream(thumbnailBuffer, 'thumbnail-sticker-pack', {
            logger: options.logger,
            opts: options.options,
            mediaKey: stickerPackUpload.mediaKey // Use same mediaKey as the sticker pack ZIP
        });
        const thumbUploadResult = await options.upload(thumbUpload.encFilePath, {
            fileEncSha256B64: thumbUpload.fileEncSha256.toString('base64'),
            mediaType: 'thumbnail-sticker-pack',
            timeoutMs: options.mediaUploadTimeoutMs
        });
        await fs.unlink(thumbUpload.encFilePath);
        Object.assign(obj, {
            thumbnailDirectPath: thumbUploadResult.directPath,
            thumbnailSha256: thumbUpload.fileSha256,
            thumbnailEncSha256: thumbUpload.fileEncSha256,
            thumbnailHeight: 252,
            thumbnailWidth: 252,
            imageDataHash: sha256(thumbnailBuffer).toString('base64')
        });
    }
    catch (error) {
        options.logger?.warn?.(`Thumbnail generation failed: ${error}`);
    }
    const content = obj;
    if (cacheableKey) {
        options.logger?.debug({ cacheableKey }, 'set cache');
        await options.mediaCache.set(cacheableKey, WAProto.Message.StickerPackMessage.encode(content).finish());
    }
    return WAProto.Message.StickerPackMessage.fromObject(content);
};
// Lia@Changes 30-01-26 --- Add native flow button helper for interactive message
const prepareNativeFlowButtons = (message) => {
    const buttons = message.nativeFlow
    const isButtonsFieldArray = Array.isArray(buttons);
    const correctedField = isButtonsFieldArray ? buttons : buttons.buttons;
    const messageParamsJson = {};
    // Lia@Changes 31-01-26 --- Add coupon and options inside interactive message
    if (hasOptionalProperty(message, 'couponCode') && !!message.couponCode) {
        Object.assign(messageParamsJson, {
            limited_time_offer: {
                text: message.couponText || LIBRARY_NAME,
                url: message.couponUrl || DONATE_URL, // Lia@Note 02-02-26 --- Apologies if this feels cheeky, just a fallback
                copy_code: message.couponCode,
                expiration_time: Date.now() + WA_DEFAULT_EPHEMERAL
            }
        });
    }
    if (hasOptionalProperty(message, 'optionText') && !!message.optionText) {
        Object.assign(messageParamsJson, {
            bottom_sheet: {
                in_thread_buttons_limit: 1,
                divide_indices: [],
                list_title: message.optionTitle || '📄 Select Options',
                button_title: message.optionText
            }
        });
    }
    return {
        buttons: correctedField.map(button => {
            if (hasOptionalProperty(button, 'id') && !!button.id) {
                return {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: button.text || button.buttonText || '👉🏻 Click',
                        id: button.id
                    })
                };
            }
            else if (hasOptionalProperty(button, 'copy') && !!button.copy) {
                return {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: button.text || button.buttonText || '📋 Copy',
                        copy_code: button.copy
                    })
                };
            }
            else if (hasOptionalProperty(button, 'url') && !!button.url) {
                return {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: button.text || button.buttonText || '🌐 Visit',
                        url: button.url,
                        merchant_url: button.url
                    })
                };
            }
            else if (hasOptionalProperty(button, 'call') && !!button.call) {
                return {
                    name: 'cta_call',
                    buttonParamsJson: JSON.stringify({
                        display_text: button.text || button.buttonText || '📞 Call',
                        phone_number: button.call
                    })
                };
            }
            return button;
        }),
        messageParamsJson: JSON.stringify(messageParamsJson),
        messageVersion: 1
    };
};
/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
export const generateForwardMessageContent = (message, forceForward) => {
    let content = message.message || message;
    if (!content) {
        throw new Boom('no content in message', { statusCode: 400 });
    }
    // hacky copy
    content = normalizeMessageContent(content);
    content = proto.Message.decode(proto.Message.encode(content).finish());
    let key = Object.keys(content)[0];
    let score = content?.[key]?.contextInfo?.forwardingScore || 0;
    score += message.key.fromMe && !forceForward ? 0 : 1;
    if (key === 'conversation') {
        content.extendedTextMessage = { text: content[key] };
        delete content.conversation;
        key = 'extendedTextMessage';
    }
    const key_ = content?.[key];
    if (score > 0) {
        key_.contextInfo = { forwardingScore: score, isForwarded: true };
    }
    else {
        key_.contextInfo = {};
    }
    return content;
};
export const hasNonNullishProperty = (message, key) => {
    return (typeof message === 'object' &&
        message !== null &&
        key in message &&
        message[key] !== null &&
        message[key] !== undefined);
};
export const hasOptionalProperty = (obj, key) => {
    return typeof obj === 'object' &&
        obj !== null &&
        key in obj &&
        obj[key] !== null;
};
// Lia@Changes 06-02-26 --- Validate album message media to avoid bug 👀
export const hasValidAlbumMedia = (message) => {
    return Boolean(message.imageMessage ||
        message.videoMessage);
};
export const hasValidInteractiveHeader = (message) => {
    return Boolean(message.imageMessage ||
        message.videoMessage ||
        message.documentMessage ||
        message.productMessage ||
        message.locationMessage);
};
// Lia@Changes 30-01-26 --- Validate carousel cards header to avoid bug 👀
export const hasValidCarouselHeader = (message) => {
    return Boolean(message.imageMessage ||
        message.videoMessage ||
        message.productMessage);
};
export const generateWAMessageContent = async (message, options) => {
    var _a, _b;
    let m = {};
    if (hasNonNullishProperty(message, 'text')) {
        const extContent = { text: message.text };
        let urlInfo = message.linkPreview;
        if (typeof urlInfo === 'undefined') {
            urlInfo = await generateLinkPreviewIfRequired(message.text, options.getUrlInfo, options.logger);
        }
        if (urlInfo) {
            extContent.matchedText = urlInfo['matched-text'];
            extContent.jpegThumbnail = urlInfo.jpegThumbnail;
            extContent.description = urlInfo.description;
            extContent.title = urlInfo.title;
            extContent.previewType = 0;
            const img = urlInfo.highQualityThumbnail;
            if (img) {
                extContent.thumbnailDirectPath = img.directPath;
                extContent.mediaKey = img.mediaKey;
                extContent.mediaKeyTimestamp = img.mediaKeyTimestamp;
                extContent.thumbnailWidth = img.width;
                extContent.thumbnailHeight = img.height;
                extContent.thumbnailSha256 = img.fileSha256;
                extContent.thumbnailEncSha256 = img.fileEncSha256;
            }
        }
        if (options.backgroundColor) {
            extContent.backgroundArgb = await assertColor(options.backgroundColor);
        }
        if (options.font) {
            extContent.font = options.font;
        }
        m.extendedTextMessage = extContent;
    }
    else if (hasNonNullishProperty(message, 'contacts')) {
        const { contacts } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        const contactLen = contacts.contacts.length;
        if (!contactLen) {
            throw new Boom('require atleast 1 contact', { statusCode: 400 });
        }
        if (contactLen === 1) {
            m.contactMessage = contacts.contacts[0];
        }
        else {
            m.contactsArrayMessage = contacts;
        }
    }
    else if (hasNonNullishProperty(message, 'location')) {
        m.locationMessage = message.location;
    }
    else if (hasNonNullishProperty(message, 'react')) {
        const { react } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        if (!react.senderTimestampMs) {
            react.senderTimestampMs = Date.now();
        }
        m.reactionMessage = react;
    }
    else if (hasNonNullishProperty(message, 'delete')) {
        m.protocolMessage = {
            key: message.delete,
            type: ProtocolType.REVOKE
        };
    }
    else if (hasNonNullishProperty(message, 'forward')) {
        m = generateForwardMessageContent(message.forward, message.force);
    }
    else if (hasNonNullishProperty(message, 'disappearingMessagesInChat')) {
        const { disappearingMessagesInChat } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        const exp = typeof disappearingMessagesInChat === 'boolean'
            ? disappearingMessagesInChat
                ? WA_DEFAULT_EPHEMERAL
                : 0
            : disappearingMessagesInChat;
        m = prepareDisappearingMessageSettingContent(exp);
    }
    else if (hasNonNullishProperty(message, 'groupInvite')) {
        const { groupInvite } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        m.groupInviteMessage = {};
        m.groupInviteMessage.inviteCode = groupInvite.inviteCode;
        m.groupInviteMessage.inviteExpiration = groupInvite.inviteExpiration;
        m.groupInviteMessage.caption = groupInvite.text;
        m.groupInviteMessage.groupJid = groupInvite.jid;
        m.groupInviteMessage.groupName = groupInvite.subject;
        //TODO: use built-in interface and get disappearing mode info etc.
        //TODO: cache / use store!?
        if (options.getProfilePicUrl) {
            const pfpUrl = await options.getProfilePicUrl(groupInvite.jid, 'preview');
            if (pfpUrl) {
                const resp = await fetch(pfpUrl, { method: 'GET', dispatcher: options?.options?.dispatcher });
                if (resp.ok) {
                    const buf = Buffer.from(await resp.arrayBuffer());
                    m.groupInviteMessage.jpegThumbnail = buf;
                }
            }
        }
    }
    else if (hasNonNullishProperty(message, 'stickers')) {
        m.stickerPackMessage = await prepareStickerPackMessage(message, options);
    }
    else if (hasNonNullishProperty(message, 'pin')) {
        m.pinInChatMessage = {};
        m.messageContextInfo = {};
        m.pinInChatMessage.key = message.pin;
        m.pinInChatMessage.type = message.type;
        m.pinInChatMessage.senderTimestampMs = Date.now();
        m.messageContextInfo.messageAddOnDurationInSecs = message.type === 1 ? message.time || 86400 : 0;
    }
    else if (hasNonNullishProperty(message, 'keep')) {
        m.keepInChatMessage = {};
        m.keepInChatMessage.key = message.keep;
        m.keepInChatMessage.keepType = message.type;
        m.keepInChatMessage.timestampMs = Date.now();
    }
    else if (hasNonNullishProperty(message, 'flowReply')) {
        const { flowReply } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        m.interactiveResponseMessage = {
            body: {
                format: flowReply.format || proto.Message.InteractiveResponseMessage.Body.Format.DEFAULT,
                text: flowReply.text
            },
            nativeFlowResponseMessage: {
                name: flowReply.name,
                paramsJson: flowReply.paramsJson || '{}',
                version: flowReply.version || 1
            }
        };
    }
    else if (hasNonNullishProperty(message, 'buttonReply')) {
        const { buttonReply } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        switch (message.type) {
            case 'template':
                m.templateButtonReplyMessage = {
                    selectedDisplayText: buttonReply.displayText,
                    selectedId: buttonReply.id,
                    selectedIndex: buttonReply.index
                };
                break;
            case 'plain':
                m.buttonsResponseMessage = {
                    selectedButtonId: buttonReply.id,
                    selectedDisplayText: buttonReply.displayText,
                    type: proto.Message.ButtonsResponseMessage.Type.DISPLAY_TEXT
                };
                break;
        }
    }
    else if (hasNonNullishProperty(message, 'listReply')) {
        const { listReply } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        m.listResponseMessage = {
            description: listReply.description,
            listType: proto.Message.ListResponseMessage.ListType.SINGLE_SELECT,
            singleSelectReply: {
                selectedRowId: listReply.id
            },
            title: listReply.title
        };
    }
    else if (hasOptionalProperty(message, 'ptv') && message.ptv) {
        const { videoMessage } = await prepareWAMessageMedia({ video: message.video }, options);
        m.ptvMessage = videoMessage;
    }
    else if (hasNonNullishProperty(message, 'product')) {
        m.productMessage = await prepareProductMessage(message, options);
    }
    else if (hasNonNullishProperty(message, 'event')) {
        const { event } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        m.eventMessage = {};
        const startTime = Math.floor(event.startDate.getTime() / 1000);
        if (event.call && options.getCallLink) {
            const token = await options.getCallLink(event.call, { startTime });
            m.eventMessage.joinLink = (event.call === 'audio' ? CALL_AUDIO_PREFIX : CALL_VIDEO_PREFIX) + token;
        }
        m.messageContextInfo = {
            // encKey
            messageSecret: event.messageSecret || randomBytes(32)
        };
        m.eventMessage.name = event.name;
        m.eventMessage.description = event.description;
        m.eventMessage.startTime = startTime;
        m.eventMessage.endTime = event.endDate ? event.endDate.getTime() / 1000 : undefined;
        m.eventMessage.isCanceled = event.isCancelled ?? false;
        m.eventMessage.extraGuestsAllowed = event.extraGuestsAllowed;
        m.eventMessage.isScheduleCall = event.isScheduleCall ?? false;
        m.eventMessage.location = event.location;
    }
    else if (hasNonNullishProperty(message, 'poll')) {
        const { poll } = message; // Lia@Changes 04-02-26 --- Destructured for readability & cleaner access (⁠✷⁠‿⁠✷⁠)
        (_a = poll).selectableCount || (_a.selectableCount = 0);
        (_b = poll).toAnnouncementGroup || (_b.toAnnouncementGroup = false);
        if (!Array.isArray(poll.values)) {
            throw new Boom('Invalid poll values', { statusCode: 400 });
        }
        if (poll.selectableCount < 0 || poll.selectableCount > poll.values.length) {
            throw new Boom(`poll.selectableCount in poll should be >= 0 and <= ${poll.values.length}`, {
                statusCode: 400
            });
        }
        m.messageContextInfo = {
            // encKey
            messageSecret: poll.messageSecret || randomBytes(32)
        };
        const pollCreationMessage = {
            name: poll.name,
            selectableOptionsCount: poll.selectableCount,
            options: poll.values.map(optionName => ({ optionName }))
        };
        if (poll.toAnnouncementGroup) {
            // poll v2 is for community announcement groups (single select and multiple)
            m.pollCreationMessageV2 = pollCreationMessage;
        }
        else {
            // Lia@Changes 08-02-26 --- Add quiz message support
            if (poll.pollType === 1) {
                if (!poll.correctAnswer) {
                    throw new Boom('No "correctAnswer" provided for quiz', { statusCode: 400 });
                }
                m.pollCreationMessageV5 = {
                    // Lia@Note 08-02-26 --- quiz for newsletter only
                    ...pollCreationMessage,
                    correctAnswer: {
                        optionName: poll.correctAnswer.toString()
                    },
                    pollType: poll.pollType,
                    selectableOptionsCount: 1
                };
            }
            else if (poll.selectableCount === 1) {
                //poll v3 is for single select polls
                m.pollCreationMessageV3 = pollCreationMessage;
            }
            else {
                // poll for multiple choice polls
                m.pollCreationMessage = pollCreationMessage;
            }
        }
    }
    // Lia@Changes 08-02-26 --- Add poll result snapshot message
    else if (hasNonNullishProperty(message, 'pollResult')) {
        const { pollResult } = message;
        const pollResultSnapshotMessage = {
            name: pollResult.name,
            pollVotes: pollResult.votes.map(vote => ({
                optionName: vote.name,
                optionVoteCount: parseInt(vote.voteCount)
            }))
        };
        if (pollResult.pollType === 1) {
            pollResultSnapshotMessage.pollType = proto.Message.PollType.QUIZ;
            m.pollResultSnapshotMessageV3 = pollResultSnapshotMessage;
        }
        else {
            pollResultSnapshotMessage.pollType = proto.Message.PollType.POLL;
            m.pollResultSnapshotMessage = pollResultSnapshotMessage;
        }
    }
    // Lia@Changes 08-02-26 --- Add poll update message
    else if (hasNonNullishProperty(message, 'pollUpdate')) {
        const { pollUpdate } = message;
        if (!pollUpdate.key) {
            throw new Boom('Message key is required', { statusCode: 400 });
        }
        if (!pollUpdate.vote) {
            throw new Boom('Encrypted vote payload is required', { statusCode: 400 });
        }
        m.pollUpdateMessage = {
            metadata: pollUpdate.metadata,
            pollCreationMessageKey: pollUpdate.key,
            senderTimestampMs: Date.now(),
            vote: pollUpdate.vote
        };
    }
    else if (hasNonNullishProperty(message, 'sharePhoneNumber')) {
        m.protocolMessage = {
            type: ProtocolType.SHARE_PHONE_NUMBER
        };
    }
    else if (hasNonNullishProperty(message, 'requestPhoneNumber')) {
        m.requestPhoneNumberMessage = {};
    }
    else if (hasNonNullishProperty(message, 'limitSharing')) {
        m.protocolMessage = {
            type: ProtocolType.LIMIT_SHARING,
            limitSharing: {
                sharingLimited: message.limitSharing === true,
                trigger: 1,
                limitSharingSettingTimestamp: Date.now(),
                initiatedByMe: true
            }
        };
    }
    // Lia@Changes 01-02-26 --- Add payment invite message
    else if (hasNonNullishProperty(message, 'paymentInviteServiceType')) {
        m.paymentInviteMessage = {
            expiryTimestamp: Date.now(),
            serviceType: message.paymentInviteServiceType
        };
    }
    // Lia@Changes 01-02-26 --- Add order message
    else if (hasNonNullishProperty(message, 'orderText')) {
        if (!Buffer.isBuffer(message.thumbnail)) {
            throw new Boom('Must provide thumbnail buffer in order message', { statusCode: 400 });
        }
        m.orderMessage = {
            itemCount: 1,
            messageVersion: 1,
            orderTitle: LIBRARY_NAME,
            status: proto.Message.OrderMessage.OrderStatus.INQUIRY,
            surface: proto.Message.OrderMessage.OrderSurface.CATALOG,
            token: generateMessageIDV2(),
            totalAmount1000: 1000,
            totalCurrencyCode: 'IDR',
            ...message,
            message: message.orderText
        };
        delete m.orderMessage.orderText;
    }
    // Lia@Changes 31-01-26 --- Add support for album messages
    else if (hasNonNullishProperty(message, 'album')) {
        const { album } = message;
        if (!Array.isArray(album)) {
            throw new Boom('Invalid album type. Expected an array.', { statusCode: 400 });
        }
        let videoCount = 0;
        for (let i = 0; i < album.length; i++) {
            if (album[i].video) videoCount++;
        };
        let imageCount = 0;
        for (let i = 0; i < album.length; i++) {
            if (album[i].image) imageCount++;
        };
        if ((videoCount + imageCount) < 2) {
            throw new Boom('Minimum provide 2 media to upload album message', { statusCode: 400 });
        }
        m.albumMessage = {
            expectedImageCount: imageCount,
            expectedVideoCount: videoCount
        };
    }
    // Lia@Changes 30-01-26 --- Add "raw" boolean to send raw messages directly via generateWAMessage()
    else if (hasNonNullishProperty(message, 'raw')) {
        delete message.raw;
        return proto.Message.create(message);
    }
    else {
        m = await prepareWAMessageMedia(message, options);
    }
    // Lia@Changes 30-01-26 --- Add interactive messages (buttonsMessage, listMessage, interactiveMessage, templateMessage, and carouselMessage)
    if (hasNonNullishProperty(message, 'buttons')) {
        const buttonsMessage = {
            buttons: message.buttons.map(button => {
                if (hasOptionalProperty(button, 'name')) {
                    return {
                        nativeFlowInfo: {
                           name: button.name,
                           paramsJson: button.paramsJson
                        },
                        type: ButtonType.NATIVE_FLOW
                    };
                }
                const buttonText = button.text || button.buttonText
                return {
                    buttonId: button.id || button.buttonId,
                    buttonText: typeof buttonText === 'string' ? { displayText: buttonText } : buttonText,
                    type: button.type || ButtonType.RESPONSE
                };
            })
        };
        if (hasOptionalProperty(message, 'text')) {
            buttonsMessage.contentText = message.text;
            buttonsMessage.headerType = ButtonHeaderType.EMPTY;
        }
        else {
            if (hasOptionalProperty(message, 'caption')) {
                buttonsMessage.contentText = message.caption;
            }
            const type = Object.keys(m)[0].replace('Message', '').toUpperCase();
            buttonsMessage.headerType = ButtonHeaderType[type];
            Object.assign(buttonsMessage, m);
        }
        if (hasOptionalProperty(message, 'footer')) {
            buttonsMessage.footerText = message.footer;
        }
        m = { buttonsMessage };
    }
    else if (hasNonNullishProperty(message, 'sections')) {
        const listMessage = {
            sections: message.sections,
            buttonText: message.buttonText,
            title: message.title,
            footerText: message.footer,
            description: message.text,
            listType: ListType.SINGLE_SELECT
        };
        m = { listMessage };
    }
    // Lia@Note 03-02-26 --- This message type is shown on WhatsApp Web/Desktop and iOS (I guess ｡⁠◕⁠‿⁠◕⁠｡). On Android, it only appears in newsletter (so far ಥ⁠‿⁠ಥ)
    else if (hasNonNullishProperty(message, 'templateButtons')) {
        const hydratedTemplate = {
            hydratedButtons: message.templateButtons.map((button, i) => {
                if (hasOptionalProperty(button, 'id')) {
                    return {
                        index: i,
                        quickReplyButton: {
                            displayText: button.text || button.buttonText || '👉🏻 Click',
                            id: button.id
                        }
                    };
                }
                else if (hasOptionalProperty(button, 'url')) {
                    return {
                        index: i,
                        urlButton: {
                            displayText: button.text || button.buttonText || '🌐 Visit',
                            url: button.url
                        }
                    };
                }
                else if (hasOptionalProperty(button, 'call')) {
                    return {
                        index: i,
                        callButton: {
                            displayText: button.text || button.buttonText || '📞 Call',
                            phoneNumber: button.call
                        }
                    };
                }
                button.index = button.index || i;
                return button;
            })
        };
        if (hasOptionalProperty(message, 'text')) {
            hydratedTemplate.hydratedContentText = message.text;
        }
        else {
            if (hasOptionalProperty(message, 'caption')) {
                hydratedTemplate.hydratedTitleText = message.title;
                hydratedTemplate.hydratedContentText = message.caption;
            };
            Object.assign(hydratedTemplate, m);
        }
        if (hasOptionalProperty(message, 'footer')) {
            hydratedTemplate.hydratedFooterText = message.footer;
        }
        hydratedTemplate.templateId = message.id || 'template-' + Date.now(); // Lia@Note 04-02-26 --- Minimal templateId to satisfy WhatsApp (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)
        m = {
            templateMessage: {
                hydratedFourRowTemplate: hydratedTemplate,
                hydratedTemplate: hydratedTemplate
            }
        }
    }
    else if (hasNonNullishProperty(message, 'nativeFlow')) {
        const interactiveMessage = {
            nativeFlowMessage: prepareNativeFlowButtons(message)
        };
        if (hasOptionalProperty(message, 'bizJid')) {
            interactiveMessage.collectionMessage = {
                bizJid: message.bizJid,
                id: message.id,
                messageVersion: 1
            };
        }
        else if (hasOptionalProperty(message, 'shopSurface')) {
            interactiveMessage.shopStorefrontMessage = {
                surface: message.shopSurface,
                id: message.id,
                messageVersion: 1
            };
        }
        if (hasOptionalProperty(message, 'text')) {
            interactiveMessage.body = { text: message.text };
        }
        else {
            if (hasOptionalProperty(message, 'caption')) {
                const isValidHeader = hasValidInteractiveHeader(m)
                if (!isValidHeader) {
                   throw new Boom('Invalid media type for interactive message header', { statusCode: 400 });
                }
                interactiveMessage.header = {
                    title: message.title || '',
                    subtitle: message.subtitle || '',
                    hasMediaAttachment: isValidHeader
                };
                interactiveMessage.body = { text: message.caption };
            }
            if (hasOptionalProperty(message, 'thumbnail') && !!message.thumbnail) {
                interactiveMessage.jpegThumbnail = message.thumbnail;
            }
            Object.assign(interactiveMessage.header, m);
        }
        if (hasOptionalProperty(message, 'audioFooter')) {
            const parseFooter = await prepareWAMessageMedia({
                audio: message.audioFooter
            }, options);
            if (!parseFooter.audioMessage) {
                throw new Boom('Invalid media type for footer', { statusCode: 400 });
            }
            interactiveMessage.footer = {
                audioMessage: parseFooter.audioMessage,
                text: message.footer || '',
                hasMediaAttachment: true
            };
        }
        else if (hasOptionalProperty(message, 'footer')) {
            interactiveMessage.footer = { text: message.footer };
        }
        m = { interactiveMessage };
    }
    else if (hasNonNullishProperty(message, 'cards')) {
        const interactiveMessage = {
            carouselMessage: {
                cards: await Promise.all(message.cards.map(async card => {
                    let carouselHeader = {};
                    if (hasNonNullishProperty(card, 'product')) {
                        carouselHeader.productMessage = await prepareProductMessage(card, options);
                    }
                    else {
                        carouselHeader = await prepareWAMessageMedia(card, options).catch(() => ({ }));
                    }
                    const isValidHeader = hasValidCarouselHeader(carouselHeader)
                    if (!isValidHeader) {
                       throw new Boom('Invalid media type for carousel card', { statusCode: 400 });
                    }
                    const carouselCard = {
                        nativeFlowMessage: prepareNativeFlowButtons(card)
                    };
                    if (hasOptionalProperty(card, 'text')) {
                        carouselCard.body = { text: card.text };
                    }
                    else {
                        if (hasOptionalProperty(card, 'caption')) {
                            carouselCard.header = {
                                title: card.title || '',
                                subtitle: card.subtitle || '',
                                hasMediaAttachment: isValidHeader
                            };
                            carouselCard.body = { text: card.caption };
                        }
                        if (hasOptionalProperty(card, 'thumbnail') && !!card.thumbnail) {
                            interactiveMessage.jpegThumbnail = card.thumbnail;
                        }
                        Object.assign(carouselCard.header, carouselHeader);
                    }
                    if (hasOptionalProperty(card, 'audioFooter')) {
                        const parseFooter = await prepareWAMessageMedia({
                            audio: card.audioFooter
                        }, options);
                        if (!parseFooter.audioMessage) {
                            throw new Boom('Invalid media type for footer', { statusCode: 400 });
                        }
                        interactiveMessage.footer = {
                            audioMessage: parseFooter.audioMessage,
                            text: card.footer || '',
                            hasMediaAttachment: true
                        };
                    }
                    else if (hasOptionalProperty(card, 'footer')) {
                        carouselCard.footer = { text: card.footer };
                    }
                    return carouselCard
                })),
                carouselCardType: CarouselCardType.UNKNOWN,
                messageVersion: 1
            }
        };
        if (hasOptionalProperty(message, 'text')) {
            interactiveMessage.body = { text: message.text };
        }
        if (hasOptionalProperty(message, 'footer')) {
            interactiveMessage.footer = { text: message.footer };
        }
        m = { interactiveMessage };
    }
    // Lia@Changes 01-02-26 --- Add request payment message
    else if (hasNonNullishProperty(message, 'requestPaymentFrom')) {
        const requestPaymentMessage = {
            amount: {
               currencyCode: 'IDR',
               offset: 1000,
               value: 1000
            },
            amount1000: 1000,
            currencyCodeIso4217: 'IDR',
            expiryTimestamp: Date.now(),
            noteMessage: m,
            requestFrom: message.requestPaymentFrom,
            ...message
        };
        delete requestPaymentMessage.requestPaymentFrom;
        if (hasNonNullishProperty(m, 'extendedTextMessage') || hasNonNullishProperty(m, 'stickerMessage')) {
            Object.assign(requestPaymentMessage.noteMessage, m);
        }
        else {
            throw new Boom('Invalid message type for request payment note message', { statusCode: 400 });
        }
        m = { requestPaymentMessage };
    }
    // Lia@Changes 01-02-26 --- Add invoice message
    else if (hasNonNullishProperty(message, 'invoiceNote')) {
        const attachment = m.imageMessage || m.documentMessage;
        const type = Object.keys(m)[0].replace('Message', '').toUpperCase();
        const invoiceMessage = {
            attachmentType: proto.Message.InvoiceMessage.AttachmentType[type === 'DOCUMENT' ? 'PDF' : 'IMAGE'],
            note: message.invoiceNote
        };
        if (attachment) {
            const { directPath, fileEncSha256, fileSha256, jpegThumbnail = undefined, mediaKey, mediaKeyTimestamp, mimetype } = attachment;
            Object.assign(invoiceMessage, {
                attachmentDirectPath: directPath,
                attachmentFileEncSha256: fileEncSha256,
                attachmentFileSha256: fileSha256,
                attachmentJpegThumbnail: jpegThumbnail,
                attachmentMediaKey: mediaKey,
                attachmentMediaKeyTimestamp: mediaKeyTimestamp,
                attachmentMimetype: mimetype,
                token: generateMessageIDV2()
            });
        }
        else {
            throw new Boom('Invalid media type for invoice message', { statusCode: 400 });
        }
        m = { invoiceMessage };
    }
    // Lia@Changes 31-01-26 --- Add direct externalAdReply access (no need to create contextInfo first)
    if (hasOptionalProperty(message, 'externalAdReply') && !!message.externalAdReply) {
        const messageType = Object.keys(m)[0];
        const key = m[messageType];
        const content = message.externalAdReply;
        if ('thumbnail' in content && !Buffer.isBuffer(content.thumbnail)) {
            throw new Boom('Thumbnail must in buffer type', { statusCode: 400 });
        }
        if (!content.url || typeof content.url !== 'string') {
            content.url = DONATE_URL; // Lia@Note 02-02-26 --- Apologies if this feels cheeky, just a fallback
        }
        const externalAdReply = {
            ...content,
            body: content.body,
            mediaType: content.mediaType || 1,
            mediaUrl: content.url + '?update=' + Date.now(),
            renderLargerThumbnail: content.largeThumbnail,
            thumbnail: content.thumbnail,
            thumbnailUrl: content.url,
            title: content.title || LIBRARY_NAME
        };
        delete externalAdReply.subTitle;
        delete externalAdReply.largeThumbnail;
        delete externalAdReply.url;
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo.externalAdReply = { ...key.contextInfo.externalAdReply, ...externalAdReply };
        }
        else if (key) {
            key.contextInfo = { externalAdReply };
        }
    }
    if (hasOptionalProperty(message, 'mentions') && message.mentions?.length) {
        const messageType = Object.keys(m)[0];
        const key = m[messageType];
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo.mentionedJid = message.mentions;
        }
        else if (key) {
            key.contextInfo = {
                mentionedJid: message.mentions
            }
        }
    }
    if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
        const messageType = Object.keys(m)[0];
        const key = m[messageType];
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo = { ...key.contextInfo, ...message.contextInfo };
        }
        else if (key) {
            key.contextInfo = message.contextInfo;
        }
    }
    // Lia@Changes 31-01-26 --- Add "groupStatus" boolean to set contextInfo.isGroupStatus and wrap message into groupStatusMessageV2
    if (hasOptionalProperty(message, 'groupStatus') && !!message.groupStatus) {
        const messageType = Object.keys(m)[0];
        const key = m[messageType];
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo.isGroupStatus = message.groupStatus;
        }
        else if (key) {
            key.contextInfo = {
                isGroupStatus: message.groupStatus
            }
        }
        m = { groupStatusMessageV2: { message: m } };
        delete message.groupStatus;
    }
    // Lia@Changes 02-02-26 --- Add "interactiveAsTemplate" boolean to wrap interactiveMessage into templateMessage
    else if (hasOptionalProperty(message, 'interactiveAsTemplate') && !!message.interactiveAsTemplate) {
        if (!m.interactiveMessage) {
            throw new Boom('Invalid message type for template', { statusCode: 400 }); // Lia@Note 02-02-26 --- To avoid bug 👀
        }
        m = {
            templateMessage: {
                interactiveMessageTemplate: m.interactiveMessage,
                templateId: message.id || 'template-' + Date.now() // Lia@Note 04-02-26 --- Minimal templateId to satisfy WhatsApp (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)
            }
        };
        delete message.interactiveAsTemplate;
    }
    // Lia@Changes 30-01-26 --- Add "ephemeral" boolean to wrap message into ephemeralMessage like "viewOnce"
    if (hasOptionalProperty(message, 'ephemeral') && !!message.ephemeral) {
        m = { ephemeralMessage: { message: m } };
        delete message.ephemeral;
    }
    else if (hasOptionalProperty(message, 'viewOnce') && !!message.viewOnce) {
        m = { viewOnceMessage: { message: m } };
    }
    // Lia@Changes 03-02-26 --- Add "viewOnceV2" boolean to wrap message into viewOnceMessageV2 like "viewOnce"
    else if (hasOptionalProperty(message, 'viewOnceV2') && !!message.viewOnceV2) {
        m = { viewOnceMessageV2: { message: m } };
        delete message.viewOnceV2;
    }
    // Lia@Changes 03-02-26 --- Add "viewOnceV2Extension" boolean to wrap message into viewOnceMessageV2Extension like "viewOnce"
    else if (hasOptionalProperty(message, 'viewOnceV2Extension') && !!message.viewOnceV2Extension) {
        m = { viewOnceMessageV2Extension: { message: m } };
        delete message.viewOnceV2Extension;
    }
    if (hasOptionalProperty(message, 'edit')) {
        m = {
            protocolMessage: {
                key: message.edit,
                editedMessage: m,
                timestampMs: Date.now(),
                type: ProtocolType.MESSAGE_EDIT
            }
        }
    }
    if (shouldIncludeReportingToken(m)) {
        m.messageContextInfo = m.messageContextInfo || {};
        if (!m.messageContextInfo.messageSecret) {
            m.messageContextInfo.messageSecret = randomBytes(32);
        }
    }
    return proto.Message.create(m);
};
export const generateWAMessageFromContent = (jid, message, options) => {
    // set timestamp to now
    // if not specified
    if (!options.timestamp) {
        options.timestamp = Date.now();
    }
    const messageContextInfo = message.messageContextInfo
    const innerMessage = normalizeMessageContent(message);
    const key = getContentType(innerMessage);
    const timestamp = unixTimestampSeconds(options.timestamp);
    const isNewsletter = isJidNewsletter(jid);
    const { quoted, userJid } = options;
    if (quoted && !isNewsletter) {
        const participant = quoted.key.fromMe
            ? userJid // TODO: Add support for LIDs
            : quoted.participant || quoted.key.participant || quoted.key.remoteJid;
        let quotedMsg = normalizeMessageContent(quoted.message);
        const msgType = getContentType(quotedMsg);
        // strip any redundant properties
        quotedMsg = proto.Message.create({ [msgType]: quotedMsg[msgType] });
        const quotedContent = quotedMsg[msgType];
        if (typeof quotedContent === 'object' && quotedContent && 'contextInfo' in quotedContent) {
            delete quotedContent.contextInfo;
        }
        const contextInfo = ('contextInfo' in innerMessage[key] && innerMessage[key]?.contextInfo) || {};
        contextInfo.participant = jidNormalizedUser(participant);
        contextInfo.stanzaId = quoted.key.id;
        contextInfo.quotedMessage = quotedMsg;
        // if a participant is quoted, then it must be a group
        // hence, remoteJid of group must also be entered
        if (jid !== quoted.key.remoteJid) {
            contextInfo.remoteJid = quoted.key.remoteJid;
        }
        if (contextInfo && innerMessage[key]) {
            /* @ts-ignore */
            innerMessage[key].contextInfo = contextInfo;
        }
    }
    if (
    // if we want to send a disappearing message
    !!options?.ephemeralExpiration &&
        // and it's not a protocol message -- delete, toggle disappear message
        key !== 'protocolMessage' &&
        // already not converted to disappearing message
        key !== 'ephemeralMessage' &&
        // newsletters don't support ephemeral messages
        !isNewsletter) {
        /* @ts-ignore */
        innerMessage[key].contextInfo = {
            ...(innerMessage[key].contextInfo || {}),
            expiration: options.ephemeralExpiration || WA_DEFAULT_EPHEMERAL
            //ephemeralSettingTimestamp: options.ephemeralOptions.eph_setting_ts?.toString()
        };
    }
    // Lia@Changes 30-01-26 --- Add deviceListMetadata inside messageContextInfo for private chat
    else if (messageContextInfo?.messageSecret && (isPnUser(jid) || isLidUser(jid))) {
        messageContextInfo.deviceListMetadata = {
            recipientKeyHash: randomBytes(10),
            recipientTimestamp: unixTimestampSeconds()
        };
        messageContextInfo.deviceListMetadataVersion = 2
    }
    message = proto.Message.create(message);
    const messageJSON = {
        key: {
            remoteJid: jid,
            fromMe: true,
            id: options?.messageId || generateMessageIDV2()
        },
        message: message,
        messageTimestamp: timestamp,
        messageStubParameters: [],
        participant: isJidGroup(jid) || isJidStatusBroadcast(jid) ? userJid : undefined, // TODO: Add support for LIDs
        status: WAMessageStatus.PENDING
    };
    return WAProto.WebMessageInfo.fromObject(messageJSON);
};
export const generateWAMessage = async (jid, content, options = {}) => {
    // ensure msg ID is with every log
    options.logger = options?.logger?.child({ msgId: options.messageId });
    // Pass jid in the options to generateWAMessageContent
    if (jid && typeof options === 'object') {
        options.jid = jid;
    }
    return generateWAMessageFromContent(jid, await generateWAMessageContent(content, options), options);
};
/** Get the key to access the true type of content */
export const getContentType = (content) => {
    if (content) {
        const keys = Object.keys(content);
        const key = keys.find(k => (k === 'conversation' || k.includes('Message')) && k !== 'senderKeyDistributionMessage');
        return key;
    }
};
/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
export const normalizeMessageContent = (content) => {
    if (!content) {
        return undefined;
    }
    // set max iterations to prevent an infinite loop
    for (let i = 0; i < 5; i++) {
        const inner = getFutureProofMessage(content);
        if (!inner) {
            break;
        }
        content = inner.message;
    }
    return content;
    // Lia@Changes 03-02-26 --- Add all futureProofMessage into getFutureProofMessage()
    function getFutureProofMessage(message) {
        return (
            message?.associatedChildMessage ||
            message?.botForwardedMessage ||
            message?.botInvokeMessage ||
            message?.botTaskMessage ||
            message?.documentWithCaptionMessage ||
            message?.editedMessage ||
            message?.ephemeralMessage ||
            message?.eventCoverImage ||
            message?.groupMentionedMessage ||
            message?.groupStatusMentionMessage ||
            message?.groupStatusMessage ||
            message?.groupStatusMessageV2 ||
            message?.limitSharingMessage ||
            message?.lottieStickerMessage ||
            message?.pollCreationMessageV4 ||
            message?.pollCreationOptionImageMessage ||
            message?.questionMessage ||
            message?.questionReplyMessage ||
            message?.statusAddYours ||
            message?.statusMentionMessage ||
            message?.viewOnceMessage ||
            message?.viewOnceMessageV2 ||
            message?.viewOnceMessageV2Extension
        );
    }
};
/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
export const extractMessageContent = (content) => {
    const extractFromTemplateMessage = (msg) => {
        if (msg.imageMessage) {
            return { imageMessage: msg.imageMessage };
        }
        else if (msg.documentMessage) {
            return { documentMessage: msg.documentMessage };
        }
        else if (msg.videoMessage) {
            return { videoMessage: msg.videoMessage };
        }
        else if (msg.locationMessage) {
            return { locationMessage: msg.locationMessage };
        }
        else {
            return {
                conversation: 'contentText' in msg ? msg.contentText : 'hydratedContentText' in msg ? msg.hydratedContentText : ''
            };
        }
    };
    content = normalizeMessageContent(content);
    if (content?.buttonsMessage) {
        return extractFromTemplateMessage(content.buttonsMessage);
    }
    if (content?.templateMessage?.hydratedFourRowTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.hydratedFourRowTemplate);
    }
    if (content?.templateMessage?.hydratedTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.hydratedTemplate);
    }
    if (content?.templateMessage?.fourRowTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.fourRowTemplate);
    }
    return content;
};
/**
 * Returns the device predicted by message ID
 */
export const getDevice = (id) => /^3A.{18}$/.test(id)
    ? 'ios'
    : /^3E.{20}$/.test(id)
        ? 'web'
        : /^(.{21}|.{32})$/.test(id)
            ? 'android'
            : /^(3F|.{18}$)/.test(id)
                ? 'desktop'
                : 'unknown';
/** Upserts a receipt in the message */
export const updateMessageWithReceipt = (msg, receipt) => {
    msg.userReceipt = msg.userReceipt || [];
    const recp = msg.userReceipt.find(m => m.userJid === receipt.userJid);
    if (recp) {
        Object.assign(recp, receipt);
    }
    else {
        msg.userReceipt.push(receipt);
    }
};
/** Update the message with a new reaction */
export const updateMessageWithReaction = (msg, reaction) => {
    const authorID = getKeyAuthor(reaction.key);
    const reactions = (msg.reactions || []).filter(r => getKeyAuthor(r.key) !== authorID);
    reaction.text = reaction.text || '';
    reactions.push(reaction);
    msg.reactions = reactions;
};
/** Update the message with a new poll update */
export const updateMessageWithPollUpdate = (msg, update) => {
    const authorID = getKeyAuthor(update.pollUpdateMessageKey);
    const reactions = (msg.pollUpdates || []).filter(r => getKeyAuthor(r.pollUpdateMessageKey) !== authorID);
    if (update.vote?.selectedOptions?.length) {
        reactions.push(update);
    }
    msg.pollUpdates = reactions;
};
/** Update the message with a new event response */
export const updateMessageWithEventResponse = (msg, update) => {
    const authorID = getKeyAuthor(update.eventResponseMessageKey);
    const responses = (msg.eventResponses || []).filter(r => getKeyAuthor(r.eventResponseMessageKey) !== authorID);
    responses.push(update);
    msg.eventResponses = responses;
};
/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
export function getAggregateVotesInPollMessage({ message, pollUpdates }, meId) {
    const opts = message?.pollCreationMessage?.options ||
        message?.pollCreationMessageV2?.options ||
        message?.pollCreationMessageV3?.options ||
        [];
    const voteHashMap = opts.reduce((acc, opt) => {
        const hash = sha256(Buffer.from(opt.optionName || '')).toString();
        acc[hash] = {
            name: opt.optionName || '',
            voters: []
        };
        return acc;
    }, {});
    for (const update of pollUpdates || []) {
        const { vote } = update;
        if (!vote) {
            continue;
        }
        for (const option of vote.selectedOptions || []) {
            const hash = option.toString();
            let data = voteHashMap[hash];
            if (!data) {
                voteHashMap[hash] = {
                    name: 'Unknown',
                    voters: []
                };
                data = voteHashMap[hash];
            }
            voteHashMap[hash].voters.push(getKeyAuthor(update.pollUpdateMessageKey, meId));
        }
    }
    return Object.values(voteHashMap);
}
/**
 * Aggregates all event responses in an event message.
 * @param msg the event creation message
 * @param meId your jid
 * @returns A list of response types & their responders
 */
export function getAggregateResponsesInEventMessage({ eventResponses }, meId) {
    const responseTypes = ['GOING', 'NOT_GOING', 'MAYBE'];
    const responseMap = {};
    for (const type of responseTypes) {
        responseMap[type] = {
            response: type,
            responders: []
        };
    }
    for (const update of eventResponses || []) {
        const responseType = update.eventResponse || 'UNKNOWN';
        if (responseType !== 'UNKNOWN' && responseMap[responseType]) {
            responseMap[responseType].responders.push(getKeyAuthor(update.eventResponseMessageKey, meId));
        }
    }
    return Object.values(responseMap);
}
/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
export const aggregateMessageKeysNotFromMe = (keys) => {
    const keyMap = {};
    for (const { remoteJid, id, participant, fromMe } of keys) {
        if (!fromMe) {
            const uqKey = `${remoteJid}:${participant || ''}`;
            if (!keyMap[uqKey]) {
                keyMap[uqKey] = {
                    jid: remoteJid,
                    participant: participant,
                    messageIds: []
                };
            }
            keyMap[uqKey].messageIds.push(id);
        }
    }
    return Object.values(keyMap);
};
const REUPLOAD_REQUIRED_STATUS = [410, 404];
/**
 * Downloads the given message. Throws an error if it's not a media message
 */
export const downloadMediaMessage = async (message, type, options, ctx) => {
    const result = await downloadMsg().catch(async (error) => {
        if (ctx &&
            typeof error?.status === 'number' && // treat errors with status as HTTP failures requiring reupload
            REUPLOAD_REQUIRED_STATUS.includes(error.status)) {
            ctx.logger.info({ key: message.key }, 'sending reupload media request...');
            // request reupload
            message = await ctx.reuploadRequest(message);
            const result = await downloadMsg();
            return result;
        }
        throw error;
    });
    return result;
    async function downloadMsg() {
        const mContent = extractMessageContent(message.message);
        if (!mContent) {
            throw new Boom('No message present', { statusCode: 400, data: message });
        }
        const contentType = getContentType(mContent);
        let mediaType = contentType?.replace('Message', '');
        const media = mContent[contentType];
        if (!media || typeof media !== 'object' || (!('url' in media) && !('thumbnailDirectPath' in media))) {
            throw new Boom(`"${contentType}" message is not a media message`);
        }
        let download;
        if ('thumbnailDirectPath' in media && !('url' in media)) {
            download = {
                directPath: media.thumbnailDirectPath,
                mediaKey: media.mediaKey
            };
            mediaType = 'thumbnail-link';
        }
        else {
            download = media;
        }
        const stream = await downloadContentFromMessage(download, mediaType, options);
        if (type === 'buffer') {
            const bufferArray = [];
            for await (const chunk of stream) {
                bufferArray.push(chunk);
            }
            return Buffer.concat(bufferArray);
        }
        return stream;
    }
};
/** Checks whether the given message is a media message; if it is returns the inner content */
export const assertMediaContent = (content) => {
    content = extractMessageContent(content);
    const mediaContent = content?.documentMessage ||
        content?.imageMessage ||
        content?.videoMessage ||
        content?.audioMessage ||
        content?.stickerMessage;
    if (!mediaContent) {
        throw new Boom('given message is not a media message', { statusCode: 400, data: content });
    }
    return mediaContent;
};
/**
 * Checks if a WebP buffer is animated by looking for VP8X chunk with animation flag
 * or ANIM/ANMF chunks
 */
const isAnimatedWebP = (buffer) => {
    // WebP must start with RIFF....WEBP
    if (
        buffer.length < 12 ||
        buffer[0] !== 0x52 ||
        buffer[1] !== 0x49 ||
        buffer[2] !== 0x46 ||
        buffer[3] !== 0x46 ||
        buffer[8] !== 0x57 ||
        buffer[9] !== 0x45 ||
        buffer[10] !== 0x42 ||
        buffer[11] !== 0x50
    ) {
        return false;
    };
    // Parse chunks starting after RIFF header (12 bytes)
    let offset = 12;
    while (offset < buffer.length - 8) {
        const chunkFourCC = buffer.toString('ascii', offset, offset + 4);
        const chunkSize = buffer.readUInt32LE(offset + 4);
        if (chunkFourCC === 'VP8X') {
            // VP8X extended header, check animation flag (bit 1 at offset+8)
            const flagsOffset = offset + 8;
            if (flagsOffset < buffer.length) {
                const flags = buffer[flagsOffset];
                if (flags & 0x02) {
                    return true;
                };
            };
        } else if (chunkFourCC === 'ANIM' || chunkFourCC === 'ANMF') {
            // ANIM or ANMF chunks indicate animation
            return true;
        };
        // Move to next chunk (chunk size + 8 bytes header, padded to even)
        offset += 8 + chunkSize + (chunkSize % 2);
    };
    return false;
};
/**
 * Checks if a buffer is a WebP file
 */
const isWebPBuffer = (buffer) => {
    return (
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
    );
};
/**
 * Lia@Changes 30-01-26
 * ---
 * Determines whether a message should include a Biz Binary Node.
 * A Biz Binary Node is added only for interactive messages
 * such as buttons or other supported interactive types.
 */
export const shouldIncludeBizBinaryNode = (message) => {
    const messageType = getContentType(message);
    return (
        messageType === 'buttonsMessage' ||
        messageType === 'interactiveMessage' ||
        messageType === 'listMessage' ||
        messageType === 'templateMessage'
    );
};
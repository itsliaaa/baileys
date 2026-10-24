export function getUrlInfo(text: any, opts?: {
    thumbnailWidth: number;
    fetchOpts: {
        timeout: number;
    };
}): Promise<{
    'canonical-url': string;
    'matched-text': any;
    title: any;
    description: any;
    originalThumbnailUrl: any;
    'preview-type': number;
} | undefined>;

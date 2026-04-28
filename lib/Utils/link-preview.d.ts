export function getUrlInfo(text: any, opts?: {
    thumbnailWidth: number;
    fetchOpts: {
        timeout: number;
    };
}): Promise<{
    'canonical-url': any;
    'matched-text': any;
    title: any;
    description: any;
    originalThumbnailUrl: any;
} | undefined>;
//# sourceMappingURL=link-preview.d.ts.map
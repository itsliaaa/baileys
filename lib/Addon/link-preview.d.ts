export function getLinkPreview(url: any, timeout?: number): Promise<{
    url: string;
    title?: undefined;
    description?: undefined;
    favicon?: undefined;
    image?: undefined;
    video?: undefined;
} | {
    url: string;
    title: any;
    description: any;
    favicon: any;
    image: any;
    video: any;
}>;

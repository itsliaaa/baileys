/**
 * Uploads images not already uploaded to WA's servers
 */
export function uploadingNecessaryImagesOfProduct(product: any, waUploadToServer: any, timeoutMs?: number): Promise<any>;
export function parseCatalogNode(node: any): {
    products: any;
    nextPageCursor: any;
};
export function parseCollectionsNode(node: any): {
    collections: any;
};
export function parseOrderDetailsNode(node: any): {
    price: {
        total: number;
        currency: any;
    };
    products: any;
};
export function toProductNode(productId: any, product: any): {
    tag: string;
    attrs: {
        compliance_category: string;
        is_hidden: any;
    };
    content: {
        tag: string;
        attrs: {};
        content: any;
    }[];
};
export function parseProductNode(productNode: any): {
    id: any;
    imageUrls: {
        requested: any;
        original: any;
    };
    reviewStatus: {
        whatsapp: any;
    };
    availability: string;
    name: any;
    retailerId: any;
    url: any;
    description: any;
    price: number;
    currency: any;
    isHidden: boolean;
};
export function uploadingNecessaryImages(images: any, waUploadToServer: any, timeoutMs?: number): Promise<any[]>;
//# sourceMappingURL=business.d.ts.map
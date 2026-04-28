export class USyncContactProtocol {
    name: string;
    getQueryElement(): {
        tag: string;
        attrs: {};
    };
    getUserElement(user: any): {
        tag: string;
        attrs: {
            type?: undefined;
        };
        content: any;
    } | {
        tag: string;
        attrs: {
            lid?: any;
            pin?: any;
            username: any;
            type?: undefined;
        };
        content?: undefined;
    } | {
        tag: string;
        attrs: {
            type: any;
        };
        content?: undefined;
    } | {
        tag: string;
        attrs: {
            type?: undefined;
        };
        content?: undefined;
    };
    parser(node: any): boolean;
}
//# sourceMappingURL=USyncContactProtocol.d.ts.map
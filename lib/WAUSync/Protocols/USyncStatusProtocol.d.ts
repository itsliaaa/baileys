export class USyncStatusProtocol {
    name: string;
    getQueryElement(): {
        tag: string;
        attrs: {};
    };
    getUserElement(): null;
    parser(node: any): {
        status: any;
        setAt: Date;
    } | undefined;
}
//# sourceMappingURL=USyncStatusProtocol.d.ts.map
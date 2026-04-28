export class USyncLIDProtocol {
    name: string;
    getQueryElement(): {
        tag: string;
        attrs: {};
    };
    getUserElement(user: any): {
        tag: string;
        attrs: {
            jid: any;
        };
    } | null;
    parser(node: any): any;
}
//# sourceMappingURL=UsyncLIDProtocol.d.ts.map
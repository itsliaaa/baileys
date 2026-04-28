export class USyncDeviceProtocol {
    name: string;
    getQueryElement(): {
        tag: string;
        attrs: {
            version: string;
        };
    };
    getUserElement(): null;
    parser(node: any): {
        deviceList: {
            id: number;
            keyIndex: number;
            isHosted: boolean;
        }[];
        keyIndex: {
            timestamp: number;
            signedKeyIndex: any;
            expectedTimestamp: number | undefined;
        } | undefined;
    };
}
//# sourceMappingURL=USyncDeviceProtocol.d.ts.map
export function binaryNodeToString(node: any, i?: number): any;
export function getBinaryNodeChildren(node: any, childTag: any): any;
export function getBinaryNodeChild(node: any, childTag: any): any;
export function getAllBinaryNodeChildren({ content }: {
    content: any;
}): any[];
export function getBinaryNodeChildBuffer(node: any, childTag: any): any;
export function getBinaryNodeChildString(node: any, childTag: any): any;
export function getBinaryNodeChildUInt(node: any, childTag: any, length: any): number | undefined;
export function assertNodeErrorFree(node: any): void;
export function reduceBinaryNodeToDictionary(node: any, tag: any): any;
export function getBinaryNodeMessages({ content }: {
    content: any;
}): {
    [k: string]: any;
}[];
export function getBizBinaryNode(message: any, addBizAttributes: any): {
    tag: string;
    attrs: {
        actual_actors: string;
        host_storage: string;
        privacy_mode_ts: string;
        native_flow_name: any;
    };
    content: ({
        tag: string;
        attrs: {
            decision_id: any;
            source_type: string;
        };
        content: {
            tag: string;
            attrs: {
                value: string;
            };
        }[];
    } | {
        tag: string;
        attrs: {
            type: string;
            v: string;
        };
        content: {
            tag: string;
            attrs: {
                v: string;
                name: any;
            };
        }[];
    })[];
} | {
    tag: string;
    attrs: {
        actual_actors: string;
        host_storage: string;
        privacy_mode_ts: string;
        native_flow_name: any;
    };
    content: ({
        tag: string;
        attrs: {
            decision_id: any;
            source_type: string;
        };
        content: {
            tag: string;
            attrs: {
                value: string;
            };
        }[];
    } | {
        tag: string;
        attrs: {
            v: string;
            type: string;
        };
    })[];
};
//# sourceMappingURL=generic-utils.d.ts.map
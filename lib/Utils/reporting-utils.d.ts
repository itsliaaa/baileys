export function shouldIncludeReportingToken(message: any): boolean;
export function getMessageReportingToken(msgProtobuf: any, message: any, key: any): Promise<{
    tag: string;
    attrs: {};
    content: {
        tag: string;
        attrs: {
            v: string;
        };
        content: any;
    }[];
} | null>;
//# sourceMappingURL=reporting-utils.d.ts.map
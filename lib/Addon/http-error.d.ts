export class HttpError extends Error {
    static getStatusText(statusCode: any): any;
    constructor(message: any, options?: {});
    isHttpError: boolean;
    isServer: boolean;
    data: any;
    output: {
        statusCode: any;
        payload: {
            statusCode: any;
            error: any;
            message: any;
        };
        headers: {};
    };
    get statusCode(): any;
}

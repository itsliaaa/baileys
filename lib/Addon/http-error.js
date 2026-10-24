export class HttpError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = this.constructor.name;
        this.isHttpError = true;
        this.isServer = true;
        const statusCode = options?.statusCode || 400;
        this.data = options?.data || null;
        this.output = {
            statusCode,
            payload: {
                statusCode,
                error: HttpError.getStatusText(statusCode),
                message,
            },
            headers: {},
        };
    }
    get statusCode() {
        return this.output.statusCode;
    }
    static getStatusText(statusCode) {
        const statuses = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            501: 'Not Implemented',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
        };
        return statuses[statusCode] || 'Internal Server Error';
    }
}

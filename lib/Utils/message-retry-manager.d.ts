export const RetryReason: any;
export class MessageRetryManager {
    constructor(logger: any, maxMsgRetryCount: any);
    logger: any;
    recentMessagesMap: any;
    messageKeyIndex: Map<any, any>;
    sessionRecreateHistory: any;
    retryCounters: any;
    pendingPhoneRequests: {};
    maxMsgRetryCount: any;
    statistics: {
        totalRetries: number;
        successfulRetries: number;
        failedRetries: number;
        mediaRetries: number;
        sessionRecreations: number;
        phoneRequests: number;
    };
    /**
     * Add a recent message to the cache for retry handling
     */
    addRecentMessage(to: any, id: any, message: any): void;
    /**
     * Get a recent message from the cache
     */
    getRecentMessage(to: any, id: any): any;
    /**
     * Check if a session should be recreated based on retry count, history, and error code.
     * MAC errors (codes 4 and 7) trigger immediate session recreation regardless of timeout.
     */
    shouldRecreateSession(jid: any, hasSession: any, errorCode: any): {
        reason: string;
        recreate: boolean;
    };
    /**
     * Parse error code from retry receipt's retry node.
     * Returns undefined if no error code is present.
     */
    parseRetryErrorCode(errorAttr: any): any;
    /**
     * Check if an error code indicates a MAC failure
     */
    isMacError(errorCode: any): boolean;
    /**
     * Increment retry counter for a message
     */
    incrementRetryCount(messageId: any): any;
    /**
     * Get retry count for a message
     */
    getRetryCount(messageId: any): any;
    /**
     * Check if message has exceeded maximum retry attempts
     */
    hasExceededMaxRetries(messageId: any): boolean;
    /**
     * Mark retry as successful
     */
    markRetrySuccess(messageId: any): void;
    /**
     * Mark retry as failed
     */
    markRetryFailed(messageId: any): void;
    /**
     * Schedule a phone request with delay
     */
    schedulePhoneRequest(messageId: any, callback: any, delay?: number): void;
    /**
     * Cancel pending phone request
     */
    cancelPendingPhoneRequest(messageId: any): void;
    clear(): void;
    keyToString(key: any): string;
    removeRecentMessage(messageId: any): void;
}
//# sourceMappingURL=message-retry-manager.d.ts.map
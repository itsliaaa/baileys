export function makeEventBuffer(logger: any): {
    process(handler: any): () => void;
    emit(event: any, evData: any): any;
    isBuffering(): boolean;
    buffer: () => void;
    flush: () => boolean;
    createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
    on: (...args: any[]) => any;
    off: (...args: any[]) => any;
    removeAllListeners: (...args: any[]) => any;
    destroy(): void;
};
//# sourceMappingURL=event-buffer.d.ts.map
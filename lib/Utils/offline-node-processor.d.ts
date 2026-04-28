/**
 * Creates a processor for offline stanza nodes that:
 * - Queues nodes for sequential processing
 * - Yields to the event loop periodically to avoid blocking
 * - Catches handler errors to prevent the processing loop from crashing
 */
export function makeOfflineNodeProcessor(nodeProcessorMap: any, deps: any, batchSize?: number): {
    enqueue: (type: any, node: any) => void;
};
//# sourceMappingURL=offline-node-processor.d.ts.map
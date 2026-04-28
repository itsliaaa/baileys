export class GroupSessionBuilder {
    constructor(senderKeyStore: any);
    senderKeyStore: any;
    process(senderKeyName: any, senderKeyDistributionMessage: any): Promise<void>;
    create(senderKeyName: any): Promise<SenderKeyDistributionMessage>;
}
import { SenderKeyDistributionMessage } from './sender-key-distribution-message.js';
//# sourceMappingURL=group-session-builder.d.ts.map
export default SessionBuilder;
declare class SessionBuilder {
    constructor(storage: any, protocolAddress: any);
    addr: any;
    storage: any;
    initOutgoing(device: any): Promise<any>;
    initIncoming(record: any, message: any): Promise<any>;
    initSession(isInitiator: any, ourEphemeralKey: any, ourSignedKey: any, theirIdentityPubKey: any, theirEphemeralPubKey: any, theirSignedPubKey: any, registrationId: any): Promise<{
        _chains: {};
        toString(): string;
        inspect(): string;
        addChain(key: any, value: any): void;
        getChain(key: any): any;
        deleteChain(key: any): void;
        chains(): Generator<any[], void, unknown>;
        serialize(): {
            registrationId: any;
            currentRatchet: {
                ephemeralKeyPair: {
                    pubKey: any;
                    privKey: any;
                };
                lastRemoteEphemeralKey: any;
                previousCounter: any;
                rootKey: any;
            };
            indexInfo: {
                baseKey: any;
                baseKeyType: any;
                closed: any;
                used: any;
                created: any;
                remoteIdentityKey: any;
            };
            _chains: {};
        };
        _serialize_chains(chains: any): {};
    }>;
    calculateSendingRatchet(session: any, remoteKey: any): void;
}

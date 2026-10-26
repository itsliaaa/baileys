export default SessionRecord;
declare class SessionRecord {
    static createEntry(): SessionEntry;
    static migrate(data: any): void;
    static deserialize(data: any): SessionRecord;
    sessions: {};
    version: string;
    serialize(): {
        _sessions: {};
        version: string;
    };
    haveOpenSession(): boolean;
    getSession(key: any): any;
    getOpenSession(): any;
    setSession(session: any): void;
    getSessions(): any[];
    closeSession(session: any): void;
    openSession(session: any): void;
    isClosed(session: any): boolean;
    removeOldSessions(): void;
    deleteAllSessions(): void;
}
declare class SessionEntry {
    static deserialize(data: any): SessionEntry;
    static _deserialize_chains(chains_data: any): {};
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
}

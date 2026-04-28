export function makeLibSignalRepository(auth: any, logger: any, pnToLIDFunc: any): {
    decryptGroupMessage({ group, authorJid, msg }: {
        group: any;
        authorJid: any;
        msg: any;
    }): any;
    processSenderKeyDistributionMessage({ item, authorJid }: {
        item: any;
        authorJid: any;
    }): Promise<any>;
    decryptMessage({ jid, type, ciphertext }: {
        jid: any;
        type: any;
        ciphertext: any;
    }): Promise<any>;
    encryptMessage({ jid, data }: {
        jid: any;
        data: any;
    }): Promise<any>;
    encryptGroupMessage({ group, meId, data }: {
        group: any;
        meId: any;
        data: any;
    }): Promise<any>;
    injectE2ESession({ jid, session }: {
        jid: any;
        session: any;
    }): Promise<any>;
    jidToSignalProtocolAddress(jid: any): any;
    lidMapping: LIDMappingStore;
    validateSession(jid: any): Promise<{
        exists: boolean;
        reason: string;
    } | {
        exists: boolean;
        reason?: undefined;
    }>;
    deleteSession(jids: any): Promise<any>;
    close(): void;
    migrateSession(fromJid: any, toJid: any): Promise<any>;
};
import { LIDMappingStore } from './lid-mapping.js';
//# sourceMappingURL=libsignal.d.ts.map
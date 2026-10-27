export function useSqliteAuthState(dbPath: any, ownedDatabase: any): Promise<{
    state: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => {};
            set: (data: any) => void;
        };
    };
    saveCreds: () => void;
    close: () => any;
}>;

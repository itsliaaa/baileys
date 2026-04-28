export function useMultiFileAuthState(folder: any): Promise<{
    state: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<{}>;
            set: (data: any) => Promise<void>;
        };
    };
    saveCreds: () => Promise<any>;
}>;
//# sourceMappingURL=use-multi-file-auth-state.d.ts.map
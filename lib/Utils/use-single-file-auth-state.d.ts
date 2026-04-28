export function useSingleFileAuthState(fileName: any): Promise<{
    state: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => {};
            set: (data: any) => void;
        };
    };
    saveCreds: () => void;
}>;
//# sourceMappingURL=use-single-file-auth-state.d.ts.map
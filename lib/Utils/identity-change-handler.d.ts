export function handleIdentityChange(node: any, ctx: any): Promise<{
    action: string;
    device?: undefined;
    error?: undefined;
} | {
    action: string;
    device: number;
    error?: undefined;
} | {
    action: string;
    error: unknown;
    device?: undefined;
}>;
//# sourceMappingURL=identity-change-handler.d.ts.map
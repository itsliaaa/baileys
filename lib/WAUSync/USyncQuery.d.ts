export class USyncQuery {
    protocols: any[];
    users: any[];
    context: string;
    mode: string;
    withMode(mode: any): this;
    withContext(context: any): this;
    withUser(user: any): this;
    parseUSyncQueryResult(result: any): {
        list: never[];
        sideList: never[];
    } | undefined;
    withDeviceProtocol(): this;
    withContactProtocol(): this;
    withStatusProtocol(): this;
    withDisappearingModeProtocol(): this;
    withBotProfileProtocol(): this;
    withLIDProtocol(): this;
    withUsernameProtocol(): this;
}
//# sourceMappingURL=USyncQuery.d.ts.map
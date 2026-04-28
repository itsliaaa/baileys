export namespace CompanionWebClientType {
    let UNKNOWN: number;
    let CHROME: number;
    let EDGE: number;
    let FIREFOX: number;
    let IE: number;
    let OPERA: number;
    let SAFARI: number;
    let ELECTRON: number;
    let UWP: number;
    let OTHER_WEB_CLIENT: number;
}
export function getCompanionWebClientType([os, browserName]: [any, any]): any;
export function getCompanionPlatformId(browser: any): any;
export function buildPairingQRData(ref: any, noiseKeyB64: any, identityKeyB64: any, advB64: any, browser: any): string;
//# sourceMappingURL=companion-reg-client-utils.d.ts.map
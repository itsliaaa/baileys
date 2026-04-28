export class LIDMappingStore {
    constructor(keys: any, logger: any, pnToLIDFunc: any);
    mappingCache: any;
    inflightLIDLookups: Map<any, any>;
    inflightPNLookups: Map<any, any>;
    keys: any;
    pnToLIDFunc: any;
    logger: any;
    storeLIDPNMappings(pairs: any): Promise<void>;
    getLIDForPN(pn: any): Promise<any>;
    getLIDsForPNs(pns: any): Promise<any>;
    _getLIDsForPNsImpl(pns: any): Promise<any[] | null>;
    getPNForLID(lid: any): Promise<any>;
    getPNsForLIDs(lids: any): Promise<any>;
    _getPNsForLIDsImpl(lids: any): Promise<any[] | null>;
    /**
    * Close the cache and release resources
    */
    close(): void;
}
//# sourceMappingURL=lid-mapping.d.ts.map
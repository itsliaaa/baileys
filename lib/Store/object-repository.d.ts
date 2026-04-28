export class ObjectRepository {
    constructor(entities?: {});
    entityMap: Map<string, any>;
    findById(id: any): any;
    findAll(): any[];
    upsertById(id: any, entity: any): Map<string, any>;
    deleteById(id: any): boolean;
    count(): number;
    toJSON(): any[];
}
//# sourceMappingURL=object-repository.d.ts.map
export class KeyedDB {
    constructor(key: any, id: any);
    clear(): void;
    insertIfAbsent(...values: any[]): any[];
    upsert(...values: any[]): any[];
    update(id: any, callback: any): 1 | 2 | undefined;
    get(id: any): any;
    deleteById(id: any, assertPresent?: boolean): any;
    delete(value: any): any;
    filter(predicate?: () => boolean): KeyedDB;
    all(): any[];
    toJSON(): any[];
    #private;
}

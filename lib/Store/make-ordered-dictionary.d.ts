export function makeOrderedDictionary(idGetter: any): {
    array: any[];
    get: (id: any) => any;
    upsert: (item: any, mode: any) => void;
    update: (item: any) => boolean;
    remove: (item: any) => boolean;
    updateAssign: (id: any, update: any) => boolean;
    clear: () => void;
    filter: (contain: any) => void;
    toJSON: () => any[];
    fromJSON: (newItems: any) => void;
};
//# sourceMappingURL=make-ordered-dictionary.d.ts.map
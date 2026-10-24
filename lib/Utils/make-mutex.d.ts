export function makeMutex(): {
    mutex(code: any): any;
};
export function makeKeyedMutex(): {
    mutex(key: any, task: any): Promise<any>;
};

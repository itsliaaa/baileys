import { createMutex } from '../Addon/index.js';
export const makeMutex = () => {
    const mutex = createMutex();
    return {
        mutex(code) {
            return mutex.runExclusive(code);
        }
    };
};
export const makeKeyedMutex = () => {
    const map = new Map();
    return {
        async mutex(key, task) {
            let entry = map.get(key);
            if (!entry) {
                entry = { mutex: createMutex(), refCount: 0 };
                map.set(key, entry);
            }
            entry.refCount++;
            try {
                return await entry.mutex.runExclusive(task);
            }
            finally {
                entry.refCount--;
                // only delete it if this is still the current entry
                if (entry.refCount === 0 && map.get(key) === entry) {
                    map.delete(key);
                }
            }
        }
    };
};

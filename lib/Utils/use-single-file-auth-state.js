import { readFile, rename, open } from 'node:fs/promises';
import { proto } from '../../WAProto/index.js';
import { createMutex } from '../Addon/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
// Lia@Changes 27-10-26 --- Refactored useSingleFileAuthState with debounced atomic flush and shared mutex for better stability and RAM consumption
const FLUSH_DELAY_MS = 3000;
const files = new Map();
export const useSingleFileAuthState = async (fileName) => {
    let shared = files.get(fileName);
    if (!shared)
        files.set(fileName, shared = { mutex: createMutex(), flush: null });
    const { mutex } = shared;
    await shared.flush?.();
    const tempFile = fileName + '.temp';
    const store = Object.create(null);
    let ver = 0, saved = 0, timer = null;
    await mutex.runExclusive(async () => {
        try {
            Object.assign(store, JSON.parse(await readFile(fileName, 'utf-8'), BufferJSON.reviver));
        }
        catch (err) {
            if (err.code === 'EISDIR')
                throw new Error(`found something that is not a file at ${fileName}, either delete it or specify a different location`);
            if (err.code !== 'ENOENT')
                await rename(fileName, fileName + '.corrupt').catch(() => { });
        }
    });
    const flush = () => {
        clearTimeout(timer);
        timer = null;
        return mutex.runExclusive(async () => {
            if (ver === saved)
                return;
            const v = ver;
            try {
                const fh = await open(tempFile, 'w');
                try {
                    await fh.writeFile(JSON.stringify(store, BufferJSON.replacer));
                    await fh.datasync();
                }
                finally {
                    await fh.close();
                }
                await rename(tempFile, fileName);
                saved = v;
            }
            catch {
                schedule();
            }
        });
    };
    const schedule = () => {
        timer ?? (timer = setTimeout(flush, FLUSH_DELAY_MS));
    };
    shared.flush = flush;
    const creds = store.creds ?? (store.creds = initAuthCreds());
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        const value = store[type + id];
                        data[id] = value && type === 'app-state-sync-key'
                            ? proto.Message.AppStateSyncKeyData.fromObject(value)
                            : value;
                    }
                    return data;
                },
                set: (data) => {
                    for (const type in data) {
                        const items = data[type];
                        for (const id in items) {
                            const value = items[id];
                            if (value)
                                store[type + id] = value;
                            else
                                delete store[type + id];
                        }
                    }
                    ver++;
                    schedule();
                }
            }
        },
        saveCreds: () => {
            ver++;
            return flush();
        },
        flush
    };
};

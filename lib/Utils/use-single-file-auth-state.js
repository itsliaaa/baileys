import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import { DEFAULT_CACHE_TTLS } from '../Defaults/index.js';
import { proto } from '../../WAProto/index.js';
import { createCache, createMutex } from '../Addon/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
// Lia@Changes 25-03-26 --- Add useSingleFileAuthState with integrated cache
const FLUSH_TIMEOUT_MS = 3000;
// Lia@Changes 22-04-26 --- Enhanced useSingleFileAuthState with LRUCache
export const useSingleFileAuthState = async (fileName) => {
    const cache = createCache({
        max: 20000,
        ttl: DEFAULT_CACHE_TTLS.SIGNAL_STORE
    });
    // Lia@Changes 26-04-26 --- Add mutex for prevent race condition
    const mutex = createMutex();
    let fileData = {};
    let isLoaded = false;
    let flushTimeout = null;
    const loadKey = async () => {
        return await mutex.runExclusive(async () => {
            if (isLoaded)
                return;
            try {
                const data = JSON.parse(await readFile(fileName, 'utf-8'), BufferJSON.reviver);
                fileData = data || {};
                for (const [keyName, value] of Object.entries(fileData)) {
                    cache.set(keyName, value);
                }
            }
            catch {
                fileData = {};
            }
            isLoaded = true;
        });
    };
    const flushKey = () => {
        if (flushTimeout)
            return;
        flushTimeout = setTimeout(async () => {
            flushTimeout = null;
            await mutex.runExclusive(async () => {
                try {
                    const tempFile = fileName + '.temp';
                    await writeFile(tempFile, JSON.stringify(fileData, BufferJSON.replacer));
                    await rename(tempFile, fileName);
                }
                catch { }
            });
        }, FLUSH_TIMEOUT_MS);
    };
    const writeKey = (keyName, value) => {
        cache.set(keyName, value);
        fileData[keyName] = value;
        flushKey();
    };
    const removeKey = (keyName) => {
        cache.delete(keyName);
        delete fileData[keyName];
        flushKey();
    };
    const fileInfo = await stat(fileName).catch(() => null);
    if (!fileInfo) {
        await writeFile(fileName, '{}');
    }
    else if (!fileInfo.isFile()) {
        throw new Error(`found something that is not a file at ${fileName}, either delete it or specify a different location`);
    }
    await loadKey();
    const creds = fileData['creds'] || initAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        const keyName = type + id;
                        let value = cache.get(keyName);
                        if (value === undefined && fileData[keyName] !== undefined) {
                            value = fileData[keyName];
                            cache.set(keyName, value);
                        }
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }
                    return data;
                },
                set: (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const keyName = category + id;
                            const value = data[category][id];
                            value ? writeKey(keyName, value) : removeKey(keyName);
                        }
                    }
                }
            }
        },
        saveCreds: () => writeKey('creds', creds)
    };
};

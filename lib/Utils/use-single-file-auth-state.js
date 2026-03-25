import { readFile, rename, stat, writeFile } from 'fs/promises';
import { DEFAULT_CACHE_TTLS } from '../Defaults/index.js';
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
// Lia@Changes 25-03-26 --- Add useSingleFileAuthState with integrated cache
const FLUSH_TIMEOUT_MS = 3000
export const useSingleFileAuthState = async (fileName) => {
    const cache = new Map();
    let isLoaded,
        isWriting,
        isNeedWrite,
        flushTimeout,
        loadPromise;
    const loadKey = () => {
        if (isLoaded) return;
        if (loadPromise) return loadPromise;
        loadPromise = (async () => {
            try {
                const data = JSON.parse(await readFile(fileName, 'utf-8'), BufferJSON.reviver);
                for (const [keyName, value] of Object.entries(data)) {
                    cache.set(keyName, value);
                }
            }
            catch { }
            isLoaded = true;
            loadPromise = null;
        })();
        return loadPromise;
    };
    const flushKey = () => {
        if (flushTimeout) return;
        flushTimeout = setTimeout(async () => {
            flushTimeout = null;
            if (isWriting) {
                isNeedWrite = true;
                return;
            }
            isWriting = true;
            do {
                isNeedWrite = false;
                const tempFile = fileName + '.temp';
                const value = Object.fromEntries(cache);
                await writeFile(tempFile, JSON.stringify(value, BufferJSON.replacer));
                await rename(tempFile, fileName);
            }
            while (isNeedWrite);
            isWriting = false;
        }, FLUSH_TIMEOUT_MS);
    };
    const writeKey = (keyName, value) => {
        cache.set(keyName, value);
        flushKey();
    };
    const removeKey = (keyName) => {
        cache.delete(keyName);
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
    const creds = cache.get('creds') || initAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        let value = cache.get(type + '-' + id);
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
                            const keyName = category + '-' + id;
                            const value = data[category][id];
                            value ? writeKey(keyName, value) : removeKey(keyName)
                        }
                    }
                },
                clear: () => cache.clear()
            }
        },
        saveCreds: () => writeKey('creds', creds)
    };
};
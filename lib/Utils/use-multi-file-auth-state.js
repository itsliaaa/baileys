import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { proto } from '../../WAProto/index.js';
import { createMutex } from '../Addon/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
// Lia@Changes 27-10-26 --- Refactored useMultiFileAuthState with atomic writes and per-file mutex for better stability and RAM consumption
const WRITE_BATCH = 32;
const locks = new Map();
const noop = () => { };
const withLock = async (path, fn) => {
    let entry = locks.get(path);
    if (!entry)
        locks.set(path, entry = { mutex: createMutex(), refs: 0 });
    entry.refs++;
    try {
        return await entry.mutex.runExclusive(fn);
    }
    finally {
        if (!--entry.refs)
            locks.delete(path);
    }
};
const writeAtomic = async (path, json, durable) => {
    const tmp = path + '.tmp';
    const fh = await open(tmp, 'w');
    try {
        await fh.writeFile(json);
        if (durable)
            await fh.datasync();
    }
    finally {
        await fh.close();
    }
    await rename(tmp, path);
};
const readJson = (path, quarantine) => withLock(path, async () => {
    let raw;
    try {
        raw = await readFile(path, 'utf-8');
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return null;
        throw err;
    }
    try {
        return JSON.parse(raw, BufferJSON.reviver);
    }
    catch {
        if (quarantine)
            await rename(path, path + '.corrupt').catch(noop);
        return null;
    }
});
const fixFileName = (file) => file.replace(/\//g, '__').replace(/:/g, '-');
export const useMultiFileAuthState = async (folder) => {
    try {
        await mkdir(folder, { recursive: true });
    }
    catch (err) {
        if (err.code === 'EEXIST' || err.code === 'ENOTDIR')
            throw new Error(`Found something that is not a directory at ${folder}, either delete it or specify a different location`);
        throw err;
    }
    const pathOf = (file) => join(folder, fixFileName(file));
    const credsPath = pathOf('creds.json');
    const creds = await readJson(credsPath, true) ?? initAuthCreds();
    let lastCreds;
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readJson(pathOf(`${type}-${id}.json`));
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        const items = data[category];
                        for (const id in items) {
                            const value = items[id];
                            const path = pathOf(`${category}-${id}.json`);
                            tasks.push(value
                                ? () => withLock(path, () => writeAtomic(path, JSON.stringify(value, BufferJSON.replacer), false))
                                : () => withLock(path, () => unlink(path).catch((err) => {
                                    if (err.code !== 'ENOENT')
                                        throw err;
                                })));
                        }
                    }
                    for (let i = 0; i < tasks.length; i += WRITE_BATCH) {
                        await Promise.all(tasks.slice(i, i + WRITE_BATCH).map((run) => run()));
                    }
                }
            }
        },
        saveCreds: () => {
            const json = JSON.stringify(creds, BufferJSON.replacer);
            if (json === lastCreds)
                return Promise.resolve();
            return withLock(credsPath, async () => {
                await writeAtomic(credsPath, json, true);
                lastCreds = json;
            });
        }
    };
};

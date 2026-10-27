import { proto } from '../../WAProto/index.js';
import { calculateMAC, decrypt, deriveSecrets, encrypt, verifyMAC } from './crypto.js';
import { calculateAgreement, generateKeyPair } from './curve.js';
import { ChainType, ProtocolAddress, errors, queueJob } from './internals.js';
import SessionBuilder from './session-builder.js';
import SessionRecord from './session-record.js';
const VERSION = 3;
function assertBuffer(value) {
    if (!Buffer.isBuffer(value)) {
        throw TypeError(`Expected Buffer instead of: ${value.constructor.name}`);
    }
    return value;
}
class SessionCipher {
    constructor(storage, protocolAddress) {
        if (!(protocolAddress instanceof ProtocolAddress)) {
            throw new TypeError('protocolAddress must be a ProtocolAddress');
        }
        this.addr = protocolAddress;
        this.storage = storage;
    }
    _encodeTupleByte(number1, number2) {
        if (number1 > 15 || number2 > 15) {
            throw TypeError('Numbers must be 4 bits or less');
        }
        return (number1 << 4) | number2;
    }
    _decodeTupleByte(byte) {
        return [byte >> 4, byte & 0xf];
    }
    toString() {
        return `<SessionCipher(${this.addr.toString()})>`;
    }
    async getRecord() {
        const record = await this.storage.loadSession(this.addr.toString());
        if (record && !(record instanceof SessionRecord)) {
            throw new TypeError('SessionRecord type expected from loadSession');
        }
        return record;
    }
    async storeRecord(record) {
        record.removeOldSessions();
        await this.storage.storeSession(this.addr.toString(), record);
    }
    async queueJob(awaitable) {
        return await queueJob(this.addr.toString(), awaitable);
    }
    async encrypt(data) {
        assertBuffer(data);
        const ourIdentityKey = await this.storage.getOurIdentity();
        return await this.queueJob(async () => {
            const record = await this.getRecord();
            if (!record) {
                throw new errors.SessionError('No sessions');
            }
            const session = record.getOpenSession();
            if (!session) {
                throw new errors.SessionError('No open session');
            }
            const remoteIdentityKey = session.indexInfo.remoteIdentityKey;
            if (!await this.storage.isTrustedIdentity(this.addr.id, remoteIdentityKey)) {
                throw new errors.UntrustedIdentityKeyError(this.addr.id, remoteIdentityKey);
            }
            const chain = session.getChain(session.currentRatchet.ephemeralKeyPair.pubKey);
            if (chain.chainType === ChainType.RECEIVING) {
                throw new Error('Tried to encrypt on a receiving chain');
            }
            this.fillMessageKeys(chain, chain.chainKey.counter + 1);
            const keys = deriveSecrets(chain.messageKeys[chain.chainKey.counter], Buffer.alloc(32), Buffer.from('WhisperMessageKeys'));
            delete chain.messageKeys[chain.chainKey.counter];
            const msg = proto.SignalMessage.create();
            msg.ratchetKey = session.currentRatchet.ephemeralKeyPair.pubKey;
            msg.counter = chain.chainKey.counter;
            msg.previousCounter = session.currentRatchet.previousCounter;
            msg.ciphertext = encrypt(keys[0], data, keys[2].slice(0, 16));
            const msgBuf = proto.SignalMessage.encode(msg).finish();
            const macInput = Buffer.alloc(msgBuf.byteLength + (33 * 2) + 1);
            macInput.set(ourIdentityKey.pubKey);
            macInput.set(session.indexInfo.remoteIdentityKey, 33);
            macInput[33 * 2] = this._encodeTupleByte(VERSION, VERSION);
            macInput.set(msgBuf, (33 * 2) + 1);
            const mac = calculateMAC(keys[1], macInput);
            const result = Buffer.alloc(msgBuf.byteLength + 9);
            result[0] = this._encodeTupleByte(VERSION, VERSION);
            result.set(msgBuf, 1);
            result.set(mac.slice(0, 8), msgBuf.byteLength + 1);
            await this.storeRecord(record);
            let type, body;
            if (session.pendingPreKey) {
                type = 3;
                const preKeyMsg = proto.PreKeySignalMessage.create({
                    identityKey: ourIdentityKey.pubKey,
                    registrationId: await this.storage.getOurRegistrationId(),
                    baseKey: session.pendingPreKey.baseKey,
                    signedPreKeyId: session.pendingPreKey.signedKeyId,
                    message: result
                });
                if (session.pendingPreKey.preKeyId) {
                    preKeyMsg.preKeyId = session.pendingPreKey.preKeyId;
                }
                body = Buffer.concat([
                    Buffer.from([this._encodeTupleByte(VERSION, VERSION)]),
                    Buffer.from(proto.PreKeySignalMessage.encode(preKeyMsg).finish())
                ]);
            }
            else {
                type = 1;
                body = result;
            }
            return {
                type,
                body,
                registrationId: session.registrationId
            };
        });
    }
    async decryptWithSessions(data, sessions) {
        if (!sessions.length) {
            throw new errors.SessionError('No sessions available');
        }
        for (const session of sessions) {
            let plaintext;
            try {
                plaintext = await this.doDecryptWhisperMessage(data, session);
                session.indexInfo.used = Date.now();
                return {
                    session,
                    plaintext
                };
            }
            catch {
                // Try the next known session without retaining failed error objects.
            }
        }
        throw new errors.SessionError('No matching sessions found for message');
    }
    async decryptWhisperMessage(data) {
        assertBuffer(data);
        return await this.queueJob(async () => {
            const record = await this.getRecord();
            if (!record) {
                throw new errors.SessionError('No session record');
            }
            const result = await this.decryptWithSessions(data, record.getSessions());
            const remoteIdentityKey = result.session.indexInfo.remoteIdentityKey;
            if (!await this.storage.isTrustedIdentity(this.addr.id, remoteIdentityKey)) {
                throw new errors.UntrustedIdentityKeyError(this.addr.id, remoteIdentityKey);
            }
            if (record.isClosed(result.session)) {
                // It's possible for this to happen when processing a backlog of messages.
                // The message was, hopefully, just sent back in a time when this session
                // was the most current.  Simply make a note of it and continue.  If our
                // actual open session is for reason invalid, that must be handled via
                // a full SessionError response.
                // Backlog messages may legitimately belong to a closed session.
            }
            await this.storeRecord(record);
            return result.plaintext;
        });
    }
    async decryptPreKeyWhisperMessage(data) {
        assertBuffer(data);
        const versions = this._decodeTupleByte(data[0]);
        if (versions[1] > 3 || versions[0] < 3) {
            throw new Error('Incompatible version number on PreKeySignalMessage');
        }
        return await this.queueJob(async () => {
            let record = await this.getRecord();
            const preKeyProto = proto.PreKeySignalMessage.decode(data.slice(1));
            if (!record) {
                if (preKeyProto.registrationId == null) {
                    throw new Error('No registrationId');
                }
                record = new SessionRecord();
            }
            const builder = new SessionBuilder(this.storage, this.addr);
            const preKeyId = await builder.initIncoming(record, preKeyProto);
            const session = record.getSession(preKeyProto.baseKey);
            const plaintext = await this.doDecryptWhisperMessage(preKeyProto.message, session);
            await this.storeRecord(record);
            if (preKeyId !== null) {
                await this.storage.removePreKey(preKeyId);
            }
            return plaintext;
        });
    }
    async doDecryptWhisperMessage(messageBuffer, session) {
        assertBuffer(messageBuffer);
        if (!session) {
            throw new TypeError('session required');
        }
        const versions = this._decodeTupleByte(messageBuffer[0]);
        if (versions[1] > 3 || versions[0] < 3) {
            throw new Error('Incompatible version number on SignalMessage');
        }
        const messageProto = messageBuffer.slice(1, -8);
        const message = proto.SignalMessage.decode(messageProto);
        this.maybeStepRatchet(session, message.ratchetKey, message.previousCounter);
        const chain = session.getChain(message.ratchetKey);
        if (chain.chainType === ChainType.SENDING) {
            throw new Error('Tried to decrypt on a sending chain');
        }
        this.fillMessageKeys(chain, message.counter);
        if (!chain.messageKeys.hasOwnProperty(message.counter)) {
            // Most likely the message was already decrypted and we are trying to process
            // twice.  This can happen if the user restarts before the server gets an ACK.
            throw new errors.MessageCounterError('Key used already or never filled');
        }
        const messageKey = chain.messageKeys[message.counter];
        delete chain.messageKeys[message.counter];
        const keys = deriveSecrets(messageKey, Buffer.alloc(32), Buffer.from('WhisperMessageKeys'));
        const ourIdentityKey = await this.storage.getOurIdentity();
        const macInput = Buffer.alloc(messageProto.byteLength + (33 * 2) + 1);
        macInput.set(session.indexInfo.remoteIdentityKey);
        macInput.set(ourIdentityKey.pubKey, 33);
        macInput[33 * 2] = this._encodeTupleByte(VERSION, VERSION);
        macInput.set(messageProto, (33 * 2) + 1);
        verifyMAC(macInput, keys[1], messageBuffer.slice(-8), 8);
        const plaintext = decrypt(keys[0], message.ciphertext, keys[2].slice(0, 16));
        delete session.pendingPreKey;
        return plaintext;
    }
    fillMessageKeys(chain, counter) {
        if (chain.chainKey.counter >= counter) {
            return;
        }
        if (counter - chain.chainKey.counter > 2000) {
            throw new errors.SessionError('Over 2000 messages into the future!');
        }
        if (chain.chainKey.key === undefined) {
            throw new errors.SessionError('Chain closed');
        }
        while (chain.chainKey.counter < counter) {
            const key = chain.chainKey.key;
            if (key === undefined) {
                throw new errors.SessionError('Chain closed');
            }
            const nextCounter = chain.chainKey.counter + 1;
            chain.messageKeys[nextCounter] = calculateMAC(key, Buffer.from([1]));
            chain.chainKey.key = calculateMAC(key, Buffer.from([2]));
            chain.chainKey.counter = nextCounter;
        }
    }
    maybeStepRatchet(session, remoteKey, previousCounter) {
        if (session.getChain(remoteKey)) {
            return;
        }
        const ratchet = session.currentRatchet;
        let previousRatchet = session.getChain(ratchet.lastRemoteEphemeralKey);
        if (previousRatchet) {
            this.fillMessageKeys(previousRatchet, previousCounter);
            delete previousRatchet.chainKey.key;
        }
        this.calculateRatchet(session, remoteKey, false);
        const prevCounter = session.getChain(ratchet.ephemeralKeyPair.pubKey);
        if (prevCounter) {
            ratchet.previousCounter = prevCounter.chainKey.counter;
            session.deleteChain(ratchet.ephemeralKeyPair.pubKey);
        }
        ratchet.ephemeralKeyPair = generateKeyPair();
        this.calculateRatchet(session, remoteKey, true);
        ratchet.lastRemoteEphemeralKey = remoteKey;
    }
    calculateRatchet(session, remoteKey, sending) {
        let ratchet = session.currentRatchet;
        const sharedSecret = calculateAgreement(remoteKey, ratchet.ephemeralKeyPair.privKey);
        const masterKey = deriveSecrets(sharedSecret, ratchet.rootKey, Buffer.from('WhisperRatchet'), /*chunks*/ 2);
        const chainKey = sending ? ratchet.ephemeralKeyPair.pubKey : remoteKey;
        session.addChain(chainKey, {
            messageKeys: {},
            chainKey: {
                counter: -1,
                key: masterKey[1]
            },
            chainType: sending ? ChainType.SENDING : ChainType.RECEIVING
        });
        ratchet.rootKey = masterKey[0];
    }
    async hasOpenSession() {
        return await this.queueJob(async () => {
            const record = await this.getRecord();
            if (!record) {
                return false;
            }
            return record.haveOpenSession();
        });
    }
    async closeOpenSession() {
        return await this.queueJob(async () => {
            const record = await this.getRecord();
            if (record) {
                const openSession = record.getOpenSession();
                if (openSession) {
                    record.closeSession(openSession);
                    await this.storeRecord(record);
                }
            }
        });
    }
}
export default SessionCipher;

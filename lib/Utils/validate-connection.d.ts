export function generateLoginNode(userJid: any, config: any): proto.ClientPayload;
export function generateRegistrationNode({ registrationId, signedPreKey, signedIdentityKey }: {
    registrationId: any;
    signedPreKey: any;
    signedIdentityKey: any;
}, config: any): proto.ClientPayload;
export function configureSuccessfulPairing(stanza: any, { advSecretKey, signedIdentityKey, signalIdentities }: {
    advSecretKey: any;
    signedIdentityKey: any;
    signalIdentities: any;
}): {
    creds: {
        account: proto.ADVSignedDeviceIdentity;
        me: {
            id: any;
            name: any;
            lid: any;
        };
        signalIdentities: any[];
        platform: any;
    };
    reply: {
        tag: string;
        attrs: {
            to: "@s.whatsapp.net";
            type: string;
            id: any;
        };
        content: {
            tag: string;
            attrs: {};
            content: {
                tag: string;
                attrs: {
                    'key-index': string;
                };
                content: any;
            }[];
        }[];
    };
};
export function encodeSignedDeviceIdentity(account: any, includeSignatureKey: any): any;
import { proto } from '../../WAProto/index.js';
//# sourceMappingURL=validate-connection.d.ts.map
# 🌱 @itsliaaa/baileys

![Logo](https://files.catbox.moe/c5s9g0.jpg)

A lightweight fork of Baileys with a few fixes and a small adjustment.

## ⚙️ **Changes**

### 🛠️ Internal Adjustments
- 🖼️ Fixed an issue where media could not be sent to newsletters due to an upstream issue.
- 📁 Reintroduced `makeInMemoryStore` with a minimal ESM adaptation and small adjustments for Baileys v7.
- 📦 Switched FFmpeg execution from `exec` to `spawn` for safer process handling.

### 📨 Message Handling & Compatibility
- 👉🏻 Added support for sending interactive message types (button, list, interactive, template, carousel).
- 📩 Added support for album messages, group status messages, sticker pack messages, and several payment-related messages (request payment, payment invite, order, invoice).
- 📰 Simplified sending messages with ad thumbnails via `externalAdReply` without requiring manual `contextInfo`.

### 🧩 Additional Message Options
- 👁️ Added optional boolean flags for message handling:  
   - `ai` - AI label on message
   - `ephemeral`, `groupStatus`, `viewOnceV2`, `viewOnceV2Extension`, `interactiveAsTemplate` - Message wrappers
   - `raw` - Build your message manually **(DO NOT USE FOR EXPLOITATION)**

> [!NOTE]
📄 This project is maintained with limited scope and is not intended to replace upstream Baileys.
>
> 😞 And, really sorry for my bad english.

## 📥 **Installation**

- 📄 Via `package.json`
```json
# NPM
"dependencies": {
   "@itsliaaa/baileys": "latest"
}

# GitHub
"dependencies": {
   "@itsliaaa/baileys": "github:itsliaaa/baileys"
}
```

- ⌨️ Via terminal
```bash
# NPM
npm i @itsliaaa/baileys@latest

# GitHub
npm i github:itsliaaa/baileys
```

- 🧩 Import (ESM & CJS)
```javascript
// --- ESM
import { makeWASocket } from '@itsliaaa/baileys'

// --- CJS (tested and working on Node.js 24 ✅)
const { makeWASocket } = require('@itsliaaa/baileys')
```

## 🔧 **Usage**

<details open>
<summary><strong>🌐 Connect to WhatsApp (Quick Step)</strong></summary>

<br>

```javascript
import { makeWASocket, delay, DisconnectReason, useMultiFileAuthState } from '@itsliaaa/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

// --- Connect with pairing code
const myPhoneNumber = '6288888888888'

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
   const logger = pino({ level: 'silent' })
    
   const sock = makeWASocket({
      logger,
      auth: state
   })

   sock.ev.on('creds.update', saveCreds)

   sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update
      if (connection === 'connecting' && !sock.authState.creds.registered) {
         await delay(1500)
         const code = await sock.requestPairingCode(myPhoneNumber)
         console.log('🔗 Pairing code', ':', code)
      }
      else if (connection === 'close') {
         const shouldReconnect = new Boom(connection?.lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
         console.log('⚠️ Connection closed because', lastDisconnect.error, ', reconnecting ', shouldReconnect)
         if (shouldReconnect) {
            connectToWhatsApp()
         }
      }
      else if (connection === 'open') {
         console.log('✅ Successfully connected to WhatsApp')
      }
   })

   sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
         if (!message.message) continue

         console.log('🔔 Got new message', ':', message)
         await sock.sendMessage(message.key.remoteJid, {
            text: '👋🏻 Hello world'
         })
      }
   })
}

connectToWhatsApp()
```

</details>

<details>
<summary><strong>🗄️ Implementing a Data Store</strong></summary>

<br>

> 📝 I highly recommend building your own data store, as keeping an entire chat history in memory can lead to excessive RAM usage.

```javascript
import { makeWASocket, makeInMemoryStore, delay, DisconnectReason, useMultiFileAuthState } from '@itsliaaa/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

const myPhoneNumber = '6288888888888'

// --- Create your store path
const storePath = './store.json'

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
   const logger = pino({ level: 'silent' })
    
   const sock = makeWASocket({
      logger,
      auth: state
   })

   const store = makeInMemoryStore({
      logger,
      socket: sock
   })

   store.bind(sock.ev)

   sock.ev.on('creds.update', saveCreds)

   sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update
      if (connection === 'connecting' && !sock.authState.creds.registered) {
         await delay(1500)
         const code = await sock.requestPairingCode(myPhoneNumber)
         console.log('🔗 Pairing code', ':', code)
      }
      else if (connection === 'close') {
         const shouldReconnect = new Boom(connection?.lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
         console.log('⚠️ Connection closed because', lastDisconnect.error, ', reconnecting ', shouldReconnect)
         if (shouldReconnect) {
            connectToWhatsApp()
         }
      }
      else if (connection === 'open') {
         console.log('✅ Successfully connected to WhatsApp')
      }
   })

   sock.ev.on('chats.upsert', () => {
      console.log('✉️ Got chats', store.chats.all())
   })

   sock.ev.on('contacts.upsert', () => {
      console.log('👥 Got contacts', Object.values(store.contacts))
   })

   // --- Read store from file
   store.readFromFile(storePath)

   // --- Save store every 3 minutes
   setInterval(() => {
      store.writeToFile(storePath)
   }, 180000)
}

connectToWhatsApp()
```

</details>

<details>
<summary><strong>🪪 WhatsApp IDs Explain</strong></summary>

<br>

`id` is the WhatsApp ID, called `jid` and `lid` too, of the person or group you're sending the message to.
- It must be in the format `[country code][phone number]@s.whatsapp.net`
   - Example for people: `19999999999@s.whatsapp.net` and `12699999999@lid`.
   - For groups, it must be in the format `123456789-123345@g.us`.
- For Meta AI, it's `11111111111@bot`.
- For broadcast lists, it's `[timestamp of creation]@broadcast`.
- For stories, the ID is `status@broadcast`.

</details>

<details>
<summary><strong>✉️ Sending Messages</strong></summary>

<br>

> 📝 You can get the `jid` from `message.key.remoteJid` in the first example.

<details>
<summary><strong>📩 Sending Common Messages</strong></summary>

#### 🔠 Text

```javascript
sock.sendMessage(jid, {
   text: '👋🏻 Hello'
}, {
   quoted: message
})
```

#### 🔔 Mention

```javascript
sock.sendMessage(jid, {
   text: '👋🏻 Hello @628123456789',
   mentions: ['628123456789@s.whatsapp.net']
}, {
   quoted: message
})
```

#### 😁 Reaction

```javascript
sock.sendMessage(jid, {
   react: {
      key: message.key,
      text: '✨'
   }
}, {
   quoted: message
})
```

#### 📌 Pin Message

```javascript
sock.sendMessage(jid, {
   pin: message.key,
   time: 86400, // --- Set the value in seconds: 86400 (1d), 604800 (7d), or 2592000 (30d)
   type: 1 // --- Or 0 to remove
}, {
   quoted: message
})
```

#### 👤 Contact

```javascript
const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + 'FN:Elia Wynn\n'
            + 'ORG:Waiters;\n'
            + 'TEL;type=CELL;type=VOICE;waid=628123456789:+62 8123 4567 89\n'
            + 'END:VCARD'

sock.sendMessage(jid, {
   contacts: {
      displayName: 'Elia',
      contacts: [
         { vcard }
      ]
   }
}, {
   quoted: message
})
```

#### 📍 Location

```javascript
sock.sendMessage(jid, {
   location: {
      degreesLatitude: 24.121231,
      degreesLongitude: 55.1121221,
      name: '👋🏻 I am here'
   }
}, {
   quoted: message
})
```

#### 📊 Poll

```javascript
// --- Regular poll message
sock.sendMessage(jid, {
   poll: {
      name: '🔥 Voting time',
      values: ['Yes', 'No'],
      selectableCount: 1,
      toAnnouncementGroup: false
   }
}, {
   quoted: message
})

// --- Quiz (only for newsletter)
sock.sendMessage('1211111111111@newsletter', {
   poll: {
      name: '🔥 Quiz',
      values: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pollType: 1
   }
}, {
   quoted: message
})

// Poll result
sock.sendMessage(jid, {
   pollResult: {
      name: '📝 Poll Result',
      votes: [{
         name: 'Nice',
         voteCount: 10
      }, {
         name: 'Nah',
         voteCount: 2
      }],
      pollType: 0 // Or 1 for quiz
   }
}, {
   quoted: message
})

// Poll update
sock.sendMessage(jid, {
   pollUpdate: {
      metadata: {},
      key: message.key,
      vote: {
         enclv: /* <Buffer> */,
         encPayload: /* <Buffer> */
      }
   }
}, {
   quoted: message
})
```

</details>

<details>
<summary><strong>📁 Sending Media Messages</strong></summary>

> 📝 For media messages, you can pass a `Buffer` directly, or an object with either `{ stream: Readable }` or `{ url: string }` (local file path or HTTP/HTTPS URL).

#### 🖼️ Image

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🔥 Superb'
}, {
   quoted: message
})
```

#### 🎥 Video

```javascript
sock.sendMessage(jid, {
   video: {
      url: './path/to/video.mp4'
   },
   gifPlayback: false, // --- Set true if you want to send video as GIF
   ptv: false,  // --- Set true if you want to send video as PTV
   caption: '🔥 Superb'
}, {
   quoted: message
})
```

#### 📃 Sticker

```javascript
sock.sendMessage(jid, {
   sticker: {
      url: './path/to/sticker.webp'
   }
}, {
   quoted: message
})
```

#### 💽 Audio

```javascript
sock.sendMessage(jid, {
   audio: {
      url: './path/to/audio.mp3'
   },
   ptt: false, // --- Set true if you want to send audio as Voice Note
}, {
   quoted: message
})
```

#### 🖼️ Album (Image & Video)

```javascript
sock.sendMessage(jid, {
   album: [{
      image: {
         url: './path/to/image.jpg'
      },
      caption: '1st image'
   }, {
      video: {
         url: './path/to/video.mp4'
      },
      caption: '1st video'
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '2nd image'
   }, {
      video: {
         url: './path/to/video.mp4'
      },
      caption: '2nd video'
   }]
}, {
   quoted: message
})
```

#### 📦 Sticker Pack

> 📝 If Sharp is not installed, the `cover` and `stickers` must already be in WebP format.

```javascript
sock.sendMessage(jid, {
   cover: {
      url: './path/to/image.webp'
   },
   stickers: [{
      data: {
         url: './path/to/image.webp'
      }
   }, {
      data: {
         url: './path/to/image.webp'
      }
   }, {
      data: {
         url: './path/to/image.webp'
      }
   }],
   name: '📦 My Sticker Pack',
   publisher: '🌟 Elia',
   description: '@itsliaaa/baileys'
}, {
   quoted: message
})
```

</details>

<details>
<summary><strong>👉🏻 Sending Interactive Messages</strong></summary>

#### 1️⃣ Buttons (Classic)

```javascript
sock.sendMessage(jid, {
   text: '👆🏻 Buttons!',
   footer: '@itsliaaa/baileys',
   buttons: [{
      text: '👋🏻 SignUp',
      id: '#SignUp'
   }]
}, {
   quoted: message
})
```

##### 🖼️ Buttons (With Media & Native Flow)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👆🏻 Buttons and Native Flow!',
   footer: '@itsliaaa/baileys',
   buttons: [{
      text: '👋🏻 Rating',
      id: '#Rating'
   }, {
      name: 'single_select',
      paramsJson: JSON.stringify({
         title: '📋 Select',
         sections: [{
            title: '✨ Section 1',
            rows: [{
               header: '',
               title: '💭 Secret Ingredient',
               description: '',
               id: '#SecretIngredient'
            }]
         }, {
            title: '✨ Section 2',
            highlight_label: '🔥 Popular',
            rows: [{
               header: '',
               title: '🏷️ Coupon',
               description: '',
               id: '#CouponCode'
            }]
         }]
      })
   }]
}, {
   quoted: message
})
```

#### 2️⃣ List (Classic)

> 📝 It only works in private chat (`@s.whatsapp.net`).

```javascript
sock.sendMessage(jid, {
   text: '📋 List!',
   footer: '@itsliaaa/baileys',
   buttonText: '📋 Select',
   title: '👋🏻 Hello',
   sections: [{
      title: '🚀 Menu 1',
      rows: [{
         title: '✨ AI',
         description: '',
         rowId: '#AI'
      }]
   }, {
      title: '🌱 Menu 2',
      rows: [{
         title: '🔍 Search',
         description: '',
         rowId: '#Search'
      }]
   }]
}, {
   quoted: message
})
```

#### 3️⃣ Interactive (Native Flow)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🗄️ Interactive!',
   footer: '@itsliaaa/baileys',
   optionText: '👉🏻 Select Options', // --- Optional, wrap all native flow into a single list
   optionTitle: '📄 Select Options', // --- Optional
   couponText: '🏷️ Newest Coupon!', // --- Optional, add coupon into message
   couponCode: '@itsliaaa/baileys', // --- Optional
   nativeFlow: [{
      text: '👋🏻 Greeting',
      id: '#Greeting'
   }, {
      text: '📞 Call',
      call: '628123456789'
   }, {
      text: '📋 Copy',
      copy: '@itsliaaa/baileys'
   }, {
      text: '🌐 Source',
      url: 'https://www.npmjs.com/package/baileys'
   }, {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
         title: '📋 Select',
         sections: [{
            title: '✨ Section 1',
            rows: [{
               header: '',
               title: '🏷️ Coupon',
               description: '',
               id: '#CouponCode'
            }]
         }, {
            title: '✨ Section 2',
            highlight_label: '🔥 Popular',
            rows: [{
               header: '',
               title: '💭 Secret Ingredient',
               description: '',
               id: '#SecretIngredient'
            }]
         }]
      })
   }],
   interactiveAsTemplate: false, // --- Optional, wrap the interactive message into a template
}, {
   quoted: message
})
```

##### 🎠 Interactive (Carousel & Native Flow)

```javascript
sock.sendMessage(jid, {
   text: '🗂️ Interactive with Carousel!',
   footer: '@itsliaaa/baileys',
   cards: [{
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 1',
      footer: '🏷️️ Pinterest',
      nativeFlow: [{
         text: '🌐 Source',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 2',
      footer: '🏷️ Pinterest',
      couponText: '🏷️ New Coupon!',
      couponCode: '@itsliaaa/baileys',
      nativeFlow: [{
         text: '🌐 Source',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 3',
      footer: '🏷️ Pinterest',
      optionText: '👉🏻 Select Options',
      optionTitle: '📄 Select Options',
      couponText: '🏷️ New Coupon!',
      couponCode: '@itsliaaa/baileys',
      nativeFlow: [{
         text: '🛒 Product',
         id: '#Product'
      }, {
         text: '🌐 Source',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }]
}, {
   quoted: message
})
```

#### 4️⃣ Template (Hydrated Template)

```javascript
sock.sendMessage(jid, {
   title: '👋🏻 Hello',
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🫙 Template!',
   footer: '@itsliaaa/baileys',
   templateButtons: [{
      text: '👉🏻 Tap Here',
      id: '#Order'
   }, {
      text: '🌐 Source',
      url: 'https://www.npmjs.com/package/baileys'
   }, {
      text: '📞 Call',
      call: '628123456789'
   }]
}, {
   quoted: message
})
```

</details>

<details>
<summary><strong>💳 Sending Payment Messages</strong></summary>

#### 1️⃣ Invite Payment

```javascript
sock.sendMessage(jid, {
   paymentInviteServiceType: 3 // 1, 2, or 3
})
```

#### 2️⃣ Invoice

> 📝 Invoice message are not supported yet.

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   invoiceNote: '🏷️ Invoice'
})
```

#### 3️⃣ Order

```javascript
sock.sendMessage(chat, {
   orderText: '🛍️ Order',
   thumbnail: fs.readFileSync('./path/to/image.jpg') // --- Must in buffer format
}, {
   quoted: message
})
```

#### 4️⃣ Product

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   product: {
      title: '🛒 My Product'
   },
   businessOwnerJid: '0@s.whatsapp.net' // --- Must included
}, {
   quoted: message
})
```

#### 5️⃣ Request Payment

```javascript
sock.sendMessage(jid, {
   text: '💳 Request Payment',
   requestPaymentFrom: '0@s.whatsapp.net'
})
```

</details>

<details>
<summary><strong>👁️ Other Message Options</strong></summary>

#### 1️⃣ AI Label

> 📝 It only works in private chat (`@s.whatsapp.net`).

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🤖 AI Labeled!',
   ai: true
}, {
   quoted: message
})
```

#### 2️⃣ Ephemeral

> 📝 Wrap message into `ephemeralMessage`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ Ephemeral',
   ephemeral: true
})
```

#### 3️⃣ External Ad Reply

> 📝 Add an ad thumbnail to messages (may not be displayed on some WhatsApp versions).

```javascript
sock.sendMessage(jid, {
   text: '📰 External Ad Reply',
   externalAdReply: {
      title: '📝 Did you know?',
      body: '❓ I dont know',
      thumbnail: fs.readFileSync('./path/to/image.jpg'), // --- Must in buffer format
      largeThumbnail: false, // --- Or true for bigger thumbnail
      url: 'https://www.npmjs.com/package/baileys' // --- Optional, used for WhatsApp internal thumbnail caching and direct URL
   }
}, {
   quoted: message
})
```

#### 4️⃣ Group Status

> 📝 It only works in group chat (`@g.us`)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👥 Group Status!',
   groupStatus: true
})
```

#### 5️⃣ Raw

```javascript
sock.sendMessage(jid, {
   extendedTextMessage: {
      text: '📃 Built manually from scratch using the raw WhatsApp proto structure',
      contextInfo: {
         externalAdReply: {
            title: '@itsliaaa/baileys',
            thumbnail: fs.readFileSync('./path/to/image.jpg'),
            sourceApp: 'whatsapp',
            showAdAttribution: true,
            mediaType: 1
         }
      }
   },
   raw: true
}, {
   quoted: message
})
```

#### 6️⃣ View Once

> 📝 Wrap message into `viewOnceMessage`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once',
   viewOnce: true
})
```

#### 7️⃣ View Once V2

> 📝 Wrap message into `viewOnceMessageV2`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once V2',
   viewOnceV2: true
})
```

#### 8️⃣ View Once V2 Extension

> 📝 Wrap message into `viewOnceMessageV2Extension`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once V2 Extension',
   viewOnceV2Extension: true
})
```

</details>

</details>

<details>
<summary><strong>🧰 Additional Contents</strong></summary>

#### 🏷️ Find User ID (JID|PN/LID)

> 📝 The ID must contain numbers only (no +, (), or -) and must include the country code with WhatsApp ID format.

```javascript
// --- PN (Phone Number)
const phoneNumber = '6281111111111@s.whatsapp.net'

const ids = await sock.findUserId(phoneNumber)

console.log('🏷️ Got user ID', ':', ids)

// --- LID (Local Identifier)
const lid = '43411111111111@lid'

const ids = await sock.findUserId(lid)

console.log('🏷️ Got user ID', ':', ids)

// --- Output
// {
//    phoneNumber: '6281111111111@s.whatsapp.net',
//    lid: '43411111111111@lid'
// }
// --- Output when failed
// {
//    phoneNumber: '6281111111111@s.whatsapp.net',
//    lid: 'id-not-found'
// }
// --- Same output shape regardless of input type
```

#### 🖼️ Image Processing (FFmpeg)

```javascript
import { getImageProcessingLibrary } from '@itsliaaa/baileys'

const lib = await getImageProcessingLibrary()

if (lib.ffmpeg) {
   const job = await lib.ffmpeg({
      args: [
         '-i', 'path/to/media.jpg',
         '-frames:v', '1',
         '-q:v', '10'
      ],
      extension: 'jpg' // --- Used for output file extension
   })

   const buffer = await job.toBuffer() // --- Optional if you need a buffer. The output file will be deleted automatically after the buffer is created.
}
else {
   throw new Error('FFmpeg not available')
}

// --- Output
// {
//    outputFilename: 'output/path.jpg',
//    toBuffer: [AsyncFunction: toBuffer]
// }
```

#### 🔑 Request Custom Pairing Code

> 📝 The phone number must contain numbers only (no +, (), or -) and must include the country code.

```javascript
const phoneNumber = '6281111111111'
const customPairingCode = 'STARFALL'

await sock.requestPairingCode(phoneNumber, customPairingCode)

console.log('🔗 Pairing code', ':', customPairingCode)
```

<details>
<summary><strong>📣 Newsletter Management</strong></summary>

```javascript
// --- Create a new one
sock.newsletterCreate('@itsliaaa/baileys')

// --- Get info
sock.newsletterMetadata('1231111111111@newsletter')

// --- Demote admin
sock.newsletterDemote('1231111111111@newsletter', '6281111111111@s.whatsapp.net')

// --- Change owner
sock.newsletterChangeOwner('1231111111111@newsletter', '6281111111111@s.whatsapp.net')

// --- Change name
sock.newsletterUpdateName('1231111111111@newsletter', '📦 @itsliaaa/baileys')

// --- Change description
sock.newsletterUpdateDescription('1231111111111@newsletter', '📣 Fresh updates weekly')

// --- Change photo
sock.newsletterUpdatePicture('1231111111111@newsletter', {
   url: 'path/to/image.jpg'
})

// --- Remove photo
sock.newsletterRemovePicture('1231111111111@newsletter')

// --- React to a message
sock.newsletterReactMessage('1231111111111@newsletter', '100', '💛')

// --- Get all subscribed newsletters
const newsletters = await sock.newsletterSubscribed()

console.dir(newsletters, { depth: null })
```

</details>

<details>
<summary><strong>👥 Group Management</strong></summary>

```javascript
// --- Create a new one and add participants using their JIDs
sock.groupCreate('@itsliaaa/baileys', ['628123456789@s.whatsapp.net'])

// --- Get info
sock.groupMetadata(jid)

// --- Get invite code
sock.groupInviteCode(jid)

// --- Revoke invite link
sock.groupRevokeInvite(jid)

// --- Leave group
sock.groupLeave(jid)

// --- Add participants
sock.groupParticipantsUpdate(jid, ['628123456789@s.whatsapp.net'], 'add')

// --- Remove participants
sock.groupParticipantsUpdate(jid, ['628123456789@s.whatsapp.net'], 'remove')

// --- Promote to admin
sock.groupParticipantsUpdate(jid, ['628123456789@s.whatsapp.net'], 'promote')

// --- Demote from admin
sock.groupParticipantsUpdate(jid, ['628123456789@s.whatsapp.net'], 'demote')

// --- Change name
sock.groupUpdateSubject(jid, '📦 @itsliaaa/baileys')

// --- Change description
sock.groupUpdateDescription(jid, 'Updated description')

// --- Change photo
sock.updateProfilePicture(jid, {
   url: 'path/to/image.jpg'
})

// --- Remove photo
sock.removeProfilePicture(jid)

// --- Set group as admin only for chatting
sock.groupSettingUpdate(jid, 'announcement')

// --- Set group as open to all for chatting
sock.groupSettingUpdate(jid, 'not_announcement')

// --- Set admin only can edit group info
sock.groupSettingUpdate(jid, 'locked')

// --- Set all participants can edit group info
sock.groupSettingUpdate(jid, 'unlocked')

// --- Set admin only can add participants
sock.groupMemberAddMode(jid, 'admin_add')

// --- Set all participants can add participants
sock.groupMemberAddMode(jid, 'all_member_add')

// --- Enable or disable temporary messages with seconds format
sock.groupToggleEphemeral(jid, 86400)

// --- Disable temporary messages
sock.groupToggleEphemeral(jid, 0)

// --- Enable or disable membership approval mode
sock.groupJoinApprovalMode(jid, 'on')
sock.groupJoinApprovalMode(jid, 'off')

// --- Get all groups metadata
const groups = await sock.groupFetchAllParticipating()

console.dir(groups, { depth: null })

// --- Get pending invites
const invites = await sock.groupGetInviteInfo(code)

console.dir(invites, { depth: null })

// --- Accept group invite
sock.groupAcceptInvite(code)

// --- Get group info from link
const group = await sock.groupGetInviteInfo('https://chat.whatsapp.com/ABC123')

console.log('👥 Got group info from link', ':', group)
```

</details>

</details>

## 📦 **Fork Base**
> [!NOTE]
This fork is based on [Baileys (GitHub)](https://github.com/WhiskeySockets/Baileys)

## 📣 **Credits**
> [!IMPORTANT]
This fork uses Protocol Buffer definitions maintained by [WPP Connect](https://github.com/wppconnect-team) via [wa-proto](https://github.com/wppconnect-team/wa-proto)
> 
> All rights belong to the original Baileys maintainers and contributors:
> - [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
> - [purpshell](https://github.com/purpshell)
> - [jlucaso1](https://github.com/jlucaso1)
> - [adiwajshing](https://github.com/adiwajshing)
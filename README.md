# 🌱 @itsliaaa/baileys

[![Logo](https://files.catbox.moe/c5s9g0.jpg)](https://www.npmjs.com/package/@itsliaaa/baileys)

<p align="center">
   Enhanced Baileys v7 with fixed newsletter media upload, plus support for interactive messages, albums, and more message types.
   <br><br>
   <a href="https://www.npmjs.com/package/@itsliaaa/baileys">
      <img src="https://img.shields.io/npm/v/@itsliaaa/baileys?style=for-the-badge&logo=npm"/>
   </a>
   <a href="https://www.npmjs.com/package/@itsliaaa/baileys">
      <img src="https://img.shields.io/npm/dm/@itsliaaa/baileys?style=for-the-badge&logo=npm"/>
   </a>
   <a href="https://github.com/itsliaaa/baileys">
      <img src="https://img.shields.io/github/stars/itsliaaa/baileys?style=for-the-badge&logo=github"/>
   </a>
   <a href="LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge"/>
   </a>
   <a href="https://nodejs.org">
      <img src="https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&labelColor=green&logoColor=white&style=for-the-badge"/>
   </a>
   <a href="#">
      <img src="https://img.shields.io/badge/ESM-only?logo=javascript&labelColor=yellow&logoColor=black&style=for-the-badge"/>
   </a>
</p>

☕ For donation: [Saweria](https://saweria.co/itsliaaa)

### ✨ Highlights

This fork designed for production use with a focus on clarity and safety:

- 🚫 No obfuscation. Easy to read and audit.
- 🚫 No auto-follow channel (newsletter) behavior.

> [!NOTE]
> 📄 This project is maintained with limited scope and is not intended to replace upstream Baileys.
>
> 😞 And, really sorry for my bad english.

### 🛠️ Internal Adjustments
- 🖼️ Fixed an issue where media could not be sent to newsletters due to an upstream issue.
- 📁 Reintroduced [`makeInMemoryStore`](#%EF%B8%8F-implementing-a-data-store) with a minimal ESM adaptation and small adjustments for Baileys v7.
- 📦 Switched FFmpeg execution from `exec` to `spawn` for safer process handling.
- 🗃️ Added [`@napi-rs/image`](https://www.npmjs.com/package/@napi-rs/image) as a supported image processing backend in [`getImageProcessingLibrary()`](#%EF%B8%8F-image-processing), offering a balance between performance and compatibility.

### 📨 Messages Handling & Compatibility
- 📩 Expanded messages support for:
   - 🖼️ [Album Message](#%EF%B8%8F-album-image--video)
   - 👤 [Group Status Message](#4%EF%B8%8F⃣-group-status)
   - 👉🏻 [Interactive Message](#-sending-interactive-messages) (buttons, lists, native flows, templates, carousels).
   - 🎞️ [Status Mention Message](#%EF%B8%8F-status-mention)
   - 📦 [Sticker Pack Message](#-sticker-pack)
   - ✨ [Rich Response Message](#-rich-response) **[NEW]**
   - 🧾 [Message with Code Blocks](#-message-with-code-block) **[NEW]**
   - 📋 [Message with Table](#-message-with-table) **[NEW]**
   - 💳 [Payment-related Message](#-sending-payment-messages) (payment requests, invites, orders, invoices).
- 📰 Simplified sending messages with ad thumbnail using [`externalAdReply`](#3%EF%B8%8F⃣-external-ad-reply), without requiring manual `contextInfo`.
- 💭 Added support for quoting messages inside channel (newsletter). **[NEW]**
- 🎀 Added support for [custom button icon](#3%EF%B8%8F⃣-interactive). **[NEW]**

### 🧩 Additional Message Options
- 👁️ Added optional boolean flags for message handling:  
   - 🤖 [`ai`](#1%EF%B8%8F⃣-ai-icon) - AI icon on message
   - 📣 [`mentionAll`](#-mention) - Mention all group participants without requiring their JIDs in `mentions` or `mentionedJid` **[NEW]**
   - 🔧 [`ephemeral`](#2%EF%B8%8F⃣-ephemeral), [`groupStatus`](#4%EF%B8%8F⃣-group-status), [`viewOnceV2`](#8%EF%B8%8F⃣-view-once-v2), [`viewOnceV2Extension`](#9%EF%B8%8F⃣-view-once-v2-extension), [`interactiveAsTemplate`](#3%EF%B8%8F⃣-interactive) - Message wrappers
   - 🔒 [`secureMetaServiceLabel`](#6%EF%B8%8F⃣-secure-meta-service-label) - Secure meta service label on message **[NEW]**
   - 📄 [`raw`](#5%EF%B8%8F⃣-raw) - Build your message manually **(DO NOT USE FOR EXPLOITATION)**

### 📋 Index
- [📥 Installation](#-installation)
   - [🧩 Import (ESM & CJS)](#-import-esm--cjs)
- [🌐 Connect to WhatsApp (Quick Step)](#-connect-to-whatsapp-quick-step)
- [🗄️ Implementing Data Store](#%EF%B8%8F-implementing-data-store)
- [🪪 WhatsApp IDs Explain](#-whatsapp-ids-explain)
- [✉️ Sending Messages](#%EF%B8%8F-sending-messages)
   - [🔠 Text](#-text)
   - [🔔 Mention](#-mention)
   - [😁 Reaction](#-reaction)
   - [📌 Pin Message](#-pin-message)
   - [➡️ Forward Message](#%EF%B8%8F-forward-message)
   - [👤 Contact](#-contact)
   - [📍 Location](#-location)
   - [🗓️ Event](#%EF%B8%8F-event)
   - [👥 Group Invite](#-group-invite)
   - [🛍️ Product](#%EF%B8%8F-product)
   - [📊 Poll](#-poll)
   - [💭 Button Response](#-button-response)
   - [✨ Rich Response](#-rich-response)
   - [🧾 Message with Code Block](#-message-with-code-block)
   - [🌏 Message with Inline Entities](#-message-with-inline-entities)
   - [📋 Message with Table](#-message-with-table)
   - [🎞️ Status Mention](#%EF%B8%8F-status-mention)
- [📁 Sending Media Messages](#-sending-media-messages)
   - [🖼️ Image](#%EF%B8%8F-image)
   - [🎥 Video](#-video)
   - [📃 Sticker](#-sticker)
   - [💽 Audio](#-audio)
   - [🗂️ Document](#%EF%B8%8F-document)
   - [🖼️ Album (Image & Video)](#%EF%B8%8F-album-image--video)
   - [📦 Sticker Pack](#-sticker-pack)
- [👉🏻 Sending Interactive Messages](#-sending-interactive-messages)
   - [1️⃣ Buttons](#1%EF%B8%8F⃣-buttons)
   - [2️⃣ List](#2%EF%B8%8F⃣-list)
   - [3️⃣ Interactive](#3%EF%B8%8F⃣-interactive)
   - [4️⃣ Hydrated Template](#4%EF%B8%8F⃣-hydrated-template)
- [💳 Sending Payment Messages](#-sending-payment-messages)
   - [1️⃣ Invite Payment](#1%EF%B8%8F⃣-invite-payment)
   - [2️⃣ Invoice](#2%EF%B8%8F⃣-invoice)
   - [3️⃣ Order](#3%EF%B8%8F⃣-order)
   - [4️⃣ Request Payment](#4%EF%B8%8F⃣-request-payment)
- [👁️ Other Message Options](#%EF%B8%8F-other-message-options)
   - [1️⃣ AI Icon](#1%EF%B8%8F⃣-ai-icon)
   - [2️⃣ Ephemeral](#2%EF%B8%8F⃣-ephemeral)
   - [3️⃣ External Ad Reply](#3%EF%B8%8F⃣-external-ad-reply)
   - [4️⃣ Group Status](#4%EF%B8%8F⃣-group-status)
   - [5️⃣ Raw](#5%EF%B8%8F⃣-raw)
   - [6️⃣ Secure Meta Service Label](#6%EF%B8%8F⃣-secure-meta-service-label)
   - [7️⃣ View Once](#7%EF%B8%8F⃣-view-once)
   - [8️⃣ View Once V2](#8%EF%B8%8F⃣-view-once-v2)
   - [9️⃣ View Once V2 Extension](#9%EF%B8%8F⃣-view-once-v2-extension)
- [♻️ Modify Messages](#%EF%B8%8F-modify-messages)
   - [🗑️ Delete Messages](#%EF%B8%8F-delete-messages)
   - [✏️ Edit Messages](#%EF%B8%8F-edit-messages)
- [🧰 Additional Contents](#-additional-contents)
   - [🏷️ Find User ID (JID|PN/LID)](#%EF%B8%8F-find-user-id-jidpnlid)
   - [🔑 Request Custom Pairing Code](#-request-custom-pairing-code)
   - [🖼️ Image Processing](#%EF%B8%8F-image-processing)
   - [📣 Newsletter Management](#-newsletter-management)
   - [👥 Group Management](#-group-management)
   - [👤 Profile Management](#-profile-management)
   - [🔐 Privacy Management](#-privacy-management)
   - [📡 Events](#-events)
- [🚀 Try It](#-try-it)
- [📦 Fork Base](#-fork-base)
- [📣 Credits](#-credits)

### 📥 Installation

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

#### 🧩 Import (ESM & CJS)

```javascript
// --- ESM
import { makeWASocket } from '@itsliaaa/baileys'

// --- CJS (tested and working on Node.js 24 ✅)
const { makeWASocket } = require('@itsliaaa/baileys')
```

### 🌐 Connect to WhatsApp (Quick Step)

```javascript
import { makeWASocket, delay, DisconnectReason, useMultiFileAuthState } from '@itsliaaa/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

// --- Connect with pairing code
const myPhoneNumber = '6288888888888'

const logger = pino({ level: 'silent' })

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
    
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

> [!NOTE]
> You can use the experimental `useSingleFileAuthState` as an alternative to `useMultiFileAuthState`. However, `useSingleFileAuthState` already includes an internal caching mechanism, so there is no need to wrap `creds.key` with `makeCacheableSignalKeyStore`.

### 🗄️ Implementing Data Store

> [!CAUTION]
> I highly recommend building your own data store, as keeping an entire chat history in memory can lead to excessive RAM usage.

```javascript
import { makeWASocket, makeInMemoryStore, delay, DisconnectReason, useMultiFileAuthState } from '@itsliaaa/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

const myPhoneNumber = '6288888888888'

// --- Create your store path
const storePath = './store.json'

const logger = pino({ level: 'silent' })

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
    
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

### 🪪 WhatsApp IDs Explain

`id` is the WhatsApp ID, called `jid` and `lid` too, of the person or group you're sending the message to.
- It must be in the format `[country code][phone number]@s.whatsapp.net`
   - Example for people: `19999999999@s.whatsapp.net` and `12699999999@lid`.
   - For groups, it must be in the format `123456789-123345@g.us`.
- For Meta AI, it's `11111111111@bot`.
- For broadcast lists, it's `[timestamp of creation]@broadcast`.
- For stories, the ID is `status@broadcast`.

### ✉️ Sending Messages

> [!NOTE]
> You can get the `jid` from `message.key.remoteJid` in the first example.

#### 🔠 Text

```javascript
// --- Regular text message
sock.sendMessage(jid, {
   text: '👋🏻 Hello'
}, {
   quoted: message
})

// --- Text message with link preview
const url = 'https://www.npmjs.com/package/@itsliaaa/baileys'

sock.sendMessage(jid, {
   text: '👉🏻 Check it out! ' + url,
   linkPreview: {
      'matched-text': url,
      title: '🌱 @itsliaaa/baileys',
      description: 'Underrated Baileys Fork',
      previewType: 0, // --- Or 1 for video playback
      jpegThumbnail: fs.readFileSync('./path/to/image.jpg')
   }
})
```

#### 🔔 Mention

```javascript
// --- Regular mention
sock.sendMessage(jid, {
   text: '👋🏻 Hello @628123456789',
   mentions: ['628123456789@s.whatsapp.net']
}, {
   quoted: message
})

// --- Mention all
sock.sendMessage(jid, {
   text: '👋🏻 Hello @all',
   mentionAll: true
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

#### ➡️ Forward Message

```javascript
sock.sendMessage(jid, {
   forward: message,
   force: true // --- Optional
})
```

#### 👤 Contact

```javascript
const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + 'FN:Lia Wynn\n'
            + 'ORG:Waitress;\n'
            + 'TEL;type=CELL;type=VOICE;waid=628123456789:+62 8123 4567 89\n'
            + 'END:VCARD'

sock.sendMessage(jid, {
   contacts: {
      displayName: 'Lia Wynn',
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

#### 🗓️ Event

```javascript
sock.sendMessage(jid, {
   event: {
      name: '🎶 Meet & Mingle Party',
      description: 'Meet & Mingle Party is a fun, casual gathering to connect, chat, and build new relationships within the community.',
      call: 'audio', // --- Or "video", this field is optional
      startDate: new Date(Date.now() + 3600000),
      endDate: new Date(Date.now() + 28800000),
      isCancelled: false, // --- Optional
      isScheduleCall: false, // --- Optional
      extraGuestsAllowed: false, // --- Optional
      location: {
         name: 'Jakarta',
         degreesLatitude: -6.2,
         degreesLongitude: 106.8
      }
   }
}, {
   quoted: message
})
```

#### 👥 Group Invite

```javascript
const inviteCode = groupUrl
   .split('chat.whatsapp.com/')[1]
   ?.split('?')[0]

const groupJid = '1201111111111@g.us'
const groupName = '@itsliaaa/baileys'

sock.sendMessage(jid, {
   groupInvite: {
      inviteCode,
      inviteExpiration: Date.now() + 86400000,
      text: '👋🏻 Hello, we invite you to join our group.',
      jid: groupJid,
      subject: groupName,
   }
}, {
   quoted: message
})
```

#### 🛍️ Product

```javascript
import { randomUUID } from 'crypto'

sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   body: '👋🏻 Check my product here!',
   footer: '@itsliaaa/baileys',
   product: {
      currencyCode: 'IDR',
      description: '🛍️ Interesting product!',
      priceAmount1000: 70_000_000,
      productId: randomUUID(),
      productImageCount: 1,
      salePriceAmount1000: 65_000_000,
      signedUrl: 'https://www.npmjs.com/package/@itsliaaa/baileys',
      title: '📦 Starseed (Premium)',
      url: 'https://www.npmjs.com/package/@itsliaaa/baileys'
   },
   businessOwnerJid: '0@s.whatsapp.net'
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

// --- Poll result
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

// --- Poll update
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

#### 💭 Button Response

```javascript
// --- Using buttonsResponseMessage
sock.sendMessage(jid, {
   type: 'plain',
   buttonReply: {
      id: '#Menu',
      displayText: '✨ Interesting Menu'
   }
}, {
   quoted: message
})

// --- Using interactiveResponseMessage
sock.sendMessage(jid, {
   flowReply: {
      format: 0,
      text: '💭 Response',
      name: 'menu_options',
      paramsJson: JSON.stringify({
         id: '#Menu',
         description: '✨ Interesting Menu'
      })
   }
}, {
   quoted: message
})

// --- Using listResponseMessage
sock.sendMessage(jid, {
   listReply: {
      title: '📄 See More',
      description: '✨ Interesting Menu',
      id: '#Menu'
   }
}, {
   quoted: message
})

// --- Using templateButtonReplyMessage
sock.sendMessage(jid, {
   type: 'template',
   buttonReply: {
      id: '#Menu',
      displayText: '✨ Interesting Menu',
      index: 1
   }
}, {
   quoted: message
})
```

#### ✨ Rich Response

> [!NOTE]
> `richResponse[]` is a representation of [`submessages[]`](https://baileys.wiki/docs/api/namespaces/proto/interfaces/IAIRichResponseSubMessage) inside `richResponseMessage`.

> [!TIP]
> You can still use the original [`submessages[]`](https://baileys.wiki/docs/api/namespaces/proto/interfaces/IAIRichResponseSubMessage) field directly.
> The code example below is just an implementation using a helper, not a required structure.

```javascript
sock.sendMessage(jid, {
   richResponse: [{
      text: 'Example Usage',
   }, {
      language: 'javascript',
      code: [{
         highlightType: 0,
         codeContent: 'console.log("Hello, World!")'
      }]
   }, {
      text: 'Pretty simple, right?\n'
   }, {
      text: 'Comparison between Node.js, Bun, and Deno',
   }, {
      title: 'Runtime Comparison',
      table: [{
         isHeading: true,
         items: ['', 'Node.js', 'Bun', 'Deno']
      }, {
         isHeading: false,
         items: ['Engine', 'V8 (C++)', 'JavaScriptCore (C++)', 'V8 (C++)']
      }, {
         isHeading: false,
         items: ['Performance', '4/5', '5/5', '4/5']
      }]
   }, {
      text: 'Does this help clarify the differences?'
   }]
})
```

> [!TIP]
> You can easily add syntax highlighting by importing `tokenizeCode` directly from Baileys.

```javascript
import { tokenizeCode } from '@itsliaaa/baileys'

const language = 'javascript'
const code = 'console.log("Hello, World!")'

sock.sendMessage(jid, {
   richResponse: [{
      text: 'Example Usage',
   }, {
      language,
      code: tokenizeCode(code, language)
   }, {
      text: 'Pretty simple, right?'
   }]
})
```

#### 🧾 Message with Code Block

> [!NOTE]
> This feature already includes a built-in tokenizer.

```javascript
sock.sendMessage(jid, {
   headerText: '## Example Usage',
   contentText: '---',
   code: 'console.log("Hello, World!")',
   language: 'javascript',
   footerText: 'Pretty simple, right?'
})
```

#### 🌏 Message with Inline Entities

```javascript
sock.sendMessage(jid, {
   headerText: '## Check Out!',
   contentText: '---',
   links: [{
      text: '1. Google',
      title: 'Popular Search Engine',
      url: 'https://www.google.com/'
   }, {
      text: '2. YouTube',
      title: 'Popular Streaming Platform',
      url: 'https://www.youtube.com/'
   }, {
      text: '3. Modded Baileys',
      title: 'Underrated Baileys Fork',
      url: 'https://www.npmjs.com/package/@itsliaaa/baileys'
   }],
   footerText: '---'
})
```

#### 📋 Message with Table

```javascript
sock.sendMessage(jid, {
   headerText: '## Comparison between Node.js, Bun, and Deno',
   contentText: '---',
   title: 'Runtime Comparison',
   table: [
      ['', 'Node.js', 'Bun', 'Deno'],
      ['Engine', 'V8 (C++)', 'JavaScriptCore (C++)', 'V8 (C++)'],
      ['Performance', '4/5', '5/5', '4/5']
   ],
   noHeading: false, // --- Optional
   footerText: 'Does this help clarify the differences?'
})
```

#### 🎞️ Status Mention

```javascript
sock.sendMessage([jidA, jidB, jidC], {
   text: 'Hello! 👋🏻'
})
```

### 📁 Sending Media Messages

> [!NOTE]
> For media messages, you can pass a `Buffer` directly, or an object with either `{ stream: Readable }` or `{ url: string }` (local file path or HTTP/HTTPS URL).

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

#### 🗂️ Document

```javascript
sock.sendMessage(jid, {
   document: {
      url: './path/to/document.pdf'
   },
   mimetype: 'application/pdf',
   caption: '✨ My work!'
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

> [!IMPORTANT]
> If `sharp` or `@napi-rs/image` is not installed, the `cover` and `stickers` must already be in WebP format.

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
   publisher: '🌟 Lia Wynn',
   description: '@itsliaaa/baileys'
}, {
   quoted: message
})
```

### 👉🏻 Sending Interactive Messages

#### 1️⃣ Buttons

```javascript
// --- Regular buttons message
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

// --- Buttons with Media & Native Flow
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
      text: '📋 Select',
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
   }]
}, {
   quoted: message
})
```

#### 2️⃣ List

> [!NOTE]
> It only works in private chat (`@s.whatsapp.net`).

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

#### 3️⃣ Interactive

```javascript
// --- Native Flow
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🗄️️ Interactive!',
   footer: '@itsliaaa/baileys',
   optionText: '👉🏻 Select Options', // --- Optional, wrap all native flow into a single list
   optionTitle: '📄 Select Options', // --- Optional
   offerText: '🏷️ Newest Coupon!', // --- Optional, add an offer into message
   offerCode: '@itsliaaa/baileys', // --- Optional
   offerUrl: 'https://www.npmjs.com/package/@itsliaaa/baileys', // --- Optional
   offerExpiration: Date.now() + 3_600_000, // --- Optional
   nativeFlow: [{
      text: '👋🏻 Greeting',
      id: '#Greeting',
      icon: 'review' // --- Optional
   }, {
      text: '📞 Call',
      call: '628123456789'
   }, {
      text: '📋 Copy',
      copy: '@itsliaaa/baileys'
   }, {
      text: '🌐 Source',
      url: 'https://www.npmjs.com/package/@itsliaaa/baileys',
      useWebview: true // --- Optional
   }, {
      text: '📋 Select',
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
      }],
      icon: 'default' // --- Optional
   }],
   interactiveAsTemplate: false, // --- Optional, wrap the interactive message into a template
}, {
   quoted: message
})

// --- Carousel & Native Flow
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
         url: 'https://www.npmjs.com/package/@itsliaaa/baileys',
         useWebview: true
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 2',
      footer: '🏷️ Pinterest',
      offerText: '🏷️ New Coupon!',
      offerCode: '@itsliaaa/baileys',
      offerUrl: 'https://www.npmjs.com/package/@itsliaaa/baileys',
      offerExpiration: Date.now() + 3_600_000,
      nativeFlow: [{
         text: '🌐 Source',
         url: 'https://www.npmjs.com/package/@itsliaaa/baileys'
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 3',
      footer: '🏷️ Pinterest',
      optionText: '👉🏻 Select Options',
      optionTitle: '👉🏻 Select Options',
      offerText: '🏷️ New Coupon!',
      offerCode: '@itsliaaa/baileys',
      offerUrl: 'https://www.npmjs.com/package/@itsliaaa/baileys',
      offerExpiration: Date.now() + 3_600_000,
      nativeFlow: [{
         text: '🛒 Product',
         id: '#Product',
         icon: 'default'
      }, {
         text: '🌐 Source',
         url: 'https://www.npmjs.com/package/@itsliaaa/baileys'
      }]
   }]
}, {
   quoted: message
})
```

#### 4️⃣ Hydrated Template

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
      url: 'https://www.npmjs.com/package/@itsliaaa/baileys'
   }, {
      text: '📞 Call',
      call: '628123456789'
   }]
}, {
   quoted: message
})
```

### 💳 Sending Payment Messages

#### 1️⃣ Invite Payment

```javascript
sock.sendMessage(jid, {
   paymentInviteServiceType: 3 // 1, 2, or 3
})
```

#### 2️⃣ Invoice

> [!NOTE]
> Invoice message are not supported yet.

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

#### 4️⃣ Request Payment

```javascript
sock.sendMessage(jid, {
   text: '💳 Request Payment',
   requestPaymentFrom: '0@s.whatsapp.net'
})
```

### 👁️ Other Message Options

#### 1️⃣ AI Icon

> [!NOTE]
> It only works in private chat (`@s.whatsapp.net`).

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🤖 With AI icon!',
   ai: true
}, {
   quoted: message
})
```

#### 2️⃣ Ephemeral

> [!NOTE]
> Wrap message into `ephemeralMessage`

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

> [!NOTE]
> Add an ad thumbnail to messages (may not be displayed on some WhatsApp versions).

```javascript
sock.sendMessage(jid, {
   text: '📰 External Ad Reply',
   externalAdReply: {
      title: '📝 Did you know?',
      body: '❓ I dont know',
      thumbnail: fs.readFileSync('./path/to/image.jpg'), // --- Must in buffer format
      largeThumbnail: false, // --- Or true for bigger thumbnail
      url: 'https://www.npmjs.com/package/@itsliaaa/baileys' // --- Optional, used for WhatsApp internal thumbnail caching and direct URL
   }
}, {
   quoted: message
})
```

#### 4️⃣ Group Status

> [!NOTE]
> It only works in group chat (`@g.us`)

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

#### 6️⃣ Secure Meta Service Label

```javascript
sock.sendMessage(jid, {
   text: '🏷️ Just a label!',
   secureMetaServiceLabel: true
})
```

#### 7️⃣ View Once

> [!NOTE]
> Wrap message into `viewOnceMessage`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once',
   viewOnce: true
})
```

#### 8️⃣ View Once V2

> [!NOTE]
> Wrap message into `viewOnceMessageV2`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once V2',
   viewOnceV2: true
})
```

#### 9️⃣ View Once V2 Extension

> [!NOTE]
> Wrap message into `viewOnceMessageV2Extension`

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👁️ View Once V2 Extension',
   viewOnceV2Extension: true
})
```

### ♻️ Modify Messages

#### 🗑️ Delete Messages

```javascript
sock.sendMessage(jid, {
   delete: message.key
})
```

#### ✏️ Edit Messages

```javascript
// --- Edit plain text
sock.sendMessage(jid, {
   text: '✨ I mean, nice!',
   edit: message.key
})

// --- Edit media messages caption
sock.sendMessage(jid, {
   caption: '✨ I mean, here is the image!',
   edit: message.key
})
```

### 🧰 Additional Contents

#### 🏷️ Find User ID (JID|PN/LID)

> [!NOTE]
> The ID must contain numbers only (no +, (), or -) and must include the country code with WhatsApp ID format.

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

#### 🔑 Request Custom Pairing Code

> [!NOTE]
> The phone number must contain numbers only (no +, (), or -) and must include the country code.

```javascript
const phoneNumber = '6281111111111'
const customPairingCode = 'STARFALL'

await sock.requestPairingCode(phoneNumber, customPairingCode)

console.log('🔗 Pairing code', ':', customPairingCode)
```

#### 🖼️ Image Processing

> [!NOTE]
> Automatically use available image processing library: `sharp`, `@napi-rs/image`, or `jimp`

```javascript
import { getImageProcessingLibrary } from '@itsliaaa/baileys'
import { readFile } from 'fs/promises'

const lib = await getImageProcessingLibrary()

const bufferOrFilePath = './path/to/image.jpg'
const width = 512

let output

// --- If sharp installed
if (lib.sharp?.default) {
   const img = lib.sharp.default(bufferOrFilePath)

   output = await img.resize(width)
      .jpeg({ quality: 80 })
      .toBuffer()
}

// --- If @napi-rs/image installed
else if (lib.image?.Transformer) {
   // --- Must in buffer format
   const inputBuffer = Buffer.isBuffer(bufferOrFilePath)
      ? bufferOrFilePath
      : await readFile(bufferOrFilePath)

   const img = new lib.image.Transformer(inputBuffer)

   output = await img.resize(width, undefined, 0)
      .jpeg(50)
}

// --- If jimp installed
else if (lib.jimp?.Jimp) {
   const img = await lib.jimp.Jimp.read(bufferOrFilePath)

   output = await img
      .resize({ w: width, mode: lib.jimp.ResizeStrategy.BILINEAR })
      .getBuffer('image/jpeg', { quality: 50 })
}

// --- Fallback
else {
   throw new Error('No image processing available')
}

console.log('✅ Process completed!')
console.dir(output, { depth: null })
```

#### 📣 Newsletter Management

```javascript
// --- Create a new one
sock.newsletterCreate('@itsliaaa/baileys', '📣 Fresh updates weekly')

// --- Get info
const metadata = sock.newsletterMetadata('1231111111111@newsletter')
console.dir(metadata, { depth: null })

// --- Get subscribers count
const subscribers = await sock.newsletterSubscribers('1231111111111@newsletter')
console.dir(subscribers, { depth: null })

// --- Follow and Unfollow
sock.newsletterFollow('1231111111111@newsletter')
sock.newsletterUnfollow('1231111111111@newsletter')

// --- Mute and Unmute
sock.newsletterMute('1231111111111@newsletter')
sock.newsletterUnmute('1231111111111@newsletter')

// --- Demote admin
sock.newsletterDemote('1231111111111@newsletter', '6281111111111@s.whatsapp.net')

// --- Change owner
sock.newsletterChangeOwner('1231111111111@newsletter', '6281111111111@s.whatsapp.net')

// --- Update newsletter
sock.newsletterUpdate('1231111111111@newsletter', { name: '@itsliaaa/baileys' })

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

// --- Get admin count
const count = await sock.newsletterAdminCount('1231111111111@newsletter')

// --- Get all subscribed newsletters
const newsletters = await sock.newsletterSubscribed()
console.dir(newsletters, { depth: null })

// --- Fetch newsletter messages
const messages = sock.newsletterFetchMessages('jid', '1231111111111@newsletter', 50, 0, 0)
console.dir(messages, { depth: null })

// --- Delete newsletter
sock.newsletterDelete('1231111111111@newsletter')
```

#### 👥 Group Management

```javascript
// --- Create a new one and add participants using their JIDs
const group = sock.groupCreate('@itsliaaa/baileys', ['628123456789@s.whatsapp.net'])
console.dir(group, { depth: null })

// --- Get info
const metadata = await sock.groupMetadata(jid)
console.dir(metadata, { depth: null })

// --- Get group invite code
sock.groupInviteCode(jid)

// --- Revoke invite link
sock.groupRevokeInvite(jid)

// --- Accept group invite
sock.groupAcceptInvite(inviteCode)

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

// --- Accept join requests
sock.groupRequestParticipantsUpdate(jid, ['628123456789@s.whatsapp.net'], 'approve')

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

// --- Get pending join requests
const requests = await sock.groupRequestParticipantsList(jid)
console.dir(requests, { depth: null })

// --- Get group info from link
const group = await sock.groupGetInviteInfo('https://chat.whatsapp.com/ABC123')
console.log('👥 Got group info from link', ':', group)

// --- Update bot member label
sock.updateMemberLabel(jid, '@itsliaaa/baileys')
```

#### 👤 Profile Management

```javascript
// --- Get user profile picture
const url = await sock.profilePictureUrl(jid, 'image')
console.log('🖼️ Got user profile url', url)

// --- Update profile picture
sock.updateProfilePicture(jid, buffer)
sock.updateProfilePicture(jid, { url })

// --- Remove profile picture
sock.removeProfilePicture(jid)

// --- Update profile name
sock.updateProfileName('My Name')

// --- Update profile status
sock.updateProfileStatus('Available')

// --- Presence
sock.sendPresenceUpdate('available', jid)
sock.presenceSubscribe(jid)

// --- Read receipts
sock.readMessages([message.key])
sock.sendReceipt(jid, participant, [messageId], 'read')

// --- Block user
sock.updateBlockStatus(jid, 'block')

// --- Unblock user
sock.updateBlockStatus(jid, 'unblock')

// --- Fetch blocklist
const blocked = await sock.fetchBlocklist()
console.dir(blocked, { depth: null })

// --- Modify chats
sock.chatModify({
   archive: true,
   lastMessageOrig: message,
   lastMessage: message
}, jid)

// --- Star messages
sock.star(jid, [{ id: messageId, fromMe: true }], true)

// --- Contact
sock.addOrEditContact(jid, { displayName: 'Starseed' })
sock.removeContact(jid)

// --- Label
sock.addChatLabel(jid, labelId)
sock.removeChatLabel(jid, labelId)
sock.addMessageLabel(jid, messageId, labelId)

// --- App state sync
sock.resyncAppState(['regular', 'critical_block'], true)

// --- Get business profile
const profile = await sock.getBusinessProfile(jid)
console.dir(profile, { depth: null })
```

#### 🔐 Privacy Management

```javascript
// --- Update last seen privacy
sock.updateLastSeenPrivacy('all')
sock.updateLastSeenPrivacy('contacts')
sock.updateLastSeenPrivacy('contact_blacklist')
sock.updateLastSeenPrivacy('nobody')

// --- Update online privacy
sock.updateOnlinePrivacy('all')
sock.updateOnlinePrivacy('match_last_seen')

// --- Update profile picture privacy
sock.updateProfilePicturePrivacy('contacts')

// --- Update status privacy
sock.updateStatusPrivacy('contacts')

// --- Update read receipts privacy
sock.updateReadReceiptsPrivacy('all')
sock.updateReadReceiptsPrivacy('none')

// --- Update groups add privacy
sock.updateGroupsAddPrivacy('all')
sock.updateGroupsAddPrivacy('contacts')

// --- Update messages privacy
sock.updateMessagesPrivacy('all')
sock.updateMessagesPrivacy('contacts')
sock.updateMessagesPrivacy('nobody')

// --- Update call privacy
sock.updateCallPrivacy('everyone')

// --- Update default disappearing mode
sock.updateDefaultDisappearingMode(86400)

// --- Update link previews privacy
sock.updateDisableLinkPreviewsPrivacy(true)
```

#### 📡 Events

```javascript
sock.ev.on('connection.update', (update) => {})
sock.ev.on('creds.update', (update) => {})
sock.ev.on('messaging-history.set', (update) => {})
sock.ev.on('messaging-history.status', (update) => {})
sock.ev.on('chats.upsert', (update) => {})
sock.ev.on('chats.update', (update) => {})
sock.ev.on('chats.delete', (update) => {})
sock.ev.on('chats.lock', (update) => {})
sock.ev.on('lid-mapping.update', (update) => {})
sock.ev.on('presence.update', (update) => {})
sock.ev.on('contacts.upsert', (update) => {})
sock.ev.on('contacts.update', (update) => {})
sock.ev.on('messages.delete', (update) => {})
sock.ev.on('messages.update', (update) => {})
sock.ev.on('messages.media-update', (update) => {})
sock.ev.on('messages.upsert', (update) => {})
sock.ev.on('messages.reaction', (update) => {})
sock.ev.on('message-receipt.update', (update) => {})
sock.ev.on('groups.upsert', (update) => {})
sock.ev.on('groups.update', (update) => {})
sock.ev.on('group-participants.update', (update) => {})
sock.ev.on('group.join-request', (update) => {})
sock.ev.on('group.member-tag.update', (update) => {})
sock.ev.on('blocklist.set', (update) => {})
sock.ev.on('blocklist.update', (update) => {})
sock.ev.on('call', (update) => {})
sock.ev.on('labels.edit', (update) => {})
sock.ev.on('labels.association', (update) => {})
sock.ev.on('newsletter.reaction', (update) => {})
sock.ev.on('newsletter.view', (update) => {})
sock.ev.on('newsletter-participants.update', (update) => {})
sock.ev.on('newsletter-settings.update', (update) => {})
sock.ev.on('settings.update', (update) => {})
```

## 🚀 Try the Bot

A fast, lightweight, and modular WhatsApp bot built with [@itsliaaa/baileys](https://www.npmjs.com/package/@itsliaaa/baileys).
Perfect for managing groups, moderating chats, and adding fun with quiz games and handy tools.

👉🏻 [@itsliaaa/starseed](https://github.com/itsliaaa/starseed#readme)

## 📦 Fork Base

This fork is based on [Baileys (GitHub)](https://github.com/WhiskeySockets/Baileys)

## 📣 Credits

This project utilizes Protocol Buffer definitions maintained by [WPPConnect](https://github.com/wppconnect-team) through the [`wa-proto`](https://github.com/wppconnect-team/wa-proto) repository.

Full credit is attributed to the original maintainers and contributors of Baileys:
- [purpshell](https://github.com/purpshell)
- [jlucaso1](https://github.com/jlucaso1)
- [adiwajshing](https://github.com/adiwajshing)

This fork includes additional enhancements and modifications by [Lia Wynn](https://github.com/itsliaaa)

Special thanks to [itsreimau](https://github.com/itsreimau) for the fix to the `updateBlockStatus` implementation.

> [!CAUTION]
> ⚠️ **Modification, removal, or misrepresentation of these credits is strictly prohibited. Any redistribution or fork must preserve this section in its original form without exception.**
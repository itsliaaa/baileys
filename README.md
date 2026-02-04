## 🌱 itsliaaa/baileys

A lightweight fork of Baileys with a few fixes and a small adjustment.

---

### ⚙️ Changes
- Fixed an issue where media could not be sent to newsletter due to an upstream Baileys bug.
- Added support for sending interactive message (button, list, interactive, template, carousel)
- Added support for album message, sticker pack message, and payment-related message (request payment, payment invite, order, invoice)
- Added boolean options for message handling:  
  `ai` (adds AI-related metadata),  
  `ephemeral`, `statusGroup`, `viewOnceV2`, `viewOnceV2Extension`, `interactiveAsTemplate` (message wrapping)
- Slightly adjusted authentication state handling and pre-key manager

### 📥 Installation

- 📄 Via `package.json`
```json
"dependencies": {
   "@itsliaaa/baileys": "latest"
}
```

- ⌨️ Via `terminal`
```bash
npm i @itsliaaa/baileys@latest
```

- 🧩 Import (ESM & CJS)
```javascript
// --- ESM
import { makeWASocket } from '@itsliaaa/baileys'

// --- CJS (tested and working on Node.js 24 ✅)
const { makeWASocket } = require('@itsliaaa/baileys')
```

### 🔧 Usage

<details open>
<summary><strong>🌐 Connect to WhatsApp (Quick Step)</strong></summary>

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
         await delay(1_500)
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

> 📝 Highly recommend building your own data store, as storing someone's entire chat history in memory is a terrible waste of RAM.

```javascript
import { makeWASocket, makeInMemoryStore, delay, DisconnectReason, useMultiFileAuthState } from '@itsliaaa/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

const myPhoneNumber = '6288888888888'
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
         await delay(1_500)
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

   // --- Save store every 60s
   setInterval(() => {
      store.writeToFile(storePath)
   }, 60000)
}

connectToWhatsApp()
```

</details>

<details>
<summary><strong>🪪 WhatsApp IDs Explain</strong></summary>

💭 `id` is the WhatsApp ID, called `jid` and `lid` too, of the person or group you're sending the message to.
- It must be in the format `[country code][phone number]@s.whatsapp.net`
   - Example for people: `+19999999999@s.whatsapp.net` and `12677777777777@lid`.
   - For groups, it must be in the format `123456789-123345@g.us`.
- For meta ai, it's `11111111111@bot`.
- For broadcast lists, it's `[timestamp of creation]@broadcast`.
- For stories, the ID is `status@broadcast`.

</details>

<details>
<summary><strong>✉️ Sending Messages</strong></summary>

> 📝 You can get the `jid` from `message.key.remoteJid` in the first example.

- 🔠 Text
```javascript
sock.sendMessage(jid, {
   text: '👋🏻 Hello'
}, {
   quoted: message
})
```

- 🔔 Mention
```javascript
sock.sendMessage(jid, {
   text: '👋🏻 Hello @628123456789',
   mentions: ['628123456789@s.whatsapp.net']
}, {
   quoted: message
})
```

- 😁 Reaction
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

- 📌 Pin Message
```javascript
sock.sendMessage(jid, {
   pin: message.key,
   time: 86400, // --- Set the value in seconds: 86400 (1d), 604800 (7d), or 2592000 (30d)
   type: 1 // --- Or 0 to remove
}, {
   quoted: message
})
```

- 👤 Contact
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

- 📍 Location
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

- 📊 Poll
```javascript
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
```

> 📝 In media messages, You can pass `{ stream: Stream }`, `{ url: Url }` or `Buffer` directly.

- 📁 Media

🖼️ Image

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

🎥 Video

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

📃 Sticker

```javascript
sock.sendMessage(jid, {
   sticker: {
      url: './path/to/sticker.webp'
   }
}, {
   quoted: message
})
```

💽 Audio

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

🖼️ Album (Image & Video)

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

📦 Sticker Pack

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
   description: '🏷️ @itsliaaa/baileys'
}, {
   quoted: message
})
```

- 👆🏻 Interactive

1️⃣ Buttons (Classic)

```javascript
sock.sendMessage(jid, {
   text: '👆🏻 Buttons!',
   footer: '🏷️ @itsliaaa/baileys',
   buttons: [{
      text: '👋🏻 SignUp',
      id: '#SignUp'
   }]
}, {
   quoted: message
})
```

🖼️ Buttons (With Media & Native Flow)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👆🏻 Buttons and Native Flow!',
   footer: '🏷️ @itsliaaa/baileys',
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

2️⃣ List (Classic)

> 📝 It only works in private chat (`@s.whatsapp.net`).

```javascript
sock.sendMessage(jid, {
   text: '📋 List!',
   footer: '🏷️ @itsliaaa/baileys',
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

3️⃣ Interactive (Native Flow)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🗄️ Interactive!',
   footer: '🏷️ @itsliaaa/baileys',
   optionText: '👉🏻 Select Options', // --- Optional, wrap all native flow into one list
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

🎠 Interactive (Carousel & Native Flow)

```javascript
sock.sendMessage(jid, {
   text: '🗂️ Interactive with Carousel!',
   footer: 'itsliaaa/baileys',
   cards: [{
      image: {
         url: 'https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg'
      },
      caption: '🖼️ Image 1',
      footer: '🏷️️ Pinterest',
      nativeFlow: [{
         text: '🌐 Sumber',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }, {
      image: {
         url: 'https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg'
      },
      caption: '🖼️ Image 2',
      footer: '🏷️ Pinterest',
      couponText: '🏷️ New Coupon!',
      couponCode: '@itsliaaa/baileys',
      nativeFlow: [{
         text: '🌐 Sumber',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }, {
      image: {
         url: 'https://i.pinimg.com/736x/8c/6d/db/8c6ddb5fe6600fcc4b183cb2ee228eb7.jpg'
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
         text: '🌐 Sumber',
         url: 'https://www.npmjs.com/package/baileys'
      }]
   }]
}, {
   quoted: message
})
```

4️⃣ Template (Hydrated Template)

```javascript
sock.sendMessage(jid, {
   title: '👋🏻 Hello',
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🫙 Template!',
   footer: '🏷️ @itsliaaa/baileys',
   templateButtons: [{
      text: '👉🏻 Tap Here',
      id: '#Order'
   }, {
      text: '🌐 Sumber',
      url: 'https://www.npmjs.com/package/baileys'
   }, {
      text: '📞 Call',
      call: '628123456789'
   }]
}, {
   quoted: message
})
```

- 💳 Payment

1️⃣ Invite Payment

```javascript
sock.sendMessage(jid, {
   paymentInviteServiceType: 3 // 1, 2, or 3
})
```

2️⃣ Invoice

> 📝 Invoice messages are not supported yet.

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   invoiceNote: '🏷️ Invoice'
})
```

3️⃣ Order

```javascript
sock.sendMessage(chat, {
   orderText: '🛍️ Order',
   thumbnail: fs.readFileSync('./path/to/image.jpg') // --- Must in buffer format
}, {
   quoted: message
})
```

4️⃣ Product

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

5️⃣ Request Payment

```javascript
sock.sendMessage(jid, {
   text: '💳 Request Payment',
   requestPaymentFrom: '0@s.whatsapp.net'
})
```

- 👁️ Other

1️⃣ AI Label

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

2️⃣ External Ad Reply

> 📝 Ad thumbnail in message (some device may not displayed)

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

3️⃣ Ephemeral

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

4️⃣ Group Status

> 📝 It only works in grouo chat (`@g.us`)

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👥 Group Status!',
   groupStatus: true
})
```

5️⃣ View Once

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

6️⃣ View Once V2

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

7️⃣ View Once V2 Extension

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

### 📦 Fork Base
> [!IMPORTANT]
Based on [Baileys GitHub](https://github.com/WhiskeySockets/Baileys/commits/master) version as of **2026-01-25**

## 📣 Credits
> [!CAUTION]
All rights reserved to the original maintainers:
> - [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys/)
> - [purpshell](https://github.com/purpshell)
> - [adiwajshing (Original Creator)](https://github.com/adiwajshing)

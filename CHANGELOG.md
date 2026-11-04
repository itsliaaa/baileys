# Changelog

## 0.4.4 - 2026-11-04

- fix: correctly detect the exact media type in `prepareWAMessageMedia()`.
- chore: update WAProto to `2.3000.1052812464`.
- chore: update default socket version to `2.3000.1052983891`.

## 0.4.3 - 2026-11-01

- chore: update WAProto and socket version to `2.3000.1052238679`.
- fix: prevent `form_message` send failures.
- fix: prevent errors when marking messages as successful in `messageRetryManager`.
- chore: add the missing `server_transcode` parameter to newsletter media uploads.
- chore: expand media upload path and HKDF key mappings.
- chore: add `isBoom` for `HttpError`.
- feat: add debounced phash mismatch recovery on bad ACK.

## 0.4.2 - 2026-10-27

- refactor: Refactor `useMultiFileAuthState()`, `useSingleFileAuthState()`, and `useSqliteAuthState()`.
- chore: Add the `form_message` node attribute when sending A2UI forms via `interactiveMessage`.

## 0.4.1 - 2026-10-26

- refactor: reduce transitive dependencies from 13 to just 2.
- refactor: migrate signal transport to a Rust-based WASM implementation.
- refactor: make `ws` optional for Node.js 22 and above. For older Node.js versions, `ws` must be installed manually.
- chore: reintroduce `printQRInTerminal` in `makeWASocket()`.
- fix: resolve `peerDependencies` conflicts.
- ... I forgot the rest.
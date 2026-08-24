# IMMU MD V3

A fresh, self-built multi-session WhatsApp bot. Own architecture — not a fork of IMMU-MD or IMMU-X.

## Structure
- `index.js` — Express server, pairing API, session bootstrap
- `config.js` — central config
- `src/connection.js` — WhatsApp socket lifecycle (pairing, reconnect, dedup guard)
- `src/sessionManager.js` — GitHub-backed session persistence
- `src/settings.js` — per-number settings store
- `src/messageHandler.js` — command dispatch, anti-delete, anti-viewonce, anti-link, presence
- `src/commandRouter.js` — dynamic plugin-style command loader
- `commands/<category>/*.js` — individual commands, one file per command
- `public/index.html` — pairing web UI

## Deploy (Heroku)
1. Set config vars: `GITHUB_TOKEN`, `OWNER_NUMBER`
2. Add buildpacks: `heroku-buildpack-apt`, `heroku/nodejs`
3. Deploy from `main`

## Add a command
Create a file in the right `commands/<category>/` folder:

```js
module.exports = {
  name: 'mycommand',
  aliases: ['mc'],
  category: 'core',
  description: 'What it does',
  async execute({ socket, jid, args, isOwner, isGroup, number, settings }) {
    await socket.sendMessage(jid, { text: 'Hello!' });
  }
};
```

It's auto-loaded on boot — no manual registration needed.

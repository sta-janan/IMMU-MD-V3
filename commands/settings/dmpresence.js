const settingsStore = require('../../src/settings');
const VALID = ['online', 'offline', 'typing', 'recording'];

module.exports = {
    name: 'dmpresence',
    category: 'settings',
    description: 'online/offline/typing/recording',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const val = (args[0] || '').toLowerCase();
        if (!VALID.includes(val)) return socket.sendMessage(jid, { text: `📌 Usage: .dmpresence <${VALID.join('/')}>` });
        settingsStore.set(number, 'dmPresence', val);
        await socket.sendMessage(jid, { text: `✅ DM presence set to *${val}*` });
    }
};

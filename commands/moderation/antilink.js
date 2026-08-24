const settingsStore = require('../../src/settings');

module.exports = {
    name: 'antilink',
    category: 'moderation',
    description: 'on/off — remove WhatsApp group links from non-admins',
    async execute({ socket, jid, args, number, isOwner, isGroup }) {
        if (!isGroup) return socket.sendMessage(jid, { text: '❌ Groups only.' });
        const val = (args[0] || '').toLowerCase();
        if (!['on', 'off'].includes(val)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .antilink <on/off>' });
        }
        settingsStore.set(number, 'antiLink', val === 'on');
        await socket.sendMessage(jid, { text: `✅ Anti-link turned *${val}*` });
    }
};

const settingsStore = require('../../src/settings');

module.exports = {
    name: 'antiviewonce',
    category: 'moderation',
    description: 'inchat/indm/off — reveal view-once media',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const val = (args[0] || '').toLowerCase();
        if (!['inchat', 'indm', 'off'].includes(val)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .antiviewonce <inchat/indm/off>' });
        }
        settingsStore.set(number, 'antiViewOnce', val);
        await socket.sendMessage(jid, { text: `✅ Anti-viewonce set to *${val}*` });
    }
};

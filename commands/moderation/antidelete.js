const settingsStore = require('../../src/settings');

module.exports = {
    name: 'antidelete',
    category: 'moderation',
    description: 'inchat/indm/off — alert on deleted messages',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const val = (args[0] || '').toLowerCase();
        if (!['inchat', 'indm', 'off'].includes(val)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .antidelete <inchat/indm/off>' });
        }
        settingsStore.set(number, 'antiDelete', val);
        await socket.sendMessage(jid, { text: `✅ Anti-delete set to *${val}*` });
    }
};

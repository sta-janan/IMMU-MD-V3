const settingsStore = require('../../src/settings');

module.exports = {
    name: 'autostatus',
    category: 'settings',
    description: 'on/off — auto-view contacts\' statuses',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const val = (args[0] || '').toLowerCase();
        if (!['on', 'off'].includes(val)) return socket.sendMessage(jid, { text: '📌 Usage: .autostatus <on/off>' });
        settingsStore.set(number, 'autoStatusView', val === 'on');
        await socket.sendMessage(jid, { text: `✅ Auto status-view turned *${val}*` });
    }
};

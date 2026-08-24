const settingsStore = require('../../src/settings');

module.exports = {
    name: 'setprefix',
    category: 'settings',
    description: 'Change command prefix',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 3) return socket.sendMessage(jid, { text: '📌 Usage: .setprefix <symbol>' });
        settingsStore.set(number, 'prefix', newPrefix);
        await socket.sendMessage(jid, { text: `✅ Prefix changed to *${newPrefix}*` });
    }
};

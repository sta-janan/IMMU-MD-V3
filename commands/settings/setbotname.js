const settingsStore = require('../../src/settings');

module.exports = {
    name: 'setbotname',
    category: 'settings',
    description: 'Customize bot display name',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const name = args.join(' ').trim();
        if (!name) return socket.sendMessage(jid, { text: '📌 Usage: .setbotname <name>' });
        settingsStore.set(number, 'botName', name);
        await socket.sendMessage(jid, { text: `✅ Bot name set to *${name}*` });
    }
};

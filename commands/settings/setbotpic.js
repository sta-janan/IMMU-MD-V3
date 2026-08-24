const settingsStore = require('../../src/settings');

module.exports = {
    name: 'setbotpic',
    category: 'settings',
    description: 'Customize bot picture (URL)',
    async execute({ socket, jid, args, number, isOwner }) {
        if (!isOwner) return socket.sendMessage(jid, { text: '❌ Owner only.' });
        const url = args[0];
        if (!url) return socket.sendMessage(jid, { text: '📌 Usage: .setbotpic <image URL>' });
        settingsStore.set(number, 'botPic', url);
        await socket.sendMessage(jid, { image: { url }, caption: '✅ Bot picture updated!' });
    }
};

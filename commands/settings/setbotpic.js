const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'setbotpic',
    category: 'settings',
    description: 'Customize bot picture (URL)',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName, number });
        const url = args[0];
        if (!url) return sendStyled(socket, jid, { text: '📌 Usage: .setbotpic <image URL>' }, { botName, number });
        settingsStore.set(number, 'botPic', url);
        await sendStyled(socket, jid, { image: { url }, caption: '✅ Bot picture updated!' }, { botName, number });
    }
};

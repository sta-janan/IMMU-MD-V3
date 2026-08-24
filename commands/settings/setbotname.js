const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'setbotname',
    category: 'settings',
    description: 'Customize bot display name',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName });
        const name = args.join(' ').trim();
        if (!name) return sendStyled(socket, jid, { text: '📌 Usage: .setbotname <name>' }, { botName });
        settingsStore.set(number, 'botName', name);
        await sendStyled(socket, jid, { text: `✅ Bot name set to *${name}*` }, { botName: name });
    }
};

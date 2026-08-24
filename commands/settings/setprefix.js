const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'setprefix',
    category: 'settings',
    description: 'Change command prefix',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName });
        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 3) return sendStyled(socket, jid, { text: '📌 Usage: .setprefix <symbol>' }, { botName });
        settingsStore.set(number, 'prefix', newPrefix);
        await sendStyled(socket, jid, { text: `✅ Prefix changed to *${newPrefix}*` }, { botName });
    }
};

const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'antidelete',
    category: 'moderation',
    description: 'inchat/indm/off — alert on deleted messages',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName, number });
        const val = (args[0] || '').toLowerCase();
        if (!['inchat', 'indm', 'off'].includes(val)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .antidelete <inchat/indm/off>' }, { botName, number });
        }
        settingsStore.set(number, 'antiDelete', val);
        await sendStyled(socket, jid, { text: `✅ Anti-delete set to *${val}*` }, { botName, number });
    }
};

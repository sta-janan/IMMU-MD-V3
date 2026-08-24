const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'antiviewonce',
    category: 'moderation',
    description: 'inchat/indm/off — reveal view-once media',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName, number });
        const val = (args[0] || '').toLowerCase();
        if (!['inchat', 'indm', 'off'].includes(val)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .antiviewonce <inchat/indm/off>' }, { botName, number });
        }
        settingsStore.set(number, 'antiViewOnce', val);
        await sendStyled(socket, jid, { text: `✅ Anti-viewonce set to *${val}*` }, { botName, number });
    }
};

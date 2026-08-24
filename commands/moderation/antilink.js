const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'antilink',
    category: 'moderation',
    description: 'on/off — remove WhatsApp group links from non-admins',
    async execute({ socket, jid, args, number, isOwner, isGroup, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isGroup) return sendStyled(socket, jid, { text: '❌ Groups only.' }, { botName });
        const val = (args[0] || '').toLowerCase();
        if (!['on', 'off'].includes(val)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .antilink <on/off>' }, { botName });
        }
        settingsStore.set(number, 'antiLink', val === 'on');
        await sendStyled(socket, jid, { text: `✅ Anti-link turned *${val}*` }, { botName });
    }
};

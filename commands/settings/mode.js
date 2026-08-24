const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'mode',
    category: 'settings',
    description: 'public/private — private only replies to the owner',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName, number });
        const val = (args[0] || '').toLowerCase();
        if (!['public', 'private'].includes(val)) {
            return sendStyled(socket, jid, { text: `📌 Usage: .mode <public/private>\n\nCurrent: *${settings.mode}*` }, { botName, number });
        }
        settingsStore.set(number, 'mode', val);
        await sendStyled(socket, jid, { text: `✅ Mode set to *${val}*${val === 'private' ? '\n\n🔒 Only you will get responses now.' : '\n\n🌍 Everyone can use the bot now.'}` }, { botName, number });
    }
};

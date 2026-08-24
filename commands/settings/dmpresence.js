const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');
const VALID = ['online', 'offline', 'typing', 'recording'];

module.exports = {
    name: 'dmpresence',
    category: 'settings',
    description: 'online/offline/typing/recording',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName });
        const val = (args[0] || '').toLowerCase();
        if (!VALID.includes(val)) return sendStyled(socket, jid, { text: `📌 Usage: .dmpresence <${VALID.join('/')}>` }, { botName });
        settingsStore.set(number, 'dmPresence', val);
        await sendStyled(socket, jid, { text: `✅ DM presence set to *${val}*` }, { botName });
    }
};

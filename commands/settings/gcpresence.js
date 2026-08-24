const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');
const VALID = ['online', 'offline', 'typing', 'recording'];

module.exports = {
    name: 'gcpresence',
    category: 'settings',
    description: 'online/offline/typing/recording',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName, number });
        const val = (args[0] || '').toLowerCase();
        if (!VALID.includes(val)) return sendStyled(socket, jid, { text: `📌 Usage: .gcpresence <${VALID.join('/')}>` }, { botName, number });
        settingsStore.set(number, 'gcPresence', val);
        await sendStyled(socket, jid, { text: `✅ Group presence set to *${val}*` }, { botName, number });
    }
};

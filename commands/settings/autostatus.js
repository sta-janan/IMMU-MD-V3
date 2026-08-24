const settingsStore = require('../../src/settings');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'autostatus',
    category: 'settings',
    description: 'on/off — auto-view contacts\' statuses',
    async execute({ socket, jid, args, number, isOwner, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        if (!isOwner) return sendStyled(socket, jid, { text: '❌ Owner only.' }, { botName });
        const val = (args[0] || '').toLowerCase();
        if (!['on', 'off'].includes(val)) return sendStyled(socket, jid, { text: '📌 Usage: .autostatus <on/off>' }, { botName });
        settingsStore.set(number, 'autoStatusView', val === 'on');
        await sendStyled(socket, jid, { text: `✅ Auto status-view turned *${val}*` }, { botName });
    }
};

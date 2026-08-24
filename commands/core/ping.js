const config = require('../../config');
const { sendStyled } = require('../../src/style');

module.exports = {
    name: 'ping',
    category: 'core',
    description: 'Check response speed',
    async execute({ socket, jid, settings, number }) {
        const botName = settings.botName || config.BOT_NAME;
        const start = Date.now();
        const sent = await sendStyled(socket, jid, { text: '🏓 Pinging...' }, { botName, number });
        const took = Date.now() - start;
        await socket.sendMessage(jid, { text: `🏓 Pong! *${took}ms*`, edit: sent.key });
    }
};

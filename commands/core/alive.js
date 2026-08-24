const config = require('../../config');
const { listActive } = require('../../src/connection');

module.exports = {
    name: 'alive',
    category: 'core',
    description: 'Check bot status',
    async execute({ socket, jid, settings, number }) {
        const uptime = Math.floor(process.uptime());
        const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = uptime % 60;
        const text = `*${settings.botName || config.BOT_NAME} is alive!* ✅\n\n` +
            `⏰ Uptime: ${h}h ${m}m ${s}s\n` +
            `🔌 Active sessions: ${listActive().length}\n` +
            `📱 This number: ${number}\n\n` +
            `> ${settings.botName || config.BOT_NAME}`;
        await socket.sendMessage(jid, { image: { url: settings.botPic || config.DEFAULT_MENU_IMAGE }, caption: text });
    }
};

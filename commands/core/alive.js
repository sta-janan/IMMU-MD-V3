const config = require('../../config');
const { listActive } = require('../../src/connection');
const { sendStyled, box } = require('../../src/style');

module.exports = {
    name: 'alive',
    category: 'core',
    description: 'Check bot status',
    async execute({ socket, jid, settings, number }) {
        const uptime = Math.floor(process.uptime());
        const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = uptime % 60;
        const botName = settings.botName || config.BOT_NAME;

        const text = `> *${botName} ɪs ᴀʟɪᴠᴇ* ✅\n\n` + box('sᴛᴀᴛᴜs', [
            `⏰ ᴜᴘᴛɪᴍᴇ: ${h}h ${m}m ${s}s`,
            `🔌 ᴀᴄᴛɪᴠᴇ sᴇssɪᴏɴs: ${listActive().length}`,
            `📱 ᴛʜɪs ɴᴜᴍʙᴇʀ: ${number}`,
            `💾 ᴍᴇᴍᴏʀʏ: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        ]) + `\n\n> ${botName}`;

        await sendStyled(socket, jid, {
            image: { url: settings.botPic || config.DEFAULT_MENU_IMAGE },
            caption: text
        }, { botName, number });
    }
};

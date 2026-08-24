const config = require('../../config');
const { listByCategory } = require('../../src/commandRouter');
const { sendStyled, box } = require('../../src/style');

module.exports = {
    name: 'menu',
    aliases: ['help'],
    category: 'core',
    description: 'Show all available commands',
    async execute({ socket, jid, settings, prefix, senderJid }) {
        const categories = listByCategory();
        const botName = settings.botName || config.BOT_NAME;

        const header = box('ɪɴғᴏ', [
            `🌟 ʙᴏᴛ: ${botName}`,
            `👤 ᴜsᴇʀ: @${senderJid.split('@')[0]}`,
            `📍 ᴘʀᴇғɪx: ${prefix}`,
            `📦 ᴄᴏᴍᴍᴀɴᴅs: ${Object.values(categories).flat().length}`
        ]);

        let body = '';
        for (const [cat, cmds] of Object.entries(categories)) {
            body += `\n*『 ${cat.toUpperCase()} 』*\n`;
            cmds.forEach(c => { body += `  ▸ ${prefix}${c.name}\n`; });
        }

        const text = `${header}\n${body}\n> ${botName}`;

        await sendStyled(socket, jid, {
            image: { url: settings.botPic || config.DEFAULT_MENU_IMAGE },
            caption: text,
            mentions: [senderJid]
        }, { botName });
    }
};

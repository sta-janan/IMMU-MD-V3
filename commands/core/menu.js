const config = require('../../config');
const { listByCategory } = require('../../src/commandRouter');

module.exports = {
    name: 'menu',
    aliases: ['help'],
    category: 'core',
    description: 'Show all available commands',
    async execute({ socket, jid, settings }) {
        const categories = listByCategory();
        let text = `*👾 ${settings.botName || config.BOT_NAME} 👾*\n\n`;
        for (const [cat, cmds] of Object.entries(categories)) {
            text += `*${cat.toUpperCase()}*\n`;
            cmds.forEach(c => { text += `▸ ${c.name}${c.description ? ` — ${c.description}` : ''}\n`; });
            text += '\n';
        }
        text += `> ${settings.botName || config.BOT_NAME}`;

        await socket.sendMessage(jid, {
            image: { url: settings.botPic || config.DEFAULT_MENU_IMAGE },
            caption: text
        });
    }
};

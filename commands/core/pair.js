const config = require('../../config');
const { sendStyled, box } = require('../../src/style');

module.exports = {
    name: 'pair',
    category: 'core',
    description: 'Get the link to pair another number',
    async execute({ socket, jid, settings, number }) {
        const botName = settings.botName || config.BOT_NAME;
        const text = box('ᴘᴀɪʀ ᴀ ɴᴜᴍʙᴇʀ', [
            `🔗 ${config.PAIR_URL}`,
            `📱 ᴏᴘᴇɴ ᴛʜᴇ ʟɪɴᴋ, ᴇɴᴛᴇʀ ʏᴏᴜʀ ɴᴜᴍʙᴇʀ,`,
            `ᴀɴᴅ ʟɪɴᴋ ɪᴛ ɪɴ ᴡʜᴀᴛsᴀᴘᴘ.`
        ]) + `\n\n> ${botName}`;
        await sendStyled(socket, jid, { text }, { botName, number });
    }
};

const { fetchMedia, fullUrl } = require('../../src/downloader');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'fb',
    aliases: ['facebook'],
    category: 'downloads',
    description: 'Download a Facebook video',
    async execute({ socket, jid, args, settings, number }) {
        const botName = settings.botName || config.BOT_NAME;
        const url = args[0];
        if (!url || !/facebook\.com|fb\.watch/i.test(url)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .fb <link>' }, { botName, number });
        }
        const data = await fetchMedia(url);
        if (!data.downloadUrl) return sendStyled(socket, jid, { text: '❌ No downloadable video found.' }, { botName, number });
        await sendStyled(socket, jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `📘 Facebook${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` }, { botName, number });
    }
};

const { fetchMedia, fullUrl } = require('../../src/downloader');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'ig',
    aliases: ['instagram'],
    category: 'downloads',
    description: 'Download an Instagram post/reel',
    async execute({ socket, jid, args, settings }) {
        const botName = settings.botName || config.BOT_NAME;
        const url = args[0];
        if (!url || !/instagram\.com/i.test(url)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .ig <link>' }, { botName });
        }
        const data = await fetchMedia(url);
        const images = (data.metadata?.images || []).map(i => i.url).filter(Boolean);

        if (images.length && !data.downloadUrl) {
            for (const [i, img] of images.slice(0, 10).entries()) {
                await sendStyled(socket, jid, { image: { url: fullUrl(img) }, caption: i === 0 ? '📸 Instagram' : undefined }, { botName });
            }
            return;
        }
        if (!data.downloadUrl) return sendStyled(socket, jid, { text: '❌ No downloadable media found.' }, { botName });
        await sendStyled(socket, jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `📸 Instagram${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` }, { botName });
    }
};

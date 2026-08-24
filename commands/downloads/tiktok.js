const { fetchMedia, fullUrl } = require('../../src/downloader');
const { sendStyled } = require('../../src/style');
const config = require('../../config');

module.exports = {
    name: 'tiktok',
    category: 'downloads',
    description: 'Download a TikTok video/photos',
    async execute({ socket, jid, args, settings, number }) {
        const botName = settings.botName || config.BOT_NAME;
        const url = args[0];
        if (!url || !/tiktok\.com/i.test(url)) {
            return sendStyled(socket, jid, { text: '📌 Usage: .tiktok <link>' }, { botName, number });
        }
        const data = await fetchMedia(url);
        const images = (data.metadata?.images || []).map(i => i.url).filter(Boolean);

        if (images.length && !data.downloadUrl) {
            for (const [i, img] of images.slice(0, 10).entries()) {
                await sendStyled(socket, jid, { image: { url: fullUrl(img) }, caption: i === 0 ? '🎵 TikTok' : undefined }, { botName, number });
            }
            return;
        }
        if (!data.downloadUrl) return sendStyled(socket, jid, { text: '❌ No downloadable media found.' }, { botName, number });
        await sendStyled(socket, jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `🎵 TikTok${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` }, { botName, number });
    }
};

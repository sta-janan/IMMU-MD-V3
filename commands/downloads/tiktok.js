const { fetchMedia, fullUrl } = require('../../src/downloader');

module.exports = {
    name: 'tiktok',
    category: 'downloads',
    description: 'Download a TikTok video/photos',
    async execute({ socket, jid, args }) {
        const url = args[0];
        if (!url || !/tiktok\.com/i.test(url)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .tiktok <link>' });
        }
        await socket.sendMessage(jid, { react: { text: '⏳', key: undefined } }).catch(() => {});
        const data = await fetchMedia(url);
        const images = (data.metadata?.images || []).map(i => i.url).filter(Boolean);

        if (images.length && !data.downloadUrl) {
            for (const [i, img] of images.slice(0, 10).entries()) {
                await socket.sendMessage(jid, { image: { url: fullUrl(img) }, caption: i === 0 ? '🎵 TikTok' : undefined });
            }
            return;
        }
        if (!data.downloadUrl) return socket.sendMessage(jid, { text: '❌ No downloadable media found.' });
        await socket.sendMessage(jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `🎵 TikTok${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` });
    }
};

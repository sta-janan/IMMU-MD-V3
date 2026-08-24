const { fetchMedia, fullUrl } = require('../../src/downloader');

module.exports = {
    name: 'ig',
    aliases: ['instagram'],
    category: 'downloads',
    description: 'Download an Instagram post/reel',
    async execute({ socket, jid, args }) {
        const url = args[0];
        if (!url || !/instagram\.com/i.test(url)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .ig <link>' });
        }
        const data = await fetchMedia(url);
        const images = (data.metadata?.images || []).map(i => i.url).filter(Boolean);

        if (images.length && !data.downloadUrl) {
            for (const [i, img] of images.slice(0, 10).entries()) {
                await socket.sendMessage(jid, { image: { url: fullUrl(img) }, caption: i === 0 ? '📸 Instagram' : undefined });
            }
            return;
        }
        if (!data.downloadUrl) return socket.sendMessage(jid, { text: '❌ No downloadable media found.' });
        await socket.sendMessage(jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `📸 Instagram${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` });
    }
};

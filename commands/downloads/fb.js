const { fetchMedia, fullUrl } = require('../../src/downloader');

module.exports = {
    name: 'fb',
    aliases: ['facebook'],
    category: 'downloads',
    description: 'Download a Facebook video',
    async execute({ socket, jid, args }) {
        const url = args[0];
        if (!url || !/facebook\.com|fb\.watch/i.test(url)) {
            return socket.sendMessage(jid, { text: '📌 Usage: .fb <link>' });
        }
        const data = await fetchMedia(url);
        if (!data.downloadUrl) return socket.sendMessage(jid, { text: '❌ No downloadable video found.' });
        await socket.sendMessage(jid, { video: { url: fullUrl(data.downloadUrl) }, caption: `📘 Facebook${data.metadata?.author ? `\n👤 ${data.metadata.author}` : ''}` });
    }
};

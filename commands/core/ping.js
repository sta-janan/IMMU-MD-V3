module.exports = {
    name: 'ping',
    category: 'core',
    description: 'Check response speed',
    async execute({ socket, jid, msg }) {
        const start = Date.now();
        const sent = await socket.sendMessage(jid, { text: '🏓 Pinging...' });
        const took = Date.now() - start;
        await socket.sendMessage(jid, { text: `🏓 Pong! *${took}ms*`, edit: sent.key });
    }
};

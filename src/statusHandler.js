const settingsStore = require('./settings');

function attachStatusHandler(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.remoteJid !== 'status@broadcast') return;
        const settings = settingsStore.get(number);
        if (!settings.autoStatusView) return;
        try {
            await socket.readMessages([msg.key]);
        } catch (e) { /* ignore */ }
    });
}

module.exports = { attachStatusHandler };

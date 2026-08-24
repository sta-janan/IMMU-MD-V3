const express = require('express');
const path = require('path');
const config = require('./config');
const { startSession, getSession, listActive } = require('./src/connection');
const { getRegisteredNumbers } = require('./src/sessionManager');
const { loadAll } = require('./src/commandRouter');

loadAll();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/pair', async (req, res) => {
    const number = (req.query.number || '').replace(/[^0-9]/g, '');
    if (!number) return res.status(400).json({ error: 'number is required' });
    if (getSession(number)) return res.json({ status: 'already_connected' });

    let pairingCode = null;
    try {
        await startSession(number, {
            onPairingCode: (code) => { pairingCode = code; }
        });
        if (!pairingCode) return res.status(500).json({ error: 'Could not generate a pairing code. Try again.' });
        res.json({ status: 'ok', code: pairingCode });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ active: listActive() });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`${config.BOT_NAME} server running on port ${PORT}`));

// Restore any previously-paired sessions on boot.
(async () => {
    const numbers = await getRegisteredNumbers();
    for (const number of numbers) {
        try {
            await startSession(number);
            console.log(`[boot] restored session for ${number}`);
        } catch (e) {
            console.error(`[boot] failed to restore ${number}:`, e.message);
        }
    }
})();

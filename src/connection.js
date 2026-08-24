const path = require('path');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');

const config = require('../config');
const { sessionDir, saveCredsToGitHub, restoreCredsFromGitHub, deleteSessionFromGitHub } = require('./sessionManager');
const { attachMessageHandler } = require('./messageHandler');
const { attachStatusHandler } = require('./statusHandler');

const sessions = new Map(); // number -> { socket, startedAt }

async function startSession(number, { onPairingCode } = {}) {
    const clean = number.replace(/[^0-9]/g, '');

    // Never allow two live sockets for the same number — this was the
    // exact cause of repeated "conflict" disconnects in earlier builds.
    if (sessions.has(clean)) {
        const existing = sessions.get(clean).socket;
        try { existing.ev.removeAllListeners(); existing.end(undefined); } catch (e) { /* already dead */ }
        sessions.delete(clean);
        await delay(800);
    }

    await restoreCredsFromGitHub(clean);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir(clean));

    const socket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Chrome'),
        printQRInTerminal: false
    });

    sessions.set(clean, { socket, startedAt: Date.now() });

    socket.ev.on('creds.update', async () => {
        await saveCreds();
        saveCredsToGitHub(clean); // fire-and-forget backup
    });

    if (onPairingCode && !state.creds.registered) {
        try {
            // The socket needs a moment to actually open its WebSocket
            // connection before a pairing code can be requested — doing
            // it immediately causes a "Connection Closed" error.
            let code = null;
            let attempts = 0;
            while (!code && attempts < 3) {
                attempts++;
                try {
                    await delay(attempts === 1 ? 2500 : 4000);
                    code = await socket.requestPairingCode(clean);
                } catch (err) {
                    console.warn(`[connection] pairing code attempt ${attempts} failed for ${clean}: ${err.message}`);
                    if (attempts >= 3) throw err;
                }
            }
            onPairingCode(code);
        } catch (e) {
            console.error(`[connection] pairing code request failed for ${clean}:`, e.message);
        }
    }

    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(`[connection] ${clean} connected.`);
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {
                console.log(`[connection] ${clean} logged out — clearing session.`);
                sessions.delete(clean);
                await deleteSessionFromGitHub(clean);
                return;
            }

            if (statusCode === DisconnectReason.connectionReplaced) {
                // Another socket took over — do NOT auto-reconnect here,
                // that just fights the other socket in an endless loop.
                console.log(`[connection] ${clean} replaced by another session — not reconnecting.`);
                sessions.delete(clean);
                return;
            }

            console.log(`[connection] ${clean} lost, reconnecting in 5s...`);
            sessions.delete(clean);
            await delay(5000);
            startSession(clean).catch(e => console.error(`[connection] reconnect failed for ${clean}:`, e.message));
        }
    });

    attachMessageHandler(socket, clean);
    attachStatusHandler(socket, clean);
    return socket;
}

function getSession(number) {
    return sessions.get(number.replace(/[^0-9]/g, ''))?.socket || null;
}

function listActive() {
    return [...sessions.keys()];
}

module.exports = { startSession, getSession, listActive };

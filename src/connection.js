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
const { attachMessageHandler, clearPresenceFor } = require('./messageHandler');
const { attachStatusHandler } = require('./statusHandler');

const sessions = new Map(); // number -> { socket, startedAt }

async function startSession(number, { onPairingCode } = {}) {
    const clean = number.replace(/[^0-9]/g, '');
    const fs = require('fs-extra');

    // Never allow two live sockets for the same number — this was the
    // exact cause of repeated "conflict" disconnects in earlier builds.
    if (sessions.has(clean)) {
        const existing = sessions.get(clean).socket;
        try { existing.ev.removeAllListeners(); existing.end(undefined); } catch (e) { /* already dead */ }
        sessions.delete(clean);
        await delay(800);
    }

    // Starting a NEW pairing (onPairingCode given) must begin from a
    // completely clean folder. Leftover per-chat session/pre-key files
    // from an earlier, possibly-broken pairing attempt were mixing with
    // the new identity after a fresh pair, causing the Signal Protocol's
    // "Bad MAC" decrypt failures on almost every incoming message.
    if (onPairingCode) {
        await fs.remove(sessionDir(clean));
    }

    // Only pull the session from GitHub if we don't already have local
    // creds AND we're not starting a brand new pairing — restoring on
    // every reconnect was overwriting a freshly-paired local session with
    // a stale GitHub backup, causing the account to get logged straight
    // back out. A new pairing should also never restore old GitHub data —
    // it needs a genuinely fresh identity.
    const localCredsPath = path.join(sessionDir(clean), 'creds.json');
    if (!onPairingCode && !fs.existsSync(localCredsPath)) {
        await restoreCredsFromGitHub(clean);
    }
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir(clean));

    const socket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Chrome'),
        printQRInTerminal: false
    });

    sessions.set(clean, { socket, startedAt: Date.now() });

    let lastBackup = 0;
    let backupPending = false;
    const BACKUP_INTERVAL = 30000; // whole-folder backup is heavier than a single file, space it out more
    socket.ev.on('creds.update', async () => {
        await saveCreds();
        const now = Date.now();
        if (now - lastBackup < BACKUP_INTERVAL) {
            if (!backupPending) {
                backupPending = true;
                setTimeout(() => {
                    backupPending = false;
                    lastBackup = Date.now();
                    saveCredsToGitHub(clean);
                }, BACKUP_INTERVAL - (now - lastBackup));
            }
            return;
        }
        lastBackup = now;
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

    let connectedAnnounced = false;
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(`[connection] ${clean} connected.`);
            if (!connectedAnnounced) {
                connectedAnnounced = true;
                try {
                    const { jidNormalizedUser } = require('@whiskeysockets/baileys');
                    const settingsStore = require('./settings');
                    const { sendStyled, box } = require('./style');
                    const cfg = require('../config');
                    const selfJid = jidNormalizedUser(socket.user.id);
                    const settings = settingsStore.get(clean);
                    const botName = settings.botName || cfg.BOT_NAME;
                    const text = box('ᴄᴏɴɴᴇᴄᴛᴇᴅ', [
                        `✅ ${botName} ɪs ɴᴏᴡ ᴏɴʟɪɴᴇ`,
                        `📱 ɴᴜᴍʙᴇʀ: ${clean}`,
                        `🕒 ${new Date().toLocaleString()}`
                    ]) + `\n\n> ${botName}`;
                    await sendStyled(socket, selfJid, { text }, { botName, number: clean });
                } catch (e) {
                    console.error(`[connection] failed to send connected message for ${clean}:`, e.message);
                }
            }
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {
                console.log(`[connection] ${clean} logged out — clearing session.`);
                sessions.delete(clean);
                clearPresenceFor(clean);
                await deleteSessionFromGitHub(clean);
                return;
            }

            if (statusCode === DisconnectReason.connectionReplaced) {
                // Another socket took over — do NOT auto-reconnect here,
                // that just fights the other socket in an endless loop.
                console.log(`[connection] ${clean} replaced by another session — not reconnecting.`);
                sessions.delete(clean);
                clearPresenceFor(clean);
                return;
            }

            clearPresenceFor(clean);
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

const { jidNormalizedUser, downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../config');
const settingsStore = require('./settings');
const msgCache = require('./messageCache');
const { resolve: resolveCommand } = require('./commandRouter');

function extractText(message) {
    return message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption || '';
}

function extractViewOnce(message) {
    const wrap = message.viewOnceMessageV2?.message ||
        message.viewOnceMessageV2Extension?.message ||
        message.viewOnceMessage?.message;
    if (wrap) {
        if (wrap.imageMessage) return { type: 'image', media: wrap.imageMessage };
        if (wrap.videoMessage) return { type: 'video', media: wrap.videoMessage };
        if (wrap.audioMessage) return { type: 'audio', media: wrap.audioMessage };
    }
    if (message.imageMessage?.viewOnce) return { type: 'image', media: message.imageMessage };
    if (message.videoMessage?.viewOnce) return { type: 'video', media: message.videoMessage };
    if (message.audioMessage?.viewOnce) return { type: 'audio', media: message.audioMessage };
    return null;
}

function attachMessageHandler(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        const jid = msg.key.remoteJid;
        if (jid === 'status@broadcast') return;

        const settings = settingsStore.get(number);
        const selfJid = socket.user?.id ? jidNormalizedUser(socket.user.id) : null;

        // ---------- Anti-delete ----------
        const protocolMsg = msg.message.protocolMessage;
        if (protocolMsg?.type === 0 && protocolMsg.key) {
            if (settings.antiDelete !== 'off') {
                const cached = msgCache.get(number, jid, protocolMsg.key.id);
                if (cached) {
                    const deleterNum = (msg.key.participant || jid).split('@')[0];
                    const target = settings.antiDelete === 'inchat' ? jid : selfJid;
                    if (target) {
                        try {
                            await socket.sendMessage(target, {
                                text: `🗑️ *Message deleted*\n👤 by @${deleterNum}\n\n> ${settings.botName || config.BOT_NAME}`,
                                mentions: [`${deleterNum}@s.whatsapp.net`]
                            });
                            await socket.sendMessage(target, { forward: cached.msg });
                        } catch (e) { console.error('[antidelete] forward failed:', e.message); }
                    }
                }
            }
            msgCache.drop(number, jid, protocolMsg.key.id);
            return;
        }
        if (!msg.key.fromMe) msgCache.put(number, jid, msg.key.id, msg);

        // ---------- Anti-viewonce ----------
        if (settings.antiViewOnce !== 'off' && !msg.key.fromMe) {
            const vo = extractViewOnce(msg.message);
            if (vo) {
                try {
                    const buffer = await downloadMediaMessage({ key: msg.key, message: { [vo.type + 'Message']: vo.media } }, 'buffer', {});
                    const senderNum = (msg.key.participant || jid).split('@')[0];
                    const target = settings.antiViewOnce === 'inchat' ? jid : selfJid;
                    if (buffer && target) {
                        const caption = `👁️ *View-once revealed*\n👤 from @${senderNum}`;
                        if (vo.type === 'audio') {
                            await socket.sendMessage(target, { audio: buffer, mimetype: vo.media.mimetype || 'audio/ogg; codecs=opus' });
                        } else {
                            await socket.sendMessage(target, { [vo.type]: buffer, caption, mentions: [`${senderNum}@s.whatsapp.net`] });
                        }
                    }
                } catch (e) { console.error('[antiviewonce] failed:', e.message); }
            }
        }

        // ---------- Anti-link ----------
        if (settings.antiLink && jid.endsWith('@g.us') && !msg.key.fromMe) {
            const text = extractText(msg.message);
            if (/chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(text)) {
                try {
                    const meta = await socket.groupMetadata(jid);
                    const participant = msg.key.participant;
                    const isAdmin = meta.participants.find(p => p.id === participant)?.admin;
                    if (!isAdmin) {
                        await socket.sendMessage(jid, { delete: msg.key });
                        await socket.sendMessage(jid, { text: `⚠️ @${participant.split('@')[0]} links aren't allowed here.`, mentions: [participant] });
                    }
                } catch (e) { console.error('[antilink] failed:', e.message); }
            }
        }

        // ---------- Presence ----------
        const isGroup = jid.endsWith('@g.us');
        const presence = isGroup ? settings.gcPresence : settings.dmPresence;
        if (presence && presence !== 'offline') {
            socket.sendPresenceUpdate(presence, jid).catch(() => {});
        }

        // ---------- Command dispatch ----------
        const prefix = settings.prefix || config.PREFIX;
        const text = extractText(msg.message).trim();
        if (!text.startsWith(prefix)) return;

        const [cmdName, ...args] = text.slice(prefix.length).trim().split(/\s+/);
        const command = resolveCommand(cmdName.toLowerCase());
        if (!command) return;

        const senderJid = msg.key.participant || jid;
        const isOwner = selfJid && senderJid.split('@')[0] === selfJid.split('@')[0];

        const ctx = { socket, msg, jid, args, text, number, settings, isGroup, isOwner, senderJid, prefix };

        try {
            await command.execute(ctx);
        } catch (e) {
            console.error(`[command:${command.name}] error:`, e.message);
            await socket.sendMessage(jid, { text: `❌ Something went wrong running that command.` }).catch(() => {});
        }
    });
}

module.exports = { attachMessageHandler };

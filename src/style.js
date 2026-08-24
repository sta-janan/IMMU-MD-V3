const config = require('../config');

// A fake "quoted message" whose remoteJid is status@broadcast (renders as
// "WhatsApp • Status" in the reply header) quoting a fake vCard contact
// named "© <bot> VERIFIED ✅" (renders as "Contact: ... VERIFIED").
function verifiedCard(botName) {
    return {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            contactMessage: {
                displayName: `© ${botName} ᴠᴇʀɪғɪᴇᴅ ✅`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botName}\nORG:${botName};\nEND:VCARD`
            }
        }
    };
}

// Makes the message itself also appear as "Forwarded" from a Channel —
// combined with the quoted verifiedCard above, this matches IMMU-X's full
// look exactly.
function forwardedContext(botName) {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID || '120363341506278064@newsletter',
            newsletterName: botName,
            serverMessageId: -1
        }
    };
}

// Send any message content with both the verified quoted-card AND the
// forwarded-channel look applied — the full IMMU-X style.
async function sendStyled(socket, jid, content, options = {}) {
    const botName = options.botName || config.BOT_NAME;
    return socket.sendMessage(jid, {
        ...content,
        contextInfo: { ...forwardedContext(botName), ...(content.contextInfo || {}) }
    }, {
        quoted: verifiedCard(botName),
        ...(options.messageOptions || {})
    });
}

// Box-drawing card, used by menu/alive/info style commands.
function box(title, lines) {
    let out = `*╭─────「 ${title} 」─────⊷*\n`;
    for (const line of lines) out += `*┃* ${line}\n`;
    out += `*╰──────────────────⊷*`;
    return out;
}

module.exports = { verifiedCard, forwardedContext, sendStyled, box };

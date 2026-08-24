const config = require('../config');

// Makes a message appear as if forwarded from a verified WhatsApp Channel —
// gives it that "WhatsApp Business ✓ • Status" styled header.
function verifiedContext(name) {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363341506278064@newsletter',
            newsletterName: name || config.BOT_NAME,
            serverMessageId: -1
        }
    };
}

// Send any message content with the verified-channel styling applied.
async function sendStyled(socket, jid, content, options = {}) {
    const botName = options.botName || config.BOT_NAME;
    return socket.sendMessage(jid, {
        ...content,
        contextInfo: { ...verifiedContext(botName), ...(content.contextInfo || {}) }
    }, options.messageOptions || {});
}

// Box-drawing card, used by menu/alive/info style commands.
function box(title, lines) {
    let out = `*╭─────「 ${title} 」─────⊷*\n`;
    for (const line of lines) out += `*┃* ${line}\n`;
    out += `*╰──────────────────⊷*`;
    return out;
}

module.exports = { verifiedContext, sendStyled, box };

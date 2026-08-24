const config = require('../config');

// A fake "quoted message" whose remoteJid is status@broadcast (renders as
// "WhatsApp • Status" in the reply header) quoting a fake vCard contact
// named "© <bot> VERIFIED ✅" (renders as "Contact: ... VERIFIED"). This is
// what produces the verified-looking status/contact card on every reply.
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

// Send any message content quoting the fake verified-status card.
async function sendStyled(socket, jid, content, options = {}) {
    const botName = options.botName || config.BOT_NAME;
    return socket.sendMessage(jid, content, { quoted: verifiedCard(botName), ...(options.messageOptions || {}) });
}

// Box-drawing card, used by menu/alive/info style commands.
function box(title, lines) {
    let out = `*╭─────「 ${title} 」─────⊷*\n`;
    for (const line of lines) out += `*┃* ${line}\n`;
    out += `*╰──────────────────⊷*`;
    return out;
}

module.exports = { verifiedCard, sendStyled, box };

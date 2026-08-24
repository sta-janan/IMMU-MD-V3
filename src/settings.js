const fs = require('fs-extra');
const path = require('path');
const { sessionDir } = require('./sessionManager');

const cache = new Map();

const DEFAULTS = {
    prefix: null,
    botName: null,
    botPic: null,
    dmPresence: null,
    gcPresence: null,
    antiDelete: 'off',   // off | inchat | indm
    antiViewOnce: 'off', // off | inchat | indm
    antiLink: false,
    autoStatusView: true,
    welcome: null,
    goodbye: null
};

function settingsPath(number) {
    return path.join(sessionDir(number), 'settings.json');
}

function get(number) {
    if (cache.has(number)) return cache.get(number);
    let loaded = {};
    try {
        const p = settingsPath(number);
        if (fs.existsSync(p)) loaded = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) { /* fall back to defaults */ }
    const merged = { ...DEFAULTS, ...loaded };
    cache.set(number, merged);
    return merged;
}

function set(number, key, value) {
    const current = get(number);
    current[key] = value;
    cache.set(number, current);
    try {
        fs.ensureDirSync(sessionDir(number));
        fs.writeFileSync(settingsPath(number), JSON.stringify(current, null, 2));
    } catch (e) {
        console.error(`[settings] persist failed for ${number}:`, e.message);
    }
}

module.exports = { get, set };

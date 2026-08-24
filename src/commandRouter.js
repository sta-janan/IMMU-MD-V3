const fs = require('fs');
const path = require('path');

const registry = new Map(); // command name/alias -> command module
const allCommands = [];      // unique list for menu building

function loadCommandsFrom(dir) {
    const fullDir = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullDir)) return;
    for (const file of fs.readdirSync(fullDir)) {
        if (!file.endsWith('.js')) continue;
        const mod = require(path.join(fullDir, file));
        if (!mod?.name || typeof mod.execute !== 'function') {
            console.warn(`[commands] Skipping invalid command file: ${dir}/${file}`);
            continue;
        }
        registry.set(mod.name, mod);
        (mod.aliases || []).forEach(a => registry.set(a, mod));
        allCommands.push(mod);
    }
}

function loadAll() {
    ['commands/core', 'commands/downloads', 'commands/moderation', 'commands/settings', 'commands/group']
        .forEach(loadCommandsFrom);
    console.log(`[commands] Loaded ${allCommands.length} commands.`);
}

function resolve(name) {
    return registry.get(name.toLowerCase());
}

function listByCategory() {
    const map = {};
    for (const cmd of allCommands) {
        const cat = cmd.category || 'misc';
        if (!map[cat]) map[cat] = [];
        map[cat].push(cmd);
    }
    return map;
}

module.exports = { loadAll, resolve, listByCategory, allCommands };

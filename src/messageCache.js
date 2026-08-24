const store = new Map(); // number -> Map(`${jid}::${id}` -> {msg, ts})
const LIMIT = 300;

function put(number, jid, id, msg) {
    if (!store.has(number)) store.set(number, new Map());
    const bucket = store.get(number);
    bucket.set(`${jid}::${id}`, { msg, ts: Date.now() });
    if (bucket.size > LIMIT) bucket.delete(bucket.keys().next().value);
}

function get(number, jid, id) {
    return store.get(number)?.get(`${jid}::${id}`) || null;
}

function drop(number, jid, id) {
    store.get(number)?.delete(`${jid}::${id}`);
}

module.exports = { put, get, drop };

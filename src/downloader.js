const axios = require('axios');
const config = require('../config');

async function fetchMedia(url) {
    const { data } = await axios.post(`${config.IMMU_MD_API}/api/download`, { url, type: 'video' }, {
        timeout: 90000,
        headers: { 'Content-Type': 'application/json' }
    });
    if (!data?.success) throw new Error(data?.error || 'Could not fetch media');
    return data;
}

function fullUrl(u) {
    if (!u) return null;
    return u.startsWith('/') ? config.IMMU_MD_API + u : u;
}

module.exports = { fetchMedia, fullUrl };

module.exports = {
    BOT_NAME: 'IMMU MD V3',
    PREFIX: '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    GITHUB_OWNER: 'sta-janan',
    GITHUB_REPO: 'IMMU-MD-V3',
    SESSION_BASE_PATH: './session',
    DEFAULT_MENU_IMAGE: 'https://i.postimg.cc/50Zx7FbC/IMG-20260819-WA0015.jpg',
    IMMU_MD_API: (process.env.SMD_SITE_URL || 'https://immu-md-api.vercel.app').replace(/\/+$/, ''),
    MAX_RECONNECT_RETRIES: 3
};

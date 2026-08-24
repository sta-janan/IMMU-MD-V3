const fs = require('fs-extra');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const config = require('../config');

const octokit = new Octokit({ auth: config.GITHUB_TOKEN });
const { GITHUB_OWNER: owner, GITHUB_REPO: repo } = config;

function sessionDir(number) {
    return path.join(config.SESSION_BASE_PATH, number);
}

const backupInProgress = new Set(); // number -> prevents overlapping backups (was causing GitHub SHA conflicts)

async function saveSessionToGitHub(number) {
    if (backupInProgress.has(number)) return; // a backup is already running for this number, skip
    backupInProgress.add(number);
    try {
        const dir = sessionDir(number);
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            try {
                const filePath = path.join(dir, file);
                // Baileys actively deletes pre-key files once they're used —
                // the file can vanish between readdir() and readFile() here.
                // Skip that one file instead of aborting the whole backup.
                if (!fs.existsSync(filePath)) continue;
                const content = fs.readFileSync(filePath, 'utf8');
                const remotePath = `sessions/${number}/${file}`;

                let sha;
                try {
                    const { data } = await octokit.repos.getContent({ owner, repo, path: remotePath });
                    sha = data.sha;
                } catch (e) { /* file doesn't exist on GitHub yet */ }

                await octokit.repos.createOrUpdateFileContents({
                    owner, repo, path: remotePath,
                    message: `session backup: ${number}/${file}`,
                    content: Buffer.from(content).toString('base64'),
                    ...(sha ? { sha } : {})
                });
            } catch (fileErr) {
                console.error(`[session] backup skipped for ${number}/${file}:`, fileErr.message);
            }
        }
    } catch (e) {
        console.error(`[session] backup failed for ${number}:`, e.message);
    } finally {
        backupInProgress.delete(number);
    }
}

async function restoreSessionFromGitHub(number) {
    try {
        const remoteDir = `sessions/${number}`;
        const { data } = await octokit.repos.getContent({ owner, repo, path: remoteDir });
        if (!Array.isArray(data) || data.length === 0) return false;

        fs.ensureDirSync(sessionDir(number));
        for (const entry of data) {
            if (!entry.name.endsWith('.json')) continue;
            const { data: fileData } = await octokit.repos.getContent({ owner, repo, path: entry.path });
            const content = Buffer.from(fileData.content, 'base64').toString('utf8');
            fs.writeFileSync(path.join(sessionDir(number), entry.name), content);
        }
        return true;
    } catch (e) {
        return false;
    }
}

async function deleteSessionFromGitHub(number) {
    try {
        const remoteDir = `sessions/${number}`;
        const { data } = await octokit.repos.getContent({ owner, repo, path: remoteDir });
        if (!Array.isArray(data)) return;
        for (const entry of data) {
            await octokit.repos.deleteFile({
                owner, repo, path: entry.path,
                message: `remove session file: ${entry.path}`, sha: entry.sha
            });
        }
    } catch (e) { /* already gone */ }
}

async function getRegisteredNumbers() {
    try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: 'sessions' });
        return data.filter(f => f.type === 'dir').map(f => f.name);
    } catch (e) {
        return [];
    }
}

module.exports = {
    sessionDir,
    saveCredsToGitHub: saveSessionToGitHub,
    restoreCredsFromGitHub: restoreSessionFromGitHub,
    deleteSessionFromGitHub,
    getRegisteredNumbers
};

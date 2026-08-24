const fs = require('fs-extra');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const config = require('../config');

const octokit = new Octokit({ auth: config.GITHUB_TOKEN });
const { GITHUB_OWNER: owner, GITHUB_REPO: repo } = config;

function sessionDir(number) {
    return path.join(config.SESSION_BASE_PATH, number);
}

async function saveCredsToGitHub(number) {
    try {
        const credsPath = path.join(sessionDir(number), 'creds.json');
        if (!fs.existsSync(credsPath)) return;
        const content = fs.readFileSync(credsPath, 'utf8');
        const remotePath = `sessions/${number}.json`;

        let sha;
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path: remotePath });
            sha = data.sha;
        } catch (e) { /* file doesn't exist yet */ }

        await octokit.repos.createOrUpdateFileContents({
            owner, repo, path: remotePath,
            message: `session backup: ${number}`,
            content: Buffer.from(content).toString('base64'),
            ...(sha ? { sha } : {})
        });
    } catch (e) {
        console.error(`[session] backup failed for ${number}:`, e.message);
    }
}

async function restoreCredsFromGitHub(number) {
    try {
        const remotePath = `sessions/${number}.json`;
        const { data } = await octokit.repos.getContent({ owner, repo, path: remotePath });
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        fs.ensureDirSync(sessionDir(number));
        fs.writeFileSync(path.join(sessionDir(number), 'creds.json'), content);
        return true;
    } catch (e) {
        return false;
    }
}

async function deleteSessionFromGitHub(number) {
    try {
        const remotePath = `sessions/${number}.json`;
        const { data } = await octokit.repos.getContent({ owner, repo, path: remotePath });
        await octokit.repos.deleteFile({
            owner, repo, path: remotePath,
            message: `remove session: ${number}`, sha: data.sha
        });
    } catch (e) { /* already gone */ }
}

async function getRegisteredNumbers() {
    try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: 'sessions' });
        return data.filter(f => f.name.endsWith('.json')).map(f => f.name.replace('.json', ''));
    } catch (e) {
        return [];
    }
}

module.exports = { sessionDir, saveCredsToGitHub, restoreCredsFromGitHub, deleteSessionFromGitHub, getRegisteredNumbers };

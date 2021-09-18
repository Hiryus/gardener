const cp = require('child_process');

module.exports = {
    add(...files) {
        if (files.length === 0) {
            throw new Error('You must add at least one file.');
        }
        cp.execSync(`git add ${files.join(' ')}`);
    },

    config(username, email) {
        cp.execSync(`git config user.name "${username}"`);
        cp.execSync(`git config user.email "${email}"`);
    },

    commit(message) {
        cp.execSync(`git commit --message "${message}"`);
    },

    getCommitHash(rev) {
        return cp.execSync(`git rev-parse ${rev}`, { encoding: 'utf8' }).trim();
    },
};

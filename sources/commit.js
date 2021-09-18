const cp = require('child_process');
const fs = require('fs');
const _ = require('lodash');

const git = require('./git');

module.exports = function commit(params) {
    const state = {
        previous: JSON.parse(cp.execSync('git show HEAD:package.json', { encoding: 'utf8' })),
        current: JSON.parse(fs.readFileSync('package.json', 'utf8')),
    };

    const prodDepChanged = !_.isEqual(state.previous.dependencies, state.current.dependencies);
    const devDepChanged = !_.isEqual(state.previous.devDependencies, state.current.devDependencies);

    if (prodDepChanged || devDepChanged) {
        console.log('Dependencies update detected, committing changes...');

        const message = prodDepChanged ? params.commit.message.prod : params.commit.message.dev;

        git.add('package.json', 'package-lock.json');
        git.config(params.commit.username, params.commit.email);
        git.commit(message);

        const hash = git.getCommitHash('HEAD');

        console.log(`  Hash: "${hash}"`);
        console.log(`  Message: "${message}"`);
        console.log(`  Author: "${params.commit.username} <${params.commit.email}>"`);
    } else {
        console.log('No package update available - commit skipped.');
    }
};

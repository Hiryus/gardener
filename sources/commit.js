const cp = require('child_process');

module.exports = function commit(params) {
    const stdout = cp.execSync('git status package.json --porcelain=v2', { encoding: 'utf8' });
    if (stdout.trim().length === 0) {
        console.log('No package update available - commit skipped.');
        return;
    }

    console.log('Dependencies update detected, committing packages changes...');

    cp.execSync('git add package.json package-lock.json');
    cp.execSync(`git config user.name "${params.username}"`);
    cp.execSync(`git config user.email "${params.email}"`);
    cp.execSync(`git commit --message "${params.message}"`);

    const hash = cp.execSync('git log --format="%H" -n 1', { encoding: 'utf8' });

    console.log(`  Hash: "${hash.trim()}"`);
    console.log(`  Message: "${params.message}"`);
    console.log(`  Author: "${params.username} <${params.email}>"`);
};

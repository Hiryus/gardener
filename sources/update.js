const cp = require('child_process');
const fs = require('fs');

function isIgnored(item, params) {
    const ignoredPackage = params.ignorePackages.some((pattern) => {
        const expr = new RegExp(pattern, 'i');
        return expr.test(item.name);
    });
    const ignoredVersion = params.ignoreVersions.some((pattern) => {
        const expr = new RegExp(pattern, 'i');
        return expr.test(item.latest);
    });
    return ignoredPackage || ignoredVersion;
}

module.exports = function update(params) {
    // Read package.json
    const packages = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Read each package status using `npm outdated` CLI
    // NB: returned status is purposely ignored since the command returns an error status
    const { stdout } = cp.spawnSync('npm outdated --json --long', { encoding: 'utf8', shell: true });

    // Filter and format results as an array of "flat" objects:
    // outdated = [{ type, current, latest, name }, ...]
    const outdated = Object.entries(JSON.parse(stdout))
        .map(([name, status]) => ({ name, ...status }))
        .filter((item) => !isIgnored(item, params));

    // If there is no update, exit immediatly
    if (outdated.length === 0) {
        console.log('All dependencies are up to date.');
        return;
    }

    // For each dependency, update packages list
    outdated.forEach(({ type, current, latest, name }) => {
        if (current !== latest) {
            console.log(`Bumping ${name} version from ${current} to ${latest}`);
            packages[type][name] = latest;
        }
    });

    // Save changes in packages.json
    fs.writeFileSync('package.json', JSON.stringify(packages, null, 2), 'utf8');

    // Install packages using `npm install` CLI;
    // NB: returned status is purposely ignored since the command can return an error status, even
    // in case of success; instead, the output is parsed to find any error
    const { output } = cp.spawnSync('npm install', { encoding: 'utf8', shell: true });
    if (output && output.includes('npm ERR')) {
        throw new Error(`The command "npm install" failed !\n${output}`);
    }
};

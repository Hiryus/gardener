#!/usr/bin/env node

const commit = require('./commit');
const params = require('./defaults');
const { HumanReadableError } = require('./errors');
const update = require('./update');

function parseValue(arg) {
    if (!arg.includes('=')) {
        throw new HumanReadableError(`Invalid argument syntax for "${arg}": value expected (ex: "${arg}=azerty"`);
    }
    return arg.split('=')[1];
}

function main() {
    let command = null;

    process.argv.slice(2).forEach((arg) => {
        if (arg === 'update') {
            command = update;
        } else if (arg === 'commit') {
            command = commit;
        } else if (arg.startsWith('--ignore-version')) {
            params.ignore.versions.push(parseValue(arg));
        } else if (arg.startsWith('--ignore-package')) {
            params.ignore.packages.push(parseValue(arg));
        } else if (arg.startsWith('--message')) {
            console.warn('--message option is deprecated. Please use --prod-message instead.');
            params.commit.message.prod = parseValue(arg);
        } else if (arg.startsWith('--prod-message')) {
            params.commit.message.prod = parseValue(arg);
        } else if (arg.startsWith('--dev-message')) {
            params.commit.message.dev = parseValue(arg);
        } else if (arg.startsWith('--username')) {
            params.commit.username = parseValue(arg);
        } else if (arg.startsWith('--email')) {
            params.commit.email = parseValue(arg);
        } else {
            throw new HumanReadableError(`Unknown argument "${arg}".`);
        }
    });

    if (command == null) {
        throw new HumanReadableError('You need to specify a command (update or commit)');
    }

    command(params);
}

try {
    main();
} catch (err) {
    if (err instanceof HumanReadableError) {
        console.error(err.message);
    } else {
        console.error(err);
    }
    process.exit(1);
}

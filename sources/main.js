const commit = require('./commit');
const { HumanReadableError } = require('./errors');
const update = require('./update');

const params = {
    ignoreVersions: [],
    ignorePackages: [],

    message: 'chore(deps): dependencies update [skip ci]',
    username: 'gardener-bot',
    email: '',
};

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
            params.ignoreVersions.push(parseValue(arg));
        } else if (arg.startsWith('--ignore-package')) {
            params.ignorePackages.push(parseValue(arg));
        } else if (arg.startsWith('--message')) {
            params.message = parseValue(arg);
        } else if (arg.startsWith('--username')) {
            params.username = parseValue(arg);
        } else if (arg.startsWith('--email')) {
            params.email = parseValue(arg);
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

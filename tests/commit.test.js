const cp = require('child_process');
const fs = require('fs');

const commit = require('../sources/commit');
const defaults = require('../sources/defaults');
const git = require('../sources/git');

const spy = {
    console: {
        log: jest.spyOn(console, 'log')
            .mockImplementation()
            .mockName('console.log'),
    },
    cp: {
        execSync: jest.spyOn(cp, 'execSync')
            .mockImplementation()
            .mockName('cp.execSync'),
    },
    fs: {
        readFileSync: jest.spyOn(fs, 'readFileSync')
            .mockImplementation()
            .mockName('fs.readFileSync'),
    },
    git: {
        add: jest.spyOn(git, 'add')
            .mockImplementation()
            .mockName('git.add'),
        config: jest.spyOn(git, 'config')
            .mockImplementation()
            .mockName('git.config'),
        commit: jest.spyOn(git, 'commit')
            .mockImplementation()
            .mockName('git.commit'),
        getCommitHash: jest.spyOn(git, 'getCommitHash')
            .mockImplementation()
            .mockName('git.getCommitHash'),
    },
};

const DEFAULT_PACKAGE_JSON = {
    dependencies: {
        lodash: '5.0.1',
        foobar: '0.0.1',
    },
    devDependencies: {
        'semantic-release': '17.4.2',
        '@semantic-release/git': '9.0.0',
        eslint: '7.23.0',
    },
};

describe('update', () => {
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.restoreAllMocks());

    it('should do nothing except printing a message if no dependency changed', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));

        commit(defaults);

        const [message] = spy.console.log.mock.calls[0];
        expect(message).toMatch('commit skipped');
        expect(spy.git.add).not.toHaveBeenCalled();
        expect(spy.git.config).not.toHaveBeenCalled();
        expect(spy.git.commit).not.toHaveBeenCalled();
    });

    it('should commit package.json and package-lock.json if any dependency changed', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify({}));

        commit(defaults);

        expect(spy.git.add.mock.calls[0]).toEqual(['package.json', 'package-lock.json']);

        expect(spy.git.add).toBeCalledTimes(1);
        expect(spy.git.config).toBeCalledTimes(1);
        expect(spy.git.commit).toBeCalledTimes(1);
    });

    it('should set the given committer before commiting', async () => {
        // NB: this test does not actually check if the cofniguraiton was done _BEFORE_ the commit

        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify({}));

        commit({
            commit: {
                ...defaults.commit,
                username: 'foo',
                email: 'bar@baz.com',
            },
        });

        expect(spy.git.config.mock.calls[0]).toEqual(['foo', 'bar@baz.com']);
    });

    it('should commit a specific message if production dependencies were updated', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify({
            dependencies: {
                lodash: '5.0.1',
            },
            devDependencies: {
                foobar: '0.0.1',
            },
        }));
        spy.cp.execSync.mockReturnValue(JSON.stringify({
            dependencies: {
                lodash: '5.0.2',
            },
            devDependencies: {
                foobar: '1.0.1',
            },
        }));

        commit(defaults);

        expect(spy.git.commit.mock.calls[0]).toEqual([defaults.commit.message.prod]);
    });

    it('should commit a specific message if only development dependencies were updated', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify({
            dependencies: {
                lodash: '5.0.1',
            },
            devDependencies: {
                foobar: '0.0.1',
            },
        }));
        spy.cp.execSync.mockReturnValue(JSON.stringify({
            dependencies: {
                lodash: '5.0.1',
            },
            devDependencies: {
                foobar: '1.0.0',
            },
        }));

        commit(defaults);

        expect(spy.git.commit.mock.calls[0]).toEqual([defaults.commit.message.dev]);
    });
});

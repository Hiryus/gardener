const cp = require('child_process');
const fs = require('fs');
const update = require('../sources/update');

const spy = {
    console: {
        log: jest.spyOn(console, 'log')
            .mockImplementation()
            .mockName('console.log'),
        error: jest.spyOn(console, 'error')
            .mockImplementation()
            .mockName('console.error'),
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
        writeFileSync: jest.spyOn(fs, 'writeFileSync')
            .mockImplementation()
            .mockName('fs.writeFileSync'),
    },
};

const DEFAULT_PACKAGE_JSON = {
    name: 'test-package',
    version: '1.0.0',
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

const DEFAULT_NPM_OUTDATED = {
    foobar: {
        current: '0.0.1',
        wanted: '0.0.1',
        latest: '0.21.1-rc',
        type: 'dependencies',
    },
    eslint: {
        current: '7.23.0',
        wanted: '7.23.0',
        latest: '7.25.8',
        type: 'devDependencies',
    },
    'semantic-release': {
        current: '17.4.2',
        wanted: '17.4.2',
        latest: '17.4.2-alpha',
        type: 'devDependencies',
    },
};

describe('update', () => {
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.restoreAllMocks());

    it('should bump dependencies versions', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_NPM_OUTDATED));

        update({
            ignoreVersions: [],
            ignorePackages: [],
        });

        const [filnename, contents] = spy.fs.writeFileSync.mock.calls[0];
        const { dependencies, devDependencies } = JSON.parse(contents);

        expect(filnename).toEqual('package.json');
        expect(spy.fs.writeFileSync).toBeCalledTimes(1);

        expect(dependencies).toEqual({
            lodash: '5.0.1',
            foobar: '0.21.1-rc',
        });
        expect(devDependencies).toEqual({
            'semantic-release': '17.4.2-alpha',
            '@semantic-release/git': '9.0.0',
            eslint: '7.25.8',
        });
    });

    it('should only change package.json dependencies and leave other keys unchanged', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_NPM_OUTDATED));

        update({
            ignoreVersions: [],
            ignorePackages: [],
        });

        const { name, version } = JSON.parse(spy.fs.writeFileSync.mock.calls[0][1]);
        expect(name).toEqual(DEFAULT_PACKAGE_JSON.name);
        expect(version).toEqual(DEFAULT_PACKAGE_JSON.version);
    });

    it('should do nothing if there is no new update', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue('{}');

        update({
            ignoreVersions: [],
            ignorePackages: [],
        });

        expect(spy.fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should ignrore versions matching --ignore-version', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_NPM_OUTDATED));

        update({
            ignoreVersions: ['-rc', '^.*beta.*$', '-alpha$'],
            ignorePackages: [],
        });

        const contents = spy.fs.writeFileSync.mock.calls[0][1];
        const { dependencies, devDependencies } = JSON.parse(contents);

        expect(dependencies).toEqual({
            lodash: '5.0.1',
            foobar: '0.0.1',
        });
        expect(devDependencies).toEqual({
            'semantic-release': '17.4.2',
            '@semantic-release/git': '9.0.0',
            eslint: '7.25.8',
        });
    });

    it('should ignrore packages matching --ignore-package', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_NPM_OUTDATED));

        update({
            ignoreVersions: [],
            ignorePackages: ['lodash', '.*foo.*'],
        });

        const contents = spy.fs.writeFileSync.mock.calls[0][1];
        const { dependencies, devDependencies } = JSON.parse(contents);

        expect(dependencies).toEqual({
            lodash: '5.0.1',
            foobar: '0.0.1',
        });
        expect(devDependencies).toEqual({
            'semantic-release': '17.4.2-alpha',
            '@semantic-release/git': '9.0.0',
            eslint: '7.25.8',
        });
    });

    it('should do nothing if all updates are ignored', async () => {
        spy.fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_PACKAGE_JSON));
        spy.cp.execSync.mockReturnValue(JSON.stringify(DEFAULT_NPM_OUTDATED));

        update({
            ignoreVersions: ['.*'],
            ignorePackages: [],
        });

        expect(spy.fs.writeFileSync).not.toHaveBeenCalled();
    });
});

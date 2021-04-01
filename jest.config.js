// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // Automatically clear mock calls and instances between every test
    // Reminder: tests should be independent from each other
    clearMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/tests',
    ],

    // Make calling deprecated APIs throw helpful error messages
    errorOnDeprecated: true,

    // A list of paths to modules that run some code to configure or set up the testing
    // framework before each test
    setupFilesAfterEnv: [],

    // The test environment that will be used for testing
    testEnvironment: 'node',
};

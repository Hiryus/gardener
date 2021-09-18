module.exports = {
    ignore: {
        versions: [],
        packages: [],
    },
    commit: {
        message: {
            prod: 'build(prod): production dependencies update [skip ci]',
            dev: 'build(dev): development dependencies update [skip ci]',
        },
        username: 'gardener-bot',
        email: '<>',
    },
};

module.exports = {
    cookieSecret: 'your cookie secret goes here',
    mongo: {
        development: {
            connectionString: 'mongodb://127.0.0.1:27017',
        },
        production: {
            connectionString: 'mongodb://127.0.0.1:27017'
        },
    },
};

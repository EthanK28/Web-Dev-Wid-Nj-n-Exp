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

    authProviders: {
        facebook: {
            development: {
                appId: '1665795600322548',
                appSecret: 'cab94c8559f6a0a3fa98951ac5f5a2ad',
            },
        },
    },
};

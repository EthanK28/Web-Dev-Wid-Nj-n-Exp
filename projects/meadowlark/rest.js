// requires connect and connect-rest middleware
var connect = require('connect')
    http = require('http'),
bodyParser = require('body-parser');

var rest = require('connect-rest');

// sets up connect and adds other middlewares to parse query, parameters, content and session
// use the ones you need
var connectApp = connect()
    .use( bodyParser.urlencoded( { extended: true } ) )
    .use( bodyParser.json() );

// initial configuration of connect-rest. all-of-them are optional.
// default context is /api, all services are off by default
var options = {
    context: '/api',
    logger:{ file: 'mochaTest.log', level: 'debug' },
    apiKeys: [ '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9' ],
    discoverPath: 'discover',
    protoPath: 'proto'
};

// var rest = Rest.create( options );

// adds connect-rest middleware to connect
connectApp.use( rest.register( options ) );

rest.get('/', function(req, res) {
    res.send('Book');
});

// defines a few sample rest services
rest.get('/books/:title/:chapter', function(req, res) {
    res.send('Book');
});

http.createServer(connectApp).listen(3000)

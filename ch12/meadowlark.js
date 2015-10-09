var http = require('http');

var express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000 );

app.use(function(req,res,next){
    var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker %d received request',
        cluster.worker.id);
});

// Logger
switch (app.get('env')) {
    case 'development':
        // compact, colorful dev logging;
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'expres-logger' supports daily log rotation
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;

}

app.get('/fail', function (req, res) {
    throw new Error('Nope!');
});

app.get('/epic-fail', function (req, res) {
    process.nextTick(function() {
        throw new Error('Kaboom!');
    });
});

app.use(function (err, req, res, next) {
    console.log(err.stack);
     app.status(500).render('500');
});

// Error Handling using domain
app.use(function (rqe, res, next) {
    // create a domain for this request
    var domain = require('domain').create();

    // handle errors on this domain
    domain.on('error', function (err) {
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 5 seconds
            setTimeout(function () {
                console.error('Failsafe sutdown.');
                process.exit(1);
            }, 5000);

            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch (err) {
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed \n', err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch (err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }

    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);
    // execute teh rest of the request chain in the domain
    domain.run(next);
});




//app.get('port')
function startServer() {
    http.createServer(app).listen('3000', function() {
        console.log('Express started in '+ app.get('env') +
            'mode on http://localhost:'+ app.get('port') +
            ': press Ctrl-C to terminate' );
    });
}

if (require.main === module) {
    // application run rirectly, start app server
    startServer();
} else {
    // application imported as a module via "require:" export function]
    module.exports = startServer;
}

var express = require('express');

var fortune = require('./lib/fortune.js');

var app = express();

var credentials = require('./credentials.js');

var mongoose = require('mongoose');

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(require('express-session')());

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Mongodb

var opts = {
    server: {
       socketOptions: { keepAlive: 1 }
    }
};

switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}


app.use(session({
    secret: credentials.cookieSecret,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(express.static(__dirname+'/public'));

app.use(require('body-parser')());


// var credentials = require('credentials.js');

// app.use(require('cookie-parser')(credentials.cookieSecret));

// Set up handlebars view engine
var handlebars = require('express-handlebars')
                    .create({
                      defaultLayout: 'main',
                      helpers: {
                          section: function(name, options) {
                            if(!this._sections) this._sections = {};
                            this._sections[name] = options.fn(this);
                            return null;
                          }
                        }
                     });


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000 );

app.use(function(req, res, next) {
    // if there's a flash message, transfer
    // it to the context, then clear it
    if(req.session.flash){
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }

    next();
});

app.use(function(req, res, next){
        res.locals.showTests = app.get('env') !== 'production' &&
                  req.query.test === '1';

        // console.log("showTests 값: ", res.locals.showTests);

        next();
});

// Jquery File Upload
var jqupload = require('jquery-file-upload-middleware');

app.use('/upload', function(req, res, next){ var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function(){
            return '/uploads/' + now; },
        })(req, res, next);
});

// app.use(function (req, res, next) {
//     console.log('processing request for "'+req.url+ '"....');
//     next();
// });
//
//
// app.use(function (req, res, next) {
//     console.log('terminating request');
//     res.send('thanks for playing!');
//     next();
//     // note that we do NOT call next() here... this terminates the reqeust
// });
//
// app.use(function (req, res, next) {
//     console.log('whoops, i\'ll never get called');
// });

// Error Handling using domain
// app.use(function (req, res, next) {
//     // create a domain for this request
//     var domain = require('domain').create();
//
//     // handle errors on this domain
//     domain.on('error', function (err) {
//         console.error('DOMAIN ERROR CAUGHT\n', err.stack);
//         try {
//             // failsafe shutdown in 5 5 seconds
//             setTimeout(function () {
//                 console.error('Failsafe sutdown.');
//                 process.exit(1);
//             }, 5000);
//
//             var worker = require('cluster').worker;
//             if(worker) worker.disconnect();
//
//             // stop taking new requests
//             server.close();
//
//             try {
//                 // attempt to use Express error route
//                 next(err);
//             } catch (err) {
//                 // if Express error route failed, try
//                 // plain Node response
//                 console.error('Express error mechanism failed \n', err.stack);
//                 res.statusCode = 500;
//                 res.setHeader('content-type', 'text/plain');
//                 res.end('Server error.');
//             }
//         } catch (err) {
//             console.error('Unable to send 500 response.\n', err.stack);
//         }
//
//     });
//
//     // add the request and response objects to the domain
//     domain.add(req);
//     domain.add(res);
//     // execute teh rest of the request chain in the domain
//     domain.run(next);
// });

app.get('/fail', function (req, res) {
    throw new Error('Nope!');
});

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).render('500');

});

app.get('/epic-fail', function (req, res) {
    process.nextTick(function() {
        throw new Error('Kaboom!');
    });
});

// app.use(function(req, res, next) {
//     console.log('\n\nALLWAYS');
//     next();
// });
//
// app.get('/a', function (req, res) {
//     console.log('/a: route terminated');
//     res.send('a');
// });
//
// app.get('/a', function (req, res) {
//     console.log('/a: never called');
// });
//
// app.get('/b', function (req, res, next) {
//     console.log('b: route not terminated');
//     next();
// });
//
// app.get(function (req, res, next) {
//     console.log('SOMETIMES');
//     next();
// });
//
// app.get('/b', function (req, res, next) {
//     console.log('/b (part 2): error thrown');
//     throw new Error('b failed');
// });
//
// app.use('/b', function (err, req, res, next) {
//     console.log('/b error detected and passed on');
//     next(err);
// });
//
// app.get('/c', function (err, req) {
//     console.log('/c: error thrown');
//     throw new Error('c failed')
// });
//
// app.use('/c', function (err, req, res, next) {
//     console.log('/c: error decteced but not passed on');
//     next();
// });
//
// app.use(function (err, req, res, next) {
//     console.log('unhandled error dected: ' + err.message);
//     res.send('500 - server error');
// });
//
// app.use(function(req, res) {
//     console.log('route not handled');
//     res.send('404 - not found');
// });

// app.listen(3000, function() {
//     console.log('listening on 3000');
// });






// Seeding for Vacation
// Vacation.find(function (err, vacations) {
//     if(vacations.length) return;
//    new Vacation({
//        name: 'Hood River Day Trip',
//        slug: 'hood-river-day-trip',
//        category: 'Day Trip',
//        sku: 'HR199',
//        description: 'Spend a day sailing on the Columbia and ' +
//            'enjoying craft beers in Hood River!',
//        priceInCents: 9995,
//        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
//        inSeason: true,
//        maximumGuests: 16,
//        available: true,
//        packagesSold: 0,
//    }).save();
//    new Vacation({
//        name: 'Oregon Coast Getaway',
//        slug: 'oregon-coast-getaway',
//        category: 'Weekend Getaway',
//        sku: 'OC39',
//        description: 'Enjoy the ocean air and quaint coastal towns!',
//        priceInCents: 269995,
//        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
//        inSeason: false,
//        maximumGuests: 8,
//        available: true,
//        packagesSold: 0,
//    }).save();
//
//    new Vacation({
//        name: 'Rock Climbing in Bend',
//        slug: 'rock-climbing-in-bend',
//        category: 'Adventure',
//        sku: 'B99',
//        description: 'Experience the thrill of climbing in the high desert.',
//        priceInCents: 289995,
//        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
//        inSeason: true,
//        requiresWaiver: true,
//        maximumGuests: 4,
//        available: false,
//        packagesSold: 0,
//        notes: 'The tour guide is currently recovering from a skiing accident.',
//    }).save();
// });

var Vacation = require('./models/vacation.js');

var VacationInSeasonListener = require('./models/VacationInSeasonListener.js');

app.get('/notify-me-when-in-season', function(req, res) {
    res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', function(req, res) {
    VacationInSeasonListener.update(
        { email: req.body.email},
        { $push: { skus: req.body.sku }},
        { upsert: true },
        function(err) {
            if(err) {
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when this vacation is in season.',
            };
            return res.redirect(303, '/vacations');
        }
    );
});

app.get('/set-currency/:currency', function(req, res) {
    req.session.currency = req.params.currency;
    console.log('set-currency called');
    return res.redirect(303, '/vacations');
});

function convertFromUSD(value, currency) {
    switch (currency) {
        case 'USD': return value * 1;
        case 'GBP': return value * 0.6;
        case 'BTC': return value * 0.0023707918444761;
        default: return NaN;
    }
}

app.get('/vacations', function(req, res) {
    Vacation.find({ available: true }, function(err, vacations) {
        var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function(vacation) {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    inSeason: vacation.inSeason,
                    price: convertFromUSD(vacation.priceInCents/100, currency),
                    qty: vacation.qty,

                }
            })
        };
        switch (currency) {
            case 'USD': context.currencyUSD = 'selected'; break;
            case 'GBP': context.currencyGBP = 'selected'; break;
            case 'BTC': context.currencyBTC = 'selected'; break;
        }
        res.render('vacations', context);
    });
});

app.get('/', function(req, res) {
  res.render('home');
  // res.type('text/plain');
  // res.send('meadowlark Travel');
});

app.get('/about', function(req, res){

  res.render('about', {
          fortune : fortune.getFortune() ,
          pageTestScript: '/qa/tests-about.js'
      });
  // res.type('text/plain');
  // res.send('About Meadowlark Travel')
});



app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/newletter', function (req, res) {
    var name = req.body.name || '', email = req.body.email || '';
    if(!email.match(VALID_EMAIL_REGEX)) {
    if(req.xhr) return res.json({ error: 'Invalid name email address.' });
    req.session.flash = {
        type: 'danger',
        intro: 'Validation error!',
        message: 'The email address you entered was  not valid.',
    };
    return res.redirect(303, '/newsletter/archive');
    }
    new NewsletterSignup({ name: name, email: email }).save(function(err){
    if(err) {
        if(req.xhr) return res.json({ error: 'Database error.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Database error!',
            message: 'There was a database error; please try again later.',
        };
        return res.redirect(303, '/newsletter/archive');
    }
    if(req.xhr) return res.json({ success: true });
    req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You have now been signed up for the newsletter.',
    };
    return res.redirect(303, '/newsletter/archive');
    });
});



app.get('/thank-you', function(req, res) {
    res.render('thank-you');
});

app.get('/newsletterajax', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletterajax', { csrf: 'CSRF token goes here' });
});


app.post('/process', function(req, res){
  console.log('Form (from querystring): ' + req.query.form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  res.redirect(303, '/thank-you');
});

app.post('/process2', function(req, res){
if(req.xhr || req.accepts('json,html')==='json'){
        // if there were an error, we would send { error: 'error description' }
res.send({ success: true }); } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});


app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});

app.get('/headers', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
      res.send(s);
});

app.get('/error', function(req, res){ res.status(500);
        res.render('error');
});

app.get('/greeting', function(req, res){ res.render('about', {
                message: 'welcome',
                style: req.query.style,
                userid: req.cookie.userid,
                username: req.session.username,
              });
});

var formidable = require('formidable');
app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields: ');
        console.log(fields);
        console.log('received fiels: ');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});


var tours = [
  { id: 0, name: 'Hood River', price: 99.99 },
  { id: 1, name: 'Oregon Coast', price: 149.95 },
];


// var http = require('http');
//
// function startServer() {
//     http.createServer(app).listen('3000', function() {
//         console.log('Express started in '+ app.get('env') +
//             'mode on http://localhost:'+ app.get('port') +
//             ': press Ctrl-C to terminate' );
//     });
// }
//
// if (require.main === module) {
//     // application run rirectly, start app server
//     startServer();
// } else {
//     // application imported as a module via "require:" export function]
//     module.exports = startServer;
// }

app.listen(app.get('port'), function() {
  console.log( 'Express started on htpp"//localhost:', app.get('port') + '; press Ctrl-C to terminate.' );
});



// custom 404 page
app.use(function (req, res) {

      // res.type('text/plain');
      res.status(404);
      res.render('404');
      // res.end('404 - Not Found');
});

// custom 500 page
app.use(function (err, req, res, next) {
    // console.log('text/plain');
    console.log(err.stack);
    res.status(500);
    res.render('500');
    // res.end('500 - Server Error');
});

// Ch10 MiddleWare




if( app.thing === null ) console.log( 'bleat!' );

var express = require('express');

var fortune = require('./lib/fortune.js');

var app = express();

var credentials = require('./credentials.js');

var mongoose = require('mongoose');

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(require('express-session')());

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var rest = require('connect-rest');



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

app.use('/api', require('cors')());

var Attraction = require('./models/attraction.js');

app.get('/api/attractions', function(req, res) {
    Attraction.find({ approved: true }, function(err, attractions) {
        if(err) return res.send(500, 'Error occurred: database error.');
        res.json(attractions.map(function(a) {
            return {
                name: a.name,
                id: a._id,
                description: a.description,
                location: a.location
            };
        }));
    });
});

app.post('/api/attraction', function(req, res) {
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        //      location: { lat: req.body.lat, lng: req.body.lng },
        history: {
              event: 'created',
              email: req.body.email,
              date: new Date(),
          },
          approved: false,
    });
    a.save(function(err, a) {
        if(err) return res.send(500, 'Error occurred: database error.');
        res.json({ id: a._id });
    });
});

app.get('/api/attraction/:id', function(req, res) {
    Attraction.findById(req.params.id, function(err, a) {
        if(err) return res.send(500, 'Error occured: database error.');
        res.json({
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location
        });
    });
});

// route 파일
require('./routes.js')(app);

// define API routes with rest.VERB...

// API configuration
var apiOptions = {
    context:'/api',
    domain: require('domain').create(),
};

// link API into pipe lline
app.use(rest.rester(apiOptions));

// custom 404 page handler
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

app.listen(app.get('port'), function() {
  console.log( 'Express started on htpp"//localhost:', app.get('port') + '; press Ctrl-C to terminate.' );
});




if( app.thing === null ) console.log( 'bleat!' );

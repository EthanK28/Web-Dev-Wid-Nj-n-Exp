var express = require('express');

var fortune = require('./lib/fortune.js');

var app = express();

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


app.use(function(req, res, next) {
    // if there's a flash message, transfer
    // it to the context, then clear it
    // res.locals.flash = req.session.flash;
    // delete req.session.flash;

    next();
});

app.use(function(req, res, next){
        res.locals.showTests = app.get('env') !== 'production' &&
                  req.query.test === '1';

        // console.log("showTests 값: ", res.locals.showTests);

        next();
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

app.use(function(req, res, next) {
    console.log('\n\nALLWAYS');
    next();
});

app.get('/a', function (req, res) {
    console.log('/a: route terminated');
    res.send('a');
});

app.get('/a', function (req, res) {
    console.log('/a: never called');
});

app.get('/b', function (req, res, next) {
    console.log('b: route not terminated');
    next();
});

app.get(function (req, res, next) {
    console.log('SOMETIMES');
    next();
});

app.get('/b', function (req, res, next) {
    console.log('/b (part 2): error thrown');
    throw new Error('b failed');
});

app.use('/b', function (err, req, res, next) {
    console.log('/b error detected and passed on');
    next(err);
});

app.get('/c', function (err, req) {
    console.log('/c: error thrown');
    throw new Error('c failed')
});

app.use('/c', function (err, req, res, next) {
    console.log('/c: error decteced but not passed on');
    next();
});

app.use(function (err, req, res, next) {
    console.log('unhandled error dected: ' + err.message);
    res.send('500 - server error');
});

app.use(function(req, res) {
    console.log('route not handled');
    res.send('404 - not found');
});

// app.listen(3000, function() {
//     console.log('listening on 3000');
// });

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
        }
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

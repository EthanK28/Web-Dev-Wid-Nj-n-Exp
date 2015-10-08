var express = require('express');

var fortune = require('./lib/fortune.js');

var app = express();

app.use(express.static(__dirname+'/public'));

app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));

var credentials = require('./credentials.js');


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


app.use(function(req, res, next){
        res.locals.showTests = app.get('env') !== 'production' &&
                  req.query.test === '1';

        console.log("showTests 값: ", res.locals.showTests);

        next();
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

app.listen(app.get('port'), function() {
  console.log( 'Express started on htpp"//localhost:', app.get('port') + '; press Ctrl-C to terminate.' );
});

if( app.thing === null ) console.log( 'bleat!' );

var express = require('express');

var fortune = require('./lib/fortune.js');

var app = express();

app.use(express.static(__dirname+'/public'));

// Set up handlebars view engine
var handlebars = require('express-handlebars')
                    .create({ defaultLayout: 'main' });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000 );

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


app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
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

app.listen(app.get('port'), function() {
  console.log( 'Express started on htpp"//localhost:'
    + app.get('port') + '; press Ctrl-C to terminate.' );
});

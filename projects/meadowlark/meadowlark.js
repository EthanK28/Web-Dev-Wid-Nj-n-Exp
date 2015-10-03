var express = require('express');

var app = express();

app.use(express.static(__dirname+'/public'));

// Set up handlebars view engine
var handlebars = require('express-handlebars')
                    .create({ defaultLayout: 'main' });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000 );

app.get('/', function(req, res) {
  res.render('home');
  // res.type('text/plain');
  // res.send('meadowlark Travel');
});

// Cookies
var fortunes = [
"Conquer your fears or they will conquer you.", "Rivers need springs.",
"Do not fear what you don't know.",
"You will have a pleasant surprise.", "Whenever possible, keep it simple.",
];

app.get('/about', function(req, res){
  var randomFortune = fortunes[Math.floor(Math.random() * fortuens.length)];



  res.render('about', { fortune : randomFortune });
  // res.type('text/plain');
  // res.send('About Meadowlark Travel')
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

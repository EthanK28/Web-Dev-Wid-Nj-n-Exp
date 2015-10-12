var fortune = require('../lib/fortune.js');

exports.home =  function(req, res) {
        res.render('home');
        // res.send('home');
      // res.type('text/plain');
      // res.send('meadowlark Travel');
}

exports.about = function(req, res){

  res.render('about', {
          fortune : fortune.getFortune() ,
          pageTestScript: '/qa/tests-about.js'
      });
  // res.type('text/plain');
  // res.send('About Meadowlark Travel')
}

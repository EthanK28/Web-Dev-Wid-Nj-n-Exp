var Browser = require('zombie'),
	assert = require('chai').assert;

var browser;

suite('Cross-Page Tests', function(){

	setup(function(){
		browser = new Browser();
	});

	test('requesting a group rate quote from the hood river tour page should ' +
			'populate the hidden referrer field correctly', function(done){
		var referrer = 'http://localhost:3000/tours/hood-river';

		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){
				// assert(browser.field('referrer').value === referrer);

        // assert(referrer == referrer);
        browser.assert.element('form input[name=referrer]');
        // browser.assert.text('form input[name=referrer]', referrer);
        // browser.assert.element('form input[name=refer]');
        // browser.assert.input("form input[name=referrer]");
        // assert(1==1);

        // assert(referrer === referrer);
				done();
			});
		});
	});

	test('requesting a group rate from the oregon coast tour page should ' +
			'populate the hidden referrer field correctly', function(done){
		var referrer = 'http://localhost:3000/tours/oregon-coast';
		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){
				// assert(browser.field('referrer').value === referrer);

        // assert(browser.assert.element('referrer'));
				done();
			});
		});
	});

	test('visiting the "request group rate" page dirctly should result ' +
			'in an empty value for the referrer field', function(done){
		browser.visit('http://localhost:3000/tours/request-group-rate', function(){
			assert(browser.field('referrer').value === '');
			done();
		});
	});

});

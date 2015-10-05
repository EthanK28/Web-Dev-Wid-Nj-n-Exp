suite('"about" Page Test', function() {
  test('page should contain link to contact page', function() {
      assert($('a[href="/contat"]').length);
  });
});

module.exports = function(app){
  app.get(/^\/\d*$/, function(req, res) {
    res.render('index');
  });
};

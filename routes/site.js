module.exports = function(app){
  app.get(/^\/rooms\/([0-9a-zA-Z]+)?$/, function(req, res) {
    res.render('index');
  });

  app.get('/', function(req,res){
    res.redirect(app.remoteUrls.roomsIndex);
  });
};

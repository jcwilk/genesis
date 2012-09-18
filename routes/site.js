module.exports = function(app){
  app.get(/^\/rooms\/([0-9a-zA-Z]+)?$/, function(req, res) {
    res.render('index');
  });

  app.get('/', function(req,res){
    res.redirect((process.env.BASE_ROOM_URL||'http://localhost:3000')+'/rooms');
  });
};

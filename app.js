var express = require('express');
var io = require('socket.io');

var app = module.exports = express.createServer()
  , io = io.listen(app);

app.use(express.static('./public', { maxAge: 604800 }))

// Heroku doesn't support websockets
io.configure(function() {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
require('./routes/site')(app);

// Port allocation
var port = process.env.PORT || 5000;
app.listen(port);
if(app.address() !== null) {
  console.log("...aaaand we're up! (port: %d env: %s)", app.address().port, app.settings.env);
} else {
  console.log("Unable to obtain an address!")
}

// Events
var playerManager = require('./lib/playerManager').playerManagerFactory();

io.sockets.on('connection', function (socket) {
  var player = playerManager.create();
  var decoratePlayerData = function(newData){
    newData.id = player.id;
    return newData;
  }

  var syncPlayerData = function(newData){
    socket.broadcast.emit("player_update", decoratePlayerData(newData));
  }

  socket.emit('set_player_id', player.id);
  socket.emit('load_current_players', playerManager.all());
  player.delegate({fromData: syncPlayerData});
  socket.on('new_data', function(playerData){
    player.fromData(playerData);
  })

  socket.on('disconnect', function () {
    socket.broadcast.emit('player_quit', decoratePlayerData(player.toData()));
    playerManager.destroy(player);
  });
});

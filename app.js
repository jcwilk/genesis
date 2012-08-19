var express = require('express');
var io = require('socket.io');

var app = module.exports = express.createServer()
  , io = io.listen(app);

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

var port = process.env.PORT || 3000;
app.listen(port);
console.log("...aaaand we're up! (port: %d env: %s)", app.address().port, app.settings.env);

// Events
var playerManager = require('./playerManager').playerManagerFactory();

io.sockets.on('connection', function (socket) {
  var playerId = playerManager.create();

  socket.emit('set_player_id', playerId);
  socket.emit('load_current_players', {players: playerManager.all()})
  socket.broadcast.emit("player_joined", playerId);

  socket.on('new_direction', function(data){
    data.id = playerId;
    socket.broadcast.emit('player_movement', data)
  })

  socket.on('disconnect', function () {
    socket.broadcast.emit('player_quit', playerId);
    playerManager.destroy(playerId);
  });
});

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

var generateMap = function() {
  var tiles = []
  for (var i = 1; i < 12; i++)
    for (var j = 1; j < 10; j++) {
      tiles.push({
        components: ['grass'+Math.floor(Math.random()*4+1)],
        tilePos:    {x:i,y:j}
      });
    }

  // Wall tops and bottoms along the x-axis
  for (var i = 0; i < 13; i++) {
    tiles.push({
      components: ['Solid','wall_top','dirt'],
      tilePos:    {x:i,y:0}
    });
    tiles.push({
      components: ['Solid','wall_bottom','dirt'],
      tilePos:    {x:i,y:10}
    });
  }

  // Wall lefts and rights along the y axis
  for (var i = 1; i < 10; i++) {
    tiles.push({
      components: ['Solid','wall_left','dirt'],
      tilePos:    {x:0,y:i}
    });
    tiles.push({
      components: ['Solid','wall_right','dirt'],
      tilePos:    {x:12,y:i}
    });
  }

  return tiles;
};

var roomTiles = generateMap();

io.sockets.on('connection', function (socket) {
  var decoratePlayerData = function(newData){
    newData.id = player.id;
    return newData;
  }
  var syncPlayerData = function(newData){
    socket.broadcast.emit("player_update", decoratePlayerData(newData));
  }

  var player = playerManager.create();

  socket.emit('load_current_state', {
    players: playerManager.all(),
    room: {tiles: roomTiles},
    currentPlayer: {
      id: player.id,
      pos: {x: 200, y: 160}
    }
  });
  player.delegate({fromData: syncPlayerData});
  socket.on('new_data', function(playerData){
    player.fromData(playerData);
  })

  socket.on('disconnect', function () {
    socket.broadcast.emit('player_quit', decoratePlayerData(player.toData()));
    playerManager.destroy(player);
  });
});

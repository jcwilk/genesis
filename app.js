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
  app.use(express.static('./public', { maxAge: 604800 }));
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

var url = require('url');

var fetchRoom = function(roomPath, callback){
  var defaultRoom = url.parse(process.env.DEFAULT_ROOM || 'http://localhost:3000/rooms/1234')

  var options = {
    host: defaultRoom.hostname,
    port: defaultRoom.port,
    method: 'GET'
  };
  if(roomPath) {
    options.path = '/rooms/'+roomPath;
  } else {
    options.path = defaultRoom.path;
  }

  require('http').request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function (chunk) {
      rawData += chunk;
    });
    res.on('end', function() {
      callback(JSON.parse(rawData));
    });
  }).end();
};

io.sockets.on('connection', function(socket){
  var decoratePlayerData = function(newData){
    newData.id = player.id;
    return newData;
  }

  var player = playerManager.create();

  socket.on('disconnect', function () {
    socket.broadcast.emit('player_quit', decoratePlayerData(player.toData()));
    playerManager.destroy(player);
  });

  socket.on('fetch_room', function(roomPath,clientCallback){
    fetchRoom(roomPath.data, function(roomData){
      player.fromData({data: {pos: roomData.room.spawn}});
      player.delegate({fromData: function(newData){
        socket.broadcast.emit("player_update", decoratePlayerData(newData));
      }});

      clientCallback({
        players: playerManager.all(),
        room: roomData.room,
        currentPlayer: {
          id: player.id
        }
      });

      socket.on('new_data', function(playerData){
        player.fromData(playerData);
      });
    });
  });
});

// LOADING SCENE
Crafty.scene("loading", function() {
  var text = Crafty.e("2D, DOM, Text").attr({w: 300, h: 320, x: 150, y: 120});

  Crafty.background("#000");
  text.text("Loading").css({"text-align": "center", "color": "white", "font-size": "20px"});

  Crafty.load(["images/tiles.png", "images/players.png"], function() {
    Crafty.socket = io.connect(document.URL);

    Crafty.scene("main"); // When everything is loaded, run the main scene
  });
});

// MAIN SCENE
Crafty.scene("main", function() {
  generateMap();

  var player, currentPlayerId, players;

  //Don't do anything else until we get the player_id
  Crafty.socket.on('set_player_id', function(data) {
    if(currentPlayerId === undefined){
      currentPlayerId = data;
    
      player = Crafty.e("LocalAvatar").seedId(data);

      // After Joining the server sends data with all the current players and their positions so the client loads them into the map.
      // Don't set up listeners that depend on the knowledge of other players until this happens.
      Crafty.socket.on("load_current_players", function(data) {
        if(players === undefined){
          players = {currentPlayerId: player}

          for(var i = 0; i < data.players.length; i++) {
            var id = data.players[i];
            if(id != currentPlayerId) players[id] = Crafty.e("RemoteAvatar").seedId(id);
          }

          Crafty.socket.on("player_quit", function(data) {
            if(p=players[data]) {
              delete players[data];
              p.destroy();
            }
          })

          //TODO: All the stuff inside the if statement probably should be moved into RemoteAvatar
          Crafty.socket.on('player_movement', function (data) {
            console.log(data);
            if((p=players[data.id]) && data.id != currentPlayerId){
              p.attr(data.pos);
              p._movement.x = data.x
              p._movement.y = data.y
              p.trigger('NewDirection',p._movement)
            }
          });

          // Add a new player to the map when a user joins the game.
          Crafty.socket.on("player_joined", function(data) {
            if(data != currentPlayerId) players[data] = Crafty.e("RemoteAvatar").seedId(data);
          });
        }
      });
    }
  });
});

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

  var currentPlayerEntity,
      currentPlayerId,
      players;


  //Don't do anything else until we get the player_id
  Crafty.socket.on('set_player_id', function(data) {
    if(currentPlayerId === undefined){
      currentPlayerId = parseInt(data);
      currentPlayerEntity = Crafty.e("LocalAvatar").seedId(currentPlayerId);

      // After Joining the server sends data with all the current players and their positions so the client loads them into the map.
      // Don't set up listeners that depend on the knowledge of other players until this happens.
      Crafty.socket.on("load_current_players", function(data) {
        if(players === undefined){
          players = playerManagerFactory();
          players.create({id: currentPlayerId, entity: currentPlayerEntity});

          for(var i = 0; i < data.length; i++) {
            var newPlayer = data[i];
            if(parseInt(newPlayer.id) != currentPlayerId){
              newPlayer.entity = Crafty.e("RemoteAvatar").seedId(newPlayer.id)
              players.create(newPlayer);
            }
          }

          Crafty.socket.on("player_quit", function(data) {
            var p=players.findById(data.id);
            if(p) {
              p.entity.destroy();
              players.destroy(p.id);
            }
          })

          //TODO: All the stuff inside the if statement probably should be moved into RemoteAvatar
          Crafty.socket.on('player_movement', function (data) {
            var p=players.findById(data.id)
            if(p && parseInt(data.id) != currentPlayerId){
              var entity = p.entity;
              entity.attr(data.pos);
              entity._movement.x = data.x;
              entity._movement.y = data.y;
              entity.trigger('NewDirection',entity._movement);
            }
          });

          // Add a new player to the map when a user joins the game.
          Crafty.socket.on("player_joined", function(data) {
            if(parseInt(data.id) != currentPlayerId){
              data.entity = Crafty.e("RemoteAvatar").seedId(data.id);
              players.create(data);
            }
          });
        }
      });
    }
  });
});

// LOADING SCENE
Crafty.scene("loading", function() {
  var text = Crafty.e("2D, DOM, Text").attr({w: 300, h: 320, x: 150, y: 120});

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
      currentPlayer,
      players;

  var updateRemotePlayer = function(playerData){
    var remoteId = parseInt(playerData.id);
    if(remoteId == currentPlayerId) return null;

    var p=players.findById(remoteId);
    if(!p) p = players.create({id: remoteId})
    if(!p.entity) {
      p.entity = Crafty.e("RemoteAvatar").seedId(remoteId);
      p.delegate(p.entity);
    }

    p.fromData(playerData);
  }

  //Don't do anything else until we get the player_id
  Crafty.socket.on('set_player_id', function(data) {
    if(currentPlayerId === undefined){
      currentPlayerId = parseInt(data);
      currentPlayerEntity = Crafty.e("LocalAvatar")
                              .seedId(currentPlayerId);

      Crafty.viewport.clampToEntities = false;
      Crafty.viewport.centerOn(currentPlayerEntity,0);
      Crafty.viewport.follow(currentPlayerEntity, 0, 0);

      // After Joining the server sends data with all the current players and their positions so the client loads them into the map.
      // Don't set up listeners that depend on the knowledge of other players until this happens.
      Crafty.socket.on("load_current_players", function(currentPlayers) {
        if(players === undefined){
          players = playerManagerFactory();
          currentPlayer = players.create({id: currentPlayerId, entity: currentPlayerEntity});

          //Only send 4 updates per half second...
          //but for the first 4 in a half second span, send them immediately
          var throttledConnection = {
            justSent: 0,
            pendingData: null,
            sendData: function(inData){
              if(inData !== undefined) throttledConnection.pendingData = inData;

              if(throttledConnection.justSent < 4 && throttledConnection.pendingData){
                throttledConnection.justSent++;
                Crafty.socket.emit('new_data', throttledConnection.pendingData);
                throttledConnection.pendingData = null;
                setTimeout(function(){
                  throttledConnection.justSent = 0;
                  throttledConnection.sendData();
                }, 500)
              }
            },
            fromData: function(inData){
              throttledConnection.sendData(inData);
            }
          }

          currentPlayer.delegate(throttledConnection);
          currentPlayerEntity.delegate(currentPlayer);

          for(var i = 0; i < currentPlayers.length; i++) {
            updateRemotePlayer(currentPlayers[i]);
          }

          Crafty.socket.on("player_quit", function(player) {
            var p=players.findById(player.id);
            if(p) {
              p.entity.destroy();
              players.destroy(p.id);
            }
          })

          //TODO: All the stuff inside the if statement probably should be moved into RemoteAvatar
          Crafty.socket.on('player_update', function (playerData) {
            updateRemotePlayer(playerData);
          });
        }
      });
    }
  });
});

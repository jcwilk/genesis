// LOADING SCENE
Crafty.scene("loading", function() {
  var text = Crafty.e("2D, DOM, Text").attr({w: 300, h: 320, x: 150, y: 120});

  text.text("Loading").css({"text-align": "center", "color": "white", "font-size": "20px"});

  var fullPlayersUrl = window.location.protocol+'//'+window.location.host;
  fullPlayersUrl+= '/images/players.png';
  //TODO: This is bullshit, there's got to be a better way to do this... Chrome breaks otherwise

  Crafty.load([fullPlayersUrl], function() {
    Crafty.scene("main"); // When everything is loaded, run the main scene
  });
});

// MAIN SCENE
Crafty.scene("main", function() {
  var currentPlayerEntity,
      currentPlayerId,
      currentPlayer,
      players;

  var updatePlayer = function(playerData){
    var remoteId = parseInt(playerData.id);

    var p=players.findById(remoteId);
    if(!p) p = players.create({id: remoteId})
    if(!p.entity) {
      p.entity = Crafty.e("RemoteAvatar").seedId(remoteId);
      p.delegate(p.entity);
    }

    p.fromData(playerData);
  }

  var initializeCurrentPlayer = function(playerData){
    currentPlayerEntity.applyPositionDataToEntity(playerData);
  }

  var initializePlayers = function(gameState){
    generateMap(gameState.room);

    currentPlayerId = parseInt(gameState.currentPlayer.id);
    currentPlayerEntity = Crafty.e("LocalAvatar")
                        .seedId(currentPlayerId);

    Crafty.viewport.clampToEntities = false;
    Crafty.viewport.centerOn(currentPlayerEntity,0);
    Crafty.viewport.follow(currentPlayerEntity, 0, 0);

    players = playerManagerFactory();
    currentPlayer = players.create({id: currentPlayerId, entity: currentPlayerEntity});
  }

  var connectDataSocket = function(dataChannel){
    var dataSocket = io.connect(window.location.protocol+'//'+window.location.host+'/'+dataChannel);
      
    dataSocket.on('init_room',function(gameState){
      if(currentPlayerId === undefined){
        initializePlayers(gameState);

        //Only send 4 updates per half second...
        //but for the first 4 in a half second span, send them immediately
        //TODO: This overwrites and discards excessive updates, instead it should
        //      merge them together and intersect the participants. Currently there's
        //      the danger of chat data flooding out position data and leaving the
        //      position stale.
        var throttledConnection = {
          justSent: 0,
          pendingData: null,
          sendData: function(inData){
            if(inData !== undefined) throttledConnection.pendingData = inData;

            if(throttledConnection.justSent < 4 && throttledConnection.pendingData){
              throttledConnection.justSent++;
              dataSocket.emit('new_data', throttledConnection.pendingData);
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
        currentPlayer.delegate(currentPlayerEntity);
        currentPlayerEntity.delegate(currentPlayer);

        for(var i = 0; i < gameState.players.length; i++) {
          updatePlayer(gameState.players[i]);
        }

        dataSocket.on("player_quit", function(player) {
          var p=players.findById(player.id);
          if(p) {
            p.entity.destroy();
            players.destroy(p.id);
          }
        })

        dataSocket.on('player_update', updatePlayer);
      }
    });
  }

  io.connect(window.location.protocol+'//'+window.location.host)
    .emit('fetch_room_channel', window.location.pathname.slice(1), connectDataSocket);
});

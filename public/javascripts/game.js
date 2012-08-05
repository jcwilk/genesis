// Turn the sprite map into usable components
Crafty.sprite(32, "images/tiles.png", {
  grass1: [0,0],
  grass2: [1,0],
  grass3: [2,0],
  grass4: [3,0],
  dirt:   [8,0],
});

// FIXME: Make working with sprites easier.. this is insane.
Crafty.sprite(1, "images/players.png", {
  player0: [0,0, 31, 45],
  player1: [31*3,0, 31, 45],
  player2: [0,49*4, 31, 45],
  player3: [33*4,49*4, 31, 45]
});

// LOADING SCENE
Crafty.scene("loading", function() {
  var text = Crafty.e("2D, DOM, text").attr({w: 300, h: 320, x: 150, y: 120});

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

  // Create our player entity with some premade components
  var player = Crafty.e("humanPlayer")
    .attr({z: 99}) // Make other players appear behind the user's player.
    .initializeControls(2); // Allow the user to control his player with the keyboard.

  var players = {};  
  var currentPlayerId = -1;

  Crafty.socket.on('set_player_id', function(data) {
    currentPlayerId = data;
    //TODO: if this can be changed, make it blow away the value for the old id
    players[data] = player;
  });

  // Add a new player to the map when a user joins the game.
  Crafty.socket.on("player_joined", function(data) {
    if(data != currentPlayerId) players[data] = Crafty.e("humanPlayer");
  });

  // After Joining the server sends data with all the current players and their positions so the client loads them into the map.
  Crafty.socket.on("load_current_players", function(data) {
    for(var i = 0; i < data.players.length; i++) {
      var id = data.players[i];
      if(id != currentPlayerId) players[id] = Crafty.e("humanPlayer");
    }
  });

  Crafty.socket.on("player_quit", function(data) {
    if(p=players[data]) {
      delete players[data];
      p.destroy(); //Y U NO WORK??? TODO: make this actually destroy the entity
    }
  })

  // Move the player realisticaly as the user controls it,
  // but also make sure the end position is accurate.
  //TODO: The keyDown/keyUp stuff is making the main character move, not the "other" character which is supposed to be moving
  //      which causes -2- characters to move. Need to figure out how to make it trigger the walk stuff on the right character
  Crafty.socket.on('keydown', function (data) {
    if((p=players[data.id]) && data.id != currentPlayerId){
      //p.keyDown(data.keyCode);
      p.attr(data.position);
    }
  });

  Crafty.socket.on('keyup', function (data) {
    if((p=players[data.id]) && data.id != currentPlayerId){
      //p.keyUp();
      p.attr(data.position);
    }
  });

  // Broadcast the player movement to the other clients.
  player.bind("keyup", function(e) { Crafty.socket.emit("keyup", {'position': player.pos(), 'id': currentPlayerId }) });
  player.bind("keydown", function(e) { Crafty.socket.emit("keydown", {'keyCode': e.keyCode, 'position': player.pos(), 'id': currentPlayerId }) });
});

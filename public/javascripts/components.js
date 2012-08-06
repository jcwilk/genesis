// Turn the sprite map into usable components
Crafty.sprite(32, "images/tiles.png", {
  grass1: [0,0],
  grass2: [1,0],
  grass3: [2,0],
  grass4: [3,0],
  dirt:   [8,0],
});

//Each sprite is 32x48
//Total image size is 384x384
//Represents 8 players, 4 across 2 high
//Each player has 4 rows of 3 images each
//The center image of the top row is the best default image
Crafty.sprite(1,"images/players.png", {
  player0: [32,0, 32, 48],
  player1: [32*4,0, 32, 48],
  player2: [32,48*4, 32, 48],
  player3: [32*4,48*4, 32, 48],
  player4: [32*7,0, 32, 48],
  player5: [32*10,0, 32, 48],
  player6: [32*7,48*4, 32, 48],
  player7: [32*10,48*4, 32, 48]
});



Crafty.c("Avatar", {
  init: function() {
    this.requires("2D, Canvas, SpriteAnimation, RightControls")
    
    return this;
  },
  seedId: function(seedId) {
    var spriteId = seedId%8
    var spritePositions = [ [0,0], [32*3,0], [0,48*4], [32*3, 48*4], [32*6,0], [32*9,0], [32*6,48*4], [32*9, 48*4] ];
    //var spriteId = Crafty.math.randomInt(0,7);

    var pos = spritePositions[spriteId];

    // The animation is based on this Sprite: images/players.png
    // The animation needs an array like [[x,y,width,height]].
    var movementAnimation = {
      "down":  [ [pos[0], pos[1], 32, 48], [pos[0] + 32, pos[1], 32, 48], [pos[0] + (32*2), pos[1], 32, 48] ],
      "left":  [ [pos[0], pos[1] + 48, 32, 48], [pos[0] + 32, pos[1] + 48, 32, 48], [pos[0] + (32*2), pos[1]+48, 32, 48] ],
      "right": [ [pos[0], pos[1]+(48*2), 32, 48], [pos[0] + 32, pos[1]+(48*2), 32, 48], [pos[0] + (32*2), pos[1]+(48*2), 32, 48] ],
      "up":    [ [pos[0], pos[1]+(48*3), 32, 48], [pos[0] + 32, pos[1]+(48*3), 32, 48], [pos[0] + (32*2), pos[1]+(48*3), 32, 48] ],
    };

    this.requires('player'+spriteId)
      .attr({x: 400, y: 320, z:1}) // Make new players appear in the center of the map.
      .animate("walk_down",  movementAnimation.down)
      .animate("walk_left",  movementAnimation.left)
      .animate("walk_right", movementAnimation.right)
      .animate("walk_up",    movementAnimation.up)
      .bind("NewDirection", function (direction) {
        if (direction.x < 0) {
          if (!this.isPlaying("walk_left"))
            this.stop().animate("walk_left", 10, -1);
        }
        if (direction.x > 0) {
          if (!this.isPlaying("walk_right"))
            this.stop().animate("walk_right", 10, -1);
        }
        if (direction.y < 0) {
          if (!this.isPlaying("walk_up"))
            this.stop().animate("walk_up", 10, -1);
        }
        if (direction.y > 0) {
          if (!this.isPlaying("walk_down"))
            this.stop().animate("walk_down", 10, -1);
        }
        if(!direction.x && !direction.y) {
          this.stop();
        }
      });
    return this;
  }
})

Crafty.c("RightControls", {
  init: function() {
    this.requires('Multiway');
  },

  rightControls: function(speed) {
    this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
    return this;
  }
});

Crafty.c('LocalAvatar', {
  init: function() {
    this.requires('Avatar')
      .attr({z: 99})
      .rightControls(2)
      .bind("NewDirection", function(direction) {
        var pos = this.pos();
        Crafty.socket.emit('new_direction', {
          x: direction.x,
          y: direction.y,
          pos: {
            x: pos._x,
            y: pos._y
          }
        })
      })
  }
});

Crafty.c('RemoteAvatar', {
  init: function() {
    this.requires('Avatar').rightControls(0)
  }
})
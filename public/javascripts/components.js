// Turn the sprite map into usable components
Crafty.sprite(32, "images/tiles.png", {
  grass1: [0,0],
  grass2: [1,0],
  grass3: [2,0],
  grass4: [3,0],
  dirt:   [8,0],
});

// FIXME: Make working with sprites easier.. this is insane.
Crafty.sprite(1,"images/players.png", {
  player0: [0,0, 31, 45],
  player1: [31*3,0, 31, 45],
  player2: [0,49*4, 31, 45],
  player3: [33*4,49*4, 31, 45]
});

Crafty.c("Avatar", {
  init: function() {
    this.spritePositions = [ [0,0], [31*3,0], [0,49*4], [32*3, 49*4] ];
    this.spriteId = Crafty.math.randomInt(0,3);

    var pos = this.spritePositions[this.spriteId];

    // The animation is based on this Sprite: images/players.png
    // The animation needs an array like [[x,y,width,height]].
    this.movementAnimation = {
      "down":  [ [pos[0], pos[1], 33, 45], [pos[0] + 33, pos[1], 33, 45], [pos[0] + 62, pos[1], 33, 45] ],
      "left":  [ [pos[0], pos[1] + 45, 31, 45], [pos[0] + 31, pos[1] + 45, 31, 45], [pos[0] + 62, pos[1]+45, 31, 45] ],
      "right": [ [pos[0], pos[1]+94, 31, 45], [pos[0] + 31, pos[1]+94, 31, 45], [pos[0] + 62, pos[1]+94, 31, 45] ],
      "up":    [ [pos[0], pos[1]+140, 31, 45], [pos[0] + 31, pos[1]+140, 31, 45], [pos[0] + 62, pos[1]+140, 31, 45] ],
    };

    this.requires("2D, Canvas, SpriteAnimation, RightControls, player"+this.spriteId)
      .attr({x: 400, y: 320, z:1}) // Make new players appear in the center of the map.
      .animate("walk_down",  this.movementAnimation.down)
      .animate("walk_left",  this.movementAnimation.left)
      .animate("walk_right", this.movementAnimation.right)
      .animate("walk_up",    this.movementAnimation.up)
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
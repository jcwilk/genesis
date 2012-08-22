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

Crafty.c("DataDriven", dataDrivenComponentFactory());

var applyPositionDataToEntity = function(inData, e){
  var data = inData.data,
      changed = false;
  if(data.hasOwnProperty('pos')){
    changed = true;
    var x = data.pos.x,
        y = data.pos.y;
    if(e.translateX) x = e.translateX(x);
    if(e.translateY) y = e.translateY(y);
    e.attr({x: x, y: y});
  }
  if(data.hasOwnProperty('dir')){
    changed = true;
    e._movement.x = data.dir.x;
    e._movement.y = data.dir.y;
  }
  if(changed) e.trigger('NewDirection',e._movement);
}

Crafty.c("Chatty", {
  init: function(){
    var chatBox = Crafty.e('2D, DOM, Text, DataDriven, RightControls, SpriteAnimation')
      .rightControls(0)
      .css({
        color: "black",
        'font-size': "14px",
        background: "white",
        padding: "0px 2px",
        'font-weight': "bold"
      });
    chatBox.translateX = function(inX){ return inX-10 };
    chatBox.translateY = function(inY){ return inY+50 };
    var newChatBoxPos = {
      x: this.pos()._x,
      y: this.pos()._y
    };
    
    chatBox.delegate({fromData: function(inData){
      var data = inData.data;
      applyPositionDataToEntity(inData, chatBox);
      if(data.hasOwnProperty('chat')) {
        if(data.chat){
          chatBox.css('border', '1px solid black');
        } else {
          chatBox.css('border', 'none');
        }
        chatBox.text(function(_){return data.chat});
        if(this.onChangeTextCallback){
          this.onChangeTextCallback(data.chat)
        }
      }
    }});
    this.chatBox = chatBox;
    this.bind('Remove',function(){
      this.chatBox.destroy();
    })
  },
  onChangeText: function(callback) {
    var chatBox = this.chatBox;
    this.onChangeTextCallback = callback;


    this.chatBox.bind('Change', function(){ //TODO: add a method for this
      callback(chatBox.text());
    })
    return this;
  },
  bindChatKeys: function(){
    this.bind('KeyDown', function(e){
      var chatBox = this.chatBox,
          newText = undefined,
          key     = undefined;
      //console.log(e.key);

      //They're trying to muck with their browser so ignore it
      if(this.isDown('CTRL') || this.isDown('ALT')) return;

      if(e.key == 13){ //Enter
        newText = '';
      } else
      if(e.key == 8){
        if(chatBox.text().length > 0) newText = chatBox.text().slice(0,chatBox.text().length-1)
      }
      
      var map;
      if(this.isDown('SHIFT')){
        if(e.key >= 65 && e.key <= 90) key = String.fromCharCode(e.key) //uppercase
        map = {
          32: '&nbsp;',
          48: ')',
          49: '!',
          50: '@',
          51: '#',
          52: '$',
          53: '%',
          54: '^',
          55: '&',
          56: '*',
          57: '(',
          59: ':',
          61: '+',
          107: '+',
          109: '_',
          110: '.',
          111: '/',
          187: '+',
          188: '<',
          189: '-',
          190: '>',
          191: '?',
          192: '~',
          219: '{',
          220: '|',
          221: '}',
          222: '"'
        }
      } else {
        if(e.key >= 48 && e.key <= 57) key = String.fromCharCode(e.key) //numbers
        if(e.key >= 65 && e.key <= 90) key = String.fromCharCode(e.key+32) //lowercase
        map = {
          32: '&nbsp;', //todo: HTML escape this crap
          59: ';',
          61: '=',
          107: '+',
          109: '-',
          110: '.',
          111: '/',
          187: '+',
          188: ',',
          189: '-',
          190: '.',
          191: '/',
          192: '`',
          219: '[',
          220: '\\',
          221: ']',
          222: "'"
        }
      }
      for(var k in map){
        if(map.hasOwnProperty(k) && e.key == k) key = map[k];
      }
      if(key !== undefined) newText = chatBox.text()+key;
      if(newText !== undefined){
        if(e.stopPropagation) e.stopPropagation();
          else e.cancelBubble = true;

        if(e.preventDefault) e.preventDefault();
          else e.returnValue = false;
        chatBox.fromData({data: {chat: newText}});
      }
    });
    return this;
  }
})

Crafty.c("Avatar", {
  init: function() {
    this.requires("2D, Canvas, SpriteAnimation, RightControls, Chatty")
  },
  startX: 400,
  startY: 320,
  seedId: function(seedId) {
    var spriteId = seedId%8
    var spritePositions = [ [0,0], [32*3,0], [0,48*4], [32*3, 48*4], [32*6,0], [32*9,0], [32*6,48*4], [32*9, 48*4] ];
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
      .attr({x: this.startX, y: this.startY, z:1}) // Make new players appear in the center of the map.
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
      .requires('Keyboard')
      .attr({z: 99})
      .rightControls(2)
      .bindChatKeys();
    this.chatBox.fromData({data: {pos: {x: this.startX, y: this.startY}}})
  },
  onChangeDirection: function(callback) {  
    this.bind('NewDirection', function(direction){
      var pos = this.pos();
      var data = {
        data: {
          dir: {
            x: direction.x,
            y: direction.y
          },
          pos: {
            x: pos._x,
            y: pos._y
          }
        }
      }
      this.chatBox.fromData(data);
      callback(data.data);
    });
    return this;
  }
});

Crafty.c('RemoteAvatar', {
  init: function() {
    this.requires('Avatar').rightControls(0);
  },
  fromData: function(inData){
    applyPositionDataToEntity(inData, this);
    this.chatBox.fromData(inData);
      
    return this;
  }
})
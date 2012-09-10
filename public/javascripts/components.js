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

(function(){
  var newComponent = dataDrivenComponentFactory();
  newComponent.applyPositionDataToEntity = function(inData){
    var data = inData.data,
        changed = false;
    if(data.hasOwnProperty('pos')){
      changed = true;
      var x = data.pos.x,
          y = data.pos.y;
      if(this.translateX) x = this.translateX(x);
      if(this.translateY) y = this.translateY(y);
      this.attr({x: x, y: y});
    }
    if(data.hasOwnProperty('dir')){
      changed = true;
      this._movement.x = data.dir.x;
      this._movement.y = data.dir.y;
    }
    if(changed) this.trigger('NewDirection',this._movement);
  }
  newComponent.calculatePosData = function(inData){
    var pos = this.pos();
    return {
      data: {
        pos: {
          x: pos._x,
          y: pos._y
        }
      }
    }
  }
  Crafty.c("DataDriven", newComponent);
})()

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
      })
      .attr({z:90});
    chatBox.translateX = function(inX){ return inX-10 };
    chatBox.translateY = function(inY){ return inY+50 };
    
    chatBox.delegate({fromData: function(inData){
      var data = inData.data;
      chatBox.applyPositionDataToEntity(inData);
      if(data.hasOwnProperty('chat')) {
        chatBox.text(function(_){return data.chat});
        if(data.chat){
          chatBox.css('border', '1px solid black');
        } else {
          chatBox.css('border', 'none');
        }
      }
    }});
    this.chatBox = chatBox;
    this.bind('Remove',function(){
      this.chatBox.destroy();
    })
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
    this.requires("2D, DOM, SpriteAnimation, RightControls, Chatty, DataDriven");    
    this.delegate(this.chatBox);
    
  },
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

    this.requires('player'+spriteId+', Collision')
      .attr({z:1})
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
      })
      .collision([this.w/2-16,this.h-32],[this.w/2+16,this.h-32],[this.w/2+16,this.h],[this.w/2-16,this.h])
      .bind('Moved', function(from) {
        if(this.hit('Solid')){
          this.applyPositionDataToEntity({data: {pos: {x: from.x, y:from.y}}});
        }
      })
    
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
      .attr({z: 50})
      .rightControls(2)
      .bindChatKeys();

    this.chatBox.delegate(this, {only: ['chat']});

    this.bind('NewDirection', function(direction){
      var outData = this.calculatePosData();
      outData.data.dir = {x: direction.x, y: direction.y};
      this.fromData(outData);
    });
  }
});

Crafty.c('RemoteAvatar', {
  init: function() {
    this.requires('Avatar')
      .attr({z: 40}) //TODO: It seems to ignore this setting and still places in front of LocalAvatar
      .rightControls(0);
    var that = this;
    this.delegate({fromData: function(inData){
      that.applyPositionDataToEntity(inData);
    }});
  }
})
//Each sprite is 32x48
//Total image size is 384x384
//Represents 8 players, 4 across 2 high
//Each player has 4 rows of 3 images each
//The center image of the top row is the best default image
Crafty.sprite(1,"/images/players.png", {
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
  newComponent.oldInit = newComponent.init;
  newComponent.init = function(){
    this.oldInit();
    this.requires('Multiway');
  }
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
    if(this._remoteControlled) this.trigger('NewDirection',this._movement);
  }
  newComponent.remoteControlled = function(setToValue){
    var speed;
    this._remoteControlled = setToValue;
    if(setToValue){
      speed = 0;
    } else {
      speed = 2;
    }
    this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
    return this;
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

// Crafty.cF for "function", it takes in a function rather than an object
// The following two are equivallent:
/*

Crafty.c('Example',{
  init: function(){
    this.objArray = []
  },
  push: function(v){
    this.objArray.push(v);
    return this;
  }
})

Crafty.cF('ExampleF',function(e){
  e.objArray = []
  e.push = function(v){
    e.objArray.push(v);
    return e;
  }
})

*/
Crafty.cF = function(name, builder){
  Crafty.c(name, {
    init: function(){
      builder(this)
    }
  })
}

Crafty.cF("Chatty", function(e){
  
  e.requires('DataDriven');

  var chatBox = Crafty.e('2D, DOM, Text, DataDriven, SpriteAnimation')
    .remoteControlled(true)
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

  e.delegate(chatBox);
  chatBox.delegate(e, {only: ['chat']});

  e.chatBox = chatBox;
  e.bind('Remove',function(){
    e.chatBox.destroy();
  })

  e.bindChatKeys = function(){
    e.bind('KeyDown', function(event){
      var chatBox = e.chatBox,
          newText = undefined,
          key     = undefined;
      //console.log(event.key);

      //They're trying to muck with their browser so ignore it
      if(e.isDown('CTRL') || e.isDown('ALT')) return;

      if(event.key == 13){ //Enter
        newText = '';
      } else
      if(event.key == 8){
        if(chatBox.text().length > 0) newText = chatBox.text().slice(0,chatBox.text().length-1)
      }
      
      var map;
      if(e.isDown('SHIFT')){
        if(event.key >= 65 && event.key <= 90) key = String.fromCharCode(event.key) //uppercase
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
        if(event.key >= 48 && event.key <= 57) key = String.fromCharCode(event.key) //numbers
        if(event.key >= 65 && event.key <= 90) key = String.fromCharCode(event.key+32) //lowercase
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
        if(map.hasOwnProperty(k) && event.key == k) key = map[k];
      }
      if(key !== undefined) newText = chatBox.text()+key;
      if(newText !== undefined){
        if(event.stopPropagation) event.stopPropagation();
          else event.cancelBubble = true;

        if(event.preventDefault) event.preventDefault();
          else event.returnValue = false;
        chatBox.fromData({data: {chat: newText}});
      }
    });
    return e;
  }
})

Crafty.cF("Avatar", function(e){
  e.requires("2D, DOM, SpriteAnimation, Chatty, DataDriven");

  e.seedId = function(seedId) {
    var spriteId = seedId%8;
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

    e.requires('player'+spriteId+', Collision')
      .attr({z:1})
      .animate("walk_down",  movementAnimation.down)
      .animate("walk_left",  movementAnimation.left)
      .animate("walk_right", movementAnimation.right)
      .animate("walk_up",    movementAnimation.up)
      .bind("NewDirection", function (direction) {
        if (direction.x < 0) {
          if (!e.isPlaying("walk_left"))
            e.stop().animate("walk_left", 10, -1);
        }
        if (direction.x > 0) {
          if (!e.isPlaying("walk_right"))
            e.stop().animate("walk_right", 10, -1);
        }
        if (direction.y < 0) {
          if (!e.isPlaying("walk_up"))
            e.stop().animate("walk_up", 10, -1);
        }
        if (direction.y > 0) {
          if (!e.isPlaying("walk_down"))
            e.stop().animate("walk_down", 10, -1);
        }
        if(!direction.x && !direction.y) {
          e.stop();
        }
      })
      .collision([e.w/2-16,e.h-32],[e.w/2+16,e.h-32],[e.w/2+16,e.h],[e.w/2-16,e.h])
      .bind('Moved', function(from) {
        if(e.hit('Solid')){
          e.fromData({data: {pos: {x: from.x, y:from.y}}});
        }
      })

    e.delegate({fromData: function(inData){
      e.applyPositionDataToEntity(inData);
    }});
    
    return e;
  }
})

Crafty.cF('LocalAvatar', function(e){
  e.requires('Avatar')
    .remoteControlled(false)
    .requires('Keyboard')
    .attr({z: 50})
    .bindChatKeys()
    .bind('NewDirection', function(direction){
      var outData = e.calculatePosData();
      outData.data.dir = {x: direction.x, y: direction.y};
      e.fromData(outData);
    });
});

Crafty.cF('RemoteAvatar', function(e){
  e.requires('Avatar')
    .remoteControlled(true)
    .attr({z: 40}); //TODO: It seems to ignore this setting and still places in front of LocalAvatar
})
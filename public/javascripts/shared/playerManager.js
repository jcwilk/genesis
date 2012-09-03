/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };
})();

//END Math.uuid.js (Thanks Robert Kieffer!)
///////////////////////////////////////////

var dataNodeFactory = function(){
  var data = {};
  var delegates = [];
  var uuid = Math.uuidFast();
  var isParticipant = function(inData){
    var array = inData.participants;
    var i = array.length;
    while (i--) {
      if (array[i] === uuid) {
        return true;
      }
    }
    return false;
  }
  var toData = function(){
    return {
      data: data
    }
  };
  return {
    toData: toData,
    fromData: function(inData){
      var participants = [uuid];
      if(inData.participants){
        if(isParticipant(inData)) return null;
        for (var i = 0; i < inData.participants.length; i++){
          participants.push(inData.participants[i]);
        }
      }

      for(var k in inData.data){
        if(inData.data.hasOwnProperty(k)) data[k] = inData.data[k]
      }
      for(var i = 0; i < delegates.length; i++){
        delegates[i].fromData({
          data: inData.data,
          participants: participants
        })
      }
      return toData();
    },
    delegate: function(newDelegate){
      delegates.push(newDelegate);
      outData = toData();
      outData.participants = [uuid];
      newDelegate.fromData(outData);
    }
  };
}

var playerManagerFactory = function(){
  var players = [],
      idAutoInc = 0;

  var findById = function(playerId){
    for(var i=0; i<players.length; i++) {
      if (players[i].id == parseInt(playerId)) return players[i];
    };
    return null;
  };

  var exists = function(playerId){
    return findById(playerId) !== null
  };

  return {
    create: function(attributes){
      var newId;
      if(attributes && attributes.id !== undefined){
        newId = parseInt(attributes.id);
        if(exists(newId)) return false;
      } else {
        while(exists(newId = idAutoInc++)){}
      }
      var newPlayer = dataNodeFactory();
      newPlayer.id = newId;
      for(var k in attributes) {
        if(k !== 'id' && attributes.hasOwnProperty(k)) newPlayer[k] = attributes[k]
      }
      players.push(newPlayer);
      return newPlayer;
    },
    destroy: function(player){
      index = players.indexOf(player);
      if(index >= 0){
        players.splice(index,1);
        return true;
      }
      return false;
    },
    all: function(){
      _all = [];
      for(i=0; i<players.length; i++){
        var newData = players[i].toData();
        newData.id = players[i].id;
        _all.push(newData);
      }
      return _all;
    },
    findById: findById,
    exists: exists
  };
};

var dataDrivenComponentFactory = function(){
  return {
    init: function() {
      this.dataNode = dataNodeFactory();
      this.fromData = this.dataNode.fromData;
      this.toData   = this.dataNode.toData;
      this.delegate = this.dataNode.delegate;
    }
  }
}

if(typeof exports != 'undefined'){
  exports.playerManagerFactory = playerManagerFactory;
  exports.dataDrivenComponentFactory = dataDrivenComponentFactory;
}
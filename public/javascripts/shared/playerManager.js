//TODO: abstract this into the concept of a dataNode and away from
// the concept of a player.
var playerFactory = function(id){
  var data = {};
  var delegates = [];
  var toData = function(){
    return {
      id: id, //TODO: do not include the id in toData()
      data: data
    }
  };
  return {
    id: id,
    toData: toData,
    fromData: function(inData){
      for(var k in inData.data){
        if(inData.data.hasOwnProperty(k)) data[k] = inData.data[k]
      }
      for(var i = 0; i < delegates.length; i++){
        delegates[i].fromData({data: data})
      }
      return toData();
    },
    delegate: function(newDelegate){
      delegates.push(newDelegate);
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
      var newPlayer = playerFactory(newId);
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
      for(i=0; i<players.length; i++) _all.push(players[i].toData())
      return _all;
    },
    findById: findById,
    exists: exists
  };
};

var dataDrivenComponentFactory = function(){
  return {
    init: function() {
      this.dataNode = playerFactory();
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
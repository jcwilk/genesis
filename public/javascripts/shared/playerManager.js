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
      var newPlayer = {id: idAutoInc};
      if(attributes && attributes.id !== undefined){
        var specifiedId = parseInt(attributes.id);
        if(exists(specifiedId)) return false;
        newPlayer.id = specifiedId;
      } else {
        while(exists(newPlayer.id)) {
          newPlayer.id = ++idAutoInc;
        }
        idAutoInc++;
      }
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
      return players.slice(0);
    },
    findById: findById,
    exists: exists
  };
};

if(typeof exports != 'undefined'){
  exports.playerManagerFactory = playerManagerFactory
}

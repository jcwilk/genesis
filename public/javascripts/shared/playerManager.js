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

  var playerFactory = function(id){
    var data = {};
    var delegate = undefined;
    var toData = function(){
      return {
        id: id,
        data: data
      }
    };
    return {
      id: id,
      toData: toData,
      fromData: function(inData){
        data = inData.data; //TODO: Merge instead of overwrite?
        if(delegate) delegate.fromData({data: data});
        return toData();
      },
      delegate: function(newDelegate){
        delegate = newDelegate;
      }
    };
  }

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

if(typeof exports != 'undefined'){
  exports.playerManagerFactory = playerManagerFactory
}

exports.playerManagerFactory = function(){
  ids = [];
  idAutoInc = 0;
  return {
    create: function(){
      ids.push(idAutoInc);
      return idAutoInc++;
    },
    destroy: function(id){
      index = ids.indexOf(id);
      if(index >= 0){
        ids.splice(index,1);
        return true;
      }
      return false;
    },
    all: function(){
      return ids.slice(0);
    }
  }
};
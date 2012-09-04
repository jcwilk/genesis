// Method to randomy generate the map.
var generateMap = function(roomData) {
  var tile,
      componentString;
  for(var i = 0; i < roomData.tiles.length; i++){
    tile = roomData.tiles[i];
    componentString = '2D, DOM'
    for(var j = 0; j < tile.components.length; j++){
      componentString+= (', '+tile.components[j]);
    }
    Crafty.e(componentString).attr({x: tile.tilePos.x*32, y: tile.tilePos.y*32})
  }
};

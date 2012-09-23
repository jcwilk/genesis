// Method to randomy generate the map.
var generateMap = function(roomData) {
  var tile,
      componentString,
      tilemap,
      tilemapUrls = [];

  for(var i = 0; i < roomData.tilemaps.length; i++){
    tilemapUrls.push(roomData.tilemaps[i].url);
  }

  Crafty.load(tilemapUrls, function(){
    for(var i = 0; i < roomData.tilemaps.length; i++){
      tilemap = roomData.tilemaps[i];

      // Turn the sprite map into usable components
      Crafty.sprite(roomData.tileDimensions.x, tilemap.url, tilemap.components);
    }

    for(var i = 0; i < roomData.tiles.length; i++){
      tile = roomData.tiles[i];
      componentString = '2D, DOM'
      for(var j = 0; j < tile.components.length; j++){
        componentString+= (', '+tile.components[j]);
      }
      componentString+= ', Collision';
      Crafty.e(componentString).attr({x: tile.tilePos.x*roomData.tileDimensions.x, y: tile.tilePos.y*roomData.tileDimensions.y})
    }
  })
};

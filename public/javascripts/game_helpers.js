// Method to randomy generate the map.
var generateMap = function() {
  for (var i = 1; i < 24; i++)
    for (var j = 1; j < 19; j++) {
      grassType = Crafty.math.randomInt(1, 4);
      Crafty.e("2D, DOM, grass" + grassType).attr({x: i * 32, y: j * 32});
    }

  // Create the bushes along the x-axis which will form the boundaries
  for (var i = 0; i < 25; i++) {
    Crafty.e("2D, DOM, Solid, wall_top, dirt").attr({x: i * 32, y: 0}).requires('Collision');
    Crafty.e("2D, DOM, Solid, wall_bottom, dirt").attr({x: i * 32, y: 608}).requires('Collision');
  }

  // Create the bushes along the y-axis
  for (var i = 1; i < 19; i++) {
    Crafty.e("2D, DOM, Solid, wall_left, dirt").attr({x: 0, y: i * 32}).requires('Collision');
    Crafty.e("2D, DOM, Solid, wall_right, dirt").attr({x: 768, y: i * 32}).requires('Collision');
  }
};

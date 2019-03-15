var randomOrder = [];

// This function runs zero or more times per frame depending on the frame rate. It is used to compute anything affected by time - typically physics and AI movements.
// delta is the simulated time in ms
function update(delta) {
    // update FPS
    Isometric.fps = Math.floor(MainLoop.getFPS());


    // for(var i = 0; i < randomOrder.length; i++) {
    //   var pos = randomOrder[i];
    //   // Run tile functions randomly
    //   if (typeof IsometricMap.map[pos.x][pos.y].run === "function" ){
    //     IsometricMap.map[pos.x][pos.y].run(delta);
    //   } else {
    //     var chance = 1;
    //     for (var xi = -1; xi <= 1; xi++) {
    //       for (var yi = -1; yi <= 1; yi++) {
    //         if (IsometricMap.isTileOnMap(pos.x + xi, pos.y + yi) && IsometricMap.map[pos.x + xi][pos.y + yi].tileType == IsometricMap.tiles.Trees[6]) {
    //           chance += 150;
    //         }
    //       }
    //     }
    //
    //     if (rand(1, Parameters.treeGrowthChance) <= chance) {
    //       IsometricMap.map[pos.x][pos.y] = $.extend(true, {}, Tiles.trees);
    //     }
    //   }
    // }
}

// This function should update the screen, usually by changing the DOM or painting a canvas.
function draw() {
  Isometric.redrawTiles();
}

$(document).keypress(function( event ) {
  if ( event.key == "p" ) {
     if (MainLoop.isRunning()) {
        MainLoop.stop();
        Isometric.selectedBlock = undefined;
     } else {
        MainLoop.start();
     }
  }
});

window.addEventListener('blur', function() {
   MainLoop.stop();
   Isometric.selectedBlock = undefined;
});

function rand(min, max) {
  return  Math.floor((Math.random() * (max - min)) + min);
}

function loc(obj) {
  // finds the location of this tile.
  var x = -1;
  var y = -1;
  for (var xi = 0; xi < IsometricMap.map.length; xi++) {
    var yi = IsometricMap.map[xi].indexOf(obj);
    if(yi != -1) {
      x = xi;
      y = yi;
      break;
    }
  }
  return {x: x, y: y};
}

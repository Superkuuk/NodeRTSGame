// For creation of the game map, see 'init' in lobbysockets.js

socket.on('game start', function(){
  $("body").html('<canvas id="isocanvas"></canvas>');
  // Load world, and start loop when ready (callback function)
  Isometric.load(function(){
    MainLoop.setUpdate(update).setDraw(draw).setMaxAllowedFPS().start();
  });
});

socket.on('map update', function(update){
  var tile = update.tile;
  if (update.tile.hasOwnProperty('new')) {
    tile = $.extend(true, {}, update.tile, Tiles[update.tile.new] );
  }
  IsometricMap.map[update.x][update.y] = tile;
});

$(window).on('click', function() {
  if (Isometric.isCursorOnMap() && Isometric.selectedBlock != undefined) {
    var update = {x: Isometric.selectedTileX,
                  y: Isometric.selectedTileY,
                  tile: $.extend(true, {}, Isometric.selectedBlock),
                  room: Isometric.roomname
                 };
    socket.emit('map change', update);

    IsometricMap.map[update.x][update.y] = update.tile;
    // Adds los of this building to the reciever
    if (update.tile.los) {
      for (var xi = -1*update.tile.los; xi <= update.tile.los; xi++) {
        for (var yi = -1*update.tile.los; yi <= update.tile.los; yi++) {
          if (IsometricMap.isTileOnMap(update.x + xi, update.y + yi)) {
            IsometricMap.fog[update.x + xi][update.y + yi] = 'o';
          }
        }
      }
    }

  }
});

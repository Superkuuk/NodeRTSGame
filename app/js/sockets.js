var socket = io();

socket.on('gamelist', function(gamelist_info){
  $("#table_container").empty();
  for (var i = 0; i < gamelist_info.length; i++) {
    gamelist_info[i].room;
    gamelist_info[i].players;
    gamelist_info[i].maxplayers;
    gamelist_info[i].password;
    var playersmaxplayers = gamelist_info[i].players + "/" + gamelist_info[i].maxplayers;
    if (gamelist_info[i].password == "") {
      $("#table_container").append('<div class="roomentry"><div class="pass"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    } else {
      $("#table_container").append('<div class="roomentry"><div class="pass"><img src="icons/lock.png" alt="Password protected"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    }
  }
});

socket.on('init', function(Game){
  Isometric.roomname = Game.roomname;
  IsometricMap.map = Game.map;
  randomOrder = Game.loopOrder;
  for (var xi = 0; xi < IsometricMap.map.length; xi++) {
    IsometricMap.fog.push([]);
    for (var yi = 0; yi < IsometricMap.map.length; yi++) {
      IsometricMap.fog[xi].push('x');
    }
  }

  // Load world, and start loop when ready (callback function)
  Isometric.load(function(){
    MainLoop.setUpdate(update).setDraw(draw).setMaxAllowedFPS().start();
  });

});

socket.on('map update', function(update){
  IsometricMap.map[update.x][update.y] = update.tile;
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

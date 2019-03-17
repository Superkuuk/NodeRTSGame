var socket = io();
var userId = {};

socket.on('connect', function() {
  if ( !(!Object.keys(userId).length) ) {
    console.log('Trying to reconnect...');
    socket.emit('try_reconnection', userId);
  }
});

// Reconnect users which are already in the game
socket.on('try_reconnect', function(newid) {
  if ( !(!Object.keys(userId).length) ) {
    console.log('Reconnection succesful!');
    userId.id = newid;
  } else {
    console.log('Something went wrong with the user id.');
  }
});

socket.on('gamelist', function(gamelist_info){
  $("#table_container").empty();
  for (var i = 0; i < gamelist_info.length; i++) {
    gamelist_info[i].room;
    gamelist_info[i].players;
    gamelist_info[i].maxplayers;
    gamelist_info[i].password;
    var playersmaxplayers = gamelist_info[i].players + "/" + gamelist_info[i].maxplayers;
    if (gamelist_info[i].password == "") {
      $("#table_container").append('<div onclick="joinroom($(this))" class="roomentry" data-room="'+gamelist_info[i].room+'" data-protected="false"><div class="pass"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    } else {
      $("#table_container").append('<div onclick="joinroom($(this))" class="roomentry" data-room="'+gamelist_info[i].room+'" data-protected="true"><div class="pass"><img src="icons/lock.png" alt="Password protected"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    }
  }
});

socket.on('init', function(data){
  $("body").html('<canvas id="isocanvas"></canvas>');
  var Game = data.game;
  userId = data.playerid;
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

socket.on('join error', function(info){
  if (info.error == "password") {
    $( "#promptbox input" ).addClass("error");
    $( "#promptbox input" ).focus();
    alert("You entered the wrong password. Please try again.");
  } else if (info.error == "playername") {
    $( "#playerinfo input[name='player']" ).addClass("error");
    $( "#playerinfo input[name='player']" ).focus();
    alert("This name is already in use. Please pick another name.");
  } else if (info.error == "room") {
    $( "#playerinfo input[name='room']" ).addClass("error");
    $( "#playerinfo input[name='room']" ).focus();
    alert("This room is already in use. Please pick another room name.");
  } else {
    alert ('You entered something wrong. Please try again.');
  }
});

function ok(roomname) {
  var formdata = {
    player: $( "#playerinfo input[name='player']" ).val(),
    room: roomname || $( "#promptbox" ).data("room"),
    password: $( "#promptbox input" ).val(),
    type: $( "#typeOfJoin" ).val()
  }
  socket.emit('join room', formdata);
}

function joinroom(obj) {
  // Check if player name is given
  if ($( "#playerinfo input[name='player']" ).val() == "") {
    $( "#playerinfo input[name='player']" ).addClass("error");
    $( "#playerinfo input[name='player']" ).focus();
  } else {
    if (obj.data("protected")) {
      $( "#promptbox" ).data("room", obj.data("room"));
      $( "#promptboxContainer" ).show(); // password
      $( "#promptbox input" ).focus();
    } else {
      ok(obj.data("room"));
    }
  }
}

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

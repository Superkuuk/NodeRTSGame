var socket = io();
if (typeof(Storage) === "undefined") {
  console.log("sessionStorage is not supported. :(");
  // TODO: Go to information page.
}

function getID() {
  return JSON.parse(sessionStorage.getItem("userId"));
}

function setID(uid) {
  sessionStorage.setItem("userId", JSON.stringify(uid));
}

socket.on('connect', function() {
  if ( !(!Object.keys(JSON.parse(sessionStorage.getItem("userId"))).length) ) {
    console.log('Trying to reconnect...');
    socket.emit('try_reconnection', getID() );
  }
});

// Reconnect users which are already in the game
socket.on('try_reconnect', function(newid) {
  if ( !(!Object.keys(getID()).length) ) {
    console.log('Reconnection succesful!');
    var uid = getID();
    uid.id = newid;
    setID(uid);
  } else {
    console.log('Something went wrong with the user id.');
  }
});

socket.on('gamelist', function(gamelist_info){
  $("#roomentries").empty();
  for (var i = 0; i < gamelist_info.length; i++) {
    var playersmaxplayers = gamelist_info[i].players + "/" + gamelist_info[i].maxplayers;
    if (gamelist_info[i].password == "") {
      $("#roomentries").append('<div onclick="joinroom($(this))" class="roomentry" data-room="'+gamelist_info[i].room+'" data-protected="false"><div class="pass"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    } else {
      $("#roomentries").append('<div onclick="joinroom($(this))" class="roomentry" data-room="'+gamelist_info[i].room+'" data-protected="true"><div class="pass"><img src="icons/lock.png" alt="Password protected"></div><div class="room">'+gamelist_info[i].room+'</div><div class="players">'+playersmaxplayers+'</div></div>');
    }
  }
});

// TODO: Check if this works!
socket.on('lobbylist', function(lobby_players){
  $("#playerlist").empty();
  for (var i = 0; i < lobby_players.length; i++) {
    lobby_players[i];
    $("#playerlist").append('<div class="roomentry">'+lobby_players[i]+'</div>');
  }
});

socket.on('init', function(data){
  $("#startscreen").hide();
  $("#lobby").show();

  var Game = data.game;
  setID(data.playerid);
  if (Game.host != getID().name) $("#startbutton").hide();
  Isometric.roomname = Game.roomname;
  IsometricMap.map = Game.map;
  randomOrder = Game.loopOrder;
  for (var xi = 0; xi < IsometricMap.map.length; xi++) {
    IsometricMap.fog.push([]);
    for (var yi = 0; yi < IsometricMap.map.length; yi++) {
      IsometricMap.fog[xi].push('x');
    }
  }
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
  } else if (info.error == "room length") {
    alert("You are already in a room according to the server. \n You're kicked out of those so you can join this one.");
  } else if (info.error == "host cancel") {
    alert("The host of the game cancelled the game.");
    $( "#playerlist" ).empty();
    $('#lobby').hide();
    $('#startscreen').show();
  } else if (info.error == "full room") {
    alert ('You tried to connect to a full room. Please join another room.');
  } else {
    alert ('You entered something wrong. Please try again.');
  }
});

socket.on('player left lobby', function(player){
  $( "#playerlist div" ).each(function( index ) {
    console.log($(this).html(), player);
    if ($( this ).html() == player) {
      $( this ).remove();
    }
  });
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

/*
=========================
        Modules
=========================
*/
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serverloop = require('./lib/serverloop');
var Parameters = require('./lib/parameters').data;
//var Tiles = require('./lib/tiles').data;


/*
=========================
        Routes
=========================
*/
app.use(express.static('app'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/app/index.html');
});

/*
=========================
        Game
=========================
*/

var GamesList = {};
var PlayerList = {};

function Game(roomname, hostname, maxplayers = 4, password = "") {
  this.roomname = roomname;
  this.players = [hostname];
  this.maxplayers = maxplayers;
  this.password = password;

  this.map = [];
  this.loopOrder = [];
  this.loop = serverloop;
  this.isTileOnMap = function(x, y) {
    var isOnMap = false;
    if (typeof this.map[x] != "undefined") {
      if (typeof this.map[x][y] != "undefined") {
        isOnMap = true;
      }
    }
    return isOnMap;
  }
  this.start = function() {
    // TODO make player objects: resources, ...
    for (var xi = 0; xi < Parameters.worldSize; xi++) {
      this.map.push([]);
      for (var yi = 0; yi < Parameters.worldSize; yi++) {
        this.map[xi].push([]);
        this.loopOrder.push({x: xi, y: yi});
      }
    }
    this.loop.setUpdate(update).start(); // starts this game
  }
}


var update = function(delta) {
  var changes = [];
  // for(var i = 0; i < Game.loopOrder.length; i++) {
  //   var pos = Game.loopOrder[i];
  //   // Run tile functions randomly
  //   if (typeof Game.map[pos.x][pos.y].run === "function" ){
  //     //changes.push(Game.map[pos.x][pos.y].run(delta));
  //   } else {
  //     var chance = 1;
  //     for (var xi = -1; xi <= 1; xi++) {
  //       for (var yi = -1; yi <= 1; yi++) {
  //         if (Game.isTileOnMap(pos.x + xi, pos.y + yi) && Game.map[pos.x + xi][pos.y + yi].growth == 6) {
  //           chance += 150;
  //         }
  //       }
  //     }
  //
  //     if (rand(1, Parameters.treeGrowthChance) <= chance) {
  //       Game.map[pos.x][pos.y] = $.extend(true, {}, Tiles.trees);
  //       changes.push({x: pos.x, y: pos.y, tile: Game.map[pos.x][pos.y]});
  //     }
  //   }
  // }
}

/*
=========================
        Sockets
=========================
*/
function sendGamelist() {
  // Sending Games
  var gamelist_info = [];
  for (var game in GamesList) {
    if (GamesList.hasOwnProperty(game)) {
      gamelist_info.push({room: game,
                          players: GamesList[game].players.length,
                          maxplayers: GamesList[game].maxplayers,
                          password: GamesList[game].password
                        });
    }
  }
  io.emit('gamelist', gamelist_info);
}

io.on('connection', function(socket){
  console.log('a user connected');
  sendGamelist();

  socket.on('disconnect', function(){
    console.log('user disconnected');
    //TODO: remove player from game
  });

  socket.on('map change', function(update){
    GamesList[update.room].map[update.x][update.y] = update.tile;
    socket.to(update.room).emit('map update', update);
  });

  socket.on('join room', function(info){
    if (PlayerList[info.player]) {
      // There is already a player with this name, pick a new name!
      info.error = "playername";
      socket.emit('join error', info);
    } else {
      if (info.type == "join") {
        if (GamesList[info.room].password == info.password) {
          console.log(info.player + " joins room " + info.room);
          GamesList[info.room].players.push(info.player);

          PlayerList[info.player] = socket.id;
          socket.join(info.room);
          io.emit('init', GamesList[info.room]);
          sendGamelist();
        } else {
          // Wrong password for this room!
          console.log(info.player + " tried to connect to room "+ info.room +", with wrong password.");
          info.error = "password";
          socket.emit('join error', info);
        }
      } else if (info.type == "host") {
        if (GamesList[info.room]) {
          // There already exists a room with this name.
          info.error = "room";
          socket.emit('join error', info);
        } else {
          console.log(info.player + " makes a new room: " + info.room);
          // TODO: Encrypt passwords
          GamesList[info.room] = new Game(info.room, info.player, info.maxplayers, info.password);
          // TODO: start when all players are present
          GamesList[info.room].start();

          PlayerList[info.player] = socket.id;
          socket.join(info.room);
          socket.emit('init', GamesList[info.room]);
          sendGamelist();
        }
      } else {
        info.error = "other";
        socket.emit('join error', info);
      }
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

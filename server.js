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
var params = require('./lib/parameters');
var Parameters = params.data;
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
  this.host = hostname;

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
  this.makeWorld = function() {
    for (var xi = 0; xi < Parameters.worldSize; xi++) {
      this.map.push([]);
      for (var yi = 0; yi < Parameters.worldSize; yi++) {
        this.map[xi].push([]);
        this.loopOrder.push({x: xi, y: yi});
      }
    }
  }
  this.start = function() {
    // TODO make player objects: resources, ...
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
      Lobby sockets
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
  console.log('a user connected with id ' + socket.id);
  socket.getRooms = function() {
    return Object.keys(this.rooms).filter(item => item!=this.id);
  };
  socket.clearRooms = function() {
    while (this.getRooms().length > 0) {
      socket.leave(this.getRooms()[0]);
    }
  }
  sendGamelist();

  socket.on('disconnect', function(reason){
    console.log('user disconnected with id ' + socket.id + " for reason: " + reason);
    //TODO: remove player from game
    if (reason == "transport close") {
      // user closed connection themselves (closed window, reloaded a window)
    }
  });

  socket.on('try_reconnection', function(userId) {
    if (PlayerList[userId.name] && PlayerList[userId.name] == userId.id) {
      console.log(userId.name + " is reconnected with new id " + socket.id);
      PlayerList[userId.name] = socket.id;
      PlayerList[socket.id] = userId.name;
      socket.emit('try_reconnect', socket.id);
      // TODO: If a player is reconnected, put him again in the game.
    }
  });

  socket.on('host start', function(){
    // Checks if player is the host of the game he is in.
    if (GamesList[socket.getRooms()[0]].host == PlayerList[socket.id]){
      io.to(socket.getRooms()[0]).emit("game start");
      GamesList[socket.getRooms()[0]].start();
    }
  });

  socket.on('lobby quit', function(){
    if (GamesList[socket.getRooms()[0]].host == PlayerList[socket.id]) {
      // When the user who quits is the host.
      var room = socket.getRooms()[0];
      io.in(room).clients((error, clients) => {
        if (error) throw error;
        clients.forEach(socketId => {
          io.sockets.sockets[socketId].leave(room);
          var info = {error: "host cancel"};
          io.sockets.sockets[socketId].emit('join error', info);
          var player = PlayerList[socketId];
          delete PlayerList[socketId];
          delete PlayerList[player];
        });

      });
      delete GamesList[room];
    } else {
      var players = GamesList[socket.getRooms()[0]].players;
      for( var i = 0; i < players.length; i++){
         if ( players[i] == PlayerList[socket.id]) {
           GamesList[socket.getRooms()[0]].players.splice(i, 1);
           break;
         }
      }
      var room = socket.getRooms()[0];
      socket.leave(room, function(){
        io.to(room).emit('player left lobby', PlayerList[socket.id]);
        var player = PlayerList[socket.id];
        delete PlayerList[socket.id];
        delete PlayerList[player];
      });

    }
    sendGamelist();
  });

  socket.on('join room', function(info){
    if (PlayerList[info.player]) {
      // There is already a player with this name, pick a new name!
      info.error = "playername";
      socket.emit('join error', info);
    } else {
      if (info.type == "join") {
        if (GamesList[info.room].maxplayers > GamesList[info.room].players.length) {
          if (GamesList[info.room].password == info.password) {
            console.log(info.player + " joins room " + info.room);
            GamesList[info.room].players.push(info.player);

            PlayerList[info.player] = socket.id;
            PlayerList[socket.id] = info.player;
            if (socket.getRooms().length > 0) {
              info.error = "room length";
              socket.emit('join error', info);
              socket.clearRooms();
            }
            socket.join(info.room, function(){
              var sendData = { game: GamesList[info.room],
                               playerid: { name: info.player,
                                           id: socket.id
                                         },
                               parameters: params.clientdata
                              }
              socket.emit('init', sendData);
              io.to(socket.getRooms()[0]).emit('lobbylist', GamesList[info.room].players);
              sendGamelist();
            });
          } else {
            // Wrong password for this room!
            console.log(info.player + " tried to connect to room "+ info.room +", with wrong password.");
            info.error = "password";
            socket.emit('join error', info);
          }
        } else {
          // Too many players in this room!
          console.log(info.player + " tried to connect to full room "+ info.room);
          info.error = "full room";
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
          GamesList[info.room].makeWorld();
          PlayerList[info.player] = socket.id;
          PlayerList[socket.id] = info.player;
          if (socket.getRooms().length > 0) {
            info.error = "room length";
            socket.emit('join error', info);
            socket.clearRooms();
          }
          socket.join(info.room, function(){
            var sendData = { game: GamesList[info.room],
                             playerid: { name: info.player,
                                         id: socket.id
                                       },
                             parameters: params.clientdata
                            }
            socket.emit('init', sendData);
            io.to(socket.getRooms()[0]).emit('lobbylist', GamesList[info.room].players);
            sendGamelist();
          });
        }
      } else {
        info.error = "other";
        socket.emit('join error', info);
      }
    }
  });


/*
=========================
     In-play sockets
=========================
*/
  socket.on('map change', function(update){
    GamesList[update.room].map[update.x][update.y] = update.tile;
    socket.to(update.room).emit('map update', update);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

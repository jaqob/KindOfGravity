var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var playerId=1;
var players = [];
var games = [];

app.use('/js', express.static(path.join(__dirname, '/public/js')));
app.use('/css', express.static(path.join(__dirname, '/public/css')));
app.use('/lib', express.static(path.join(__dirname, '/public/lib')));
app.use('/textures', express.static(path.join(__dirname, '/public/textures')));
app.use('/levels', express.static(path.join(__dirname, '/public/levels')));

app.get('/game:tagId', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
  console.log("TEST");
});

app.get('/join', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
  console.log("TEST" + req.params.tagId);
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
  console.log("TEST" + req.params.tagId);
});


io.on('connection', function (socket)
{
          //TODO how to handle disconnecting users?
          console.log('connected');
          //socket.id=playerId++;
          

          socket.on('started', function (msg)
          {
            console.log('message: ' + msg);

          }
          );


socket.on('createServer', function (msg)
{
  console.log("createServer start");
  
  var obj = JSON.parse(msg);
  
  var gameId = games.length;
  games[gameId] = new Game(gameId);
  games[gameId].player1SocketId = socket.id;
  games[gameId].level = obj.levelNr;
  console.log("createGame: " + games[gameId].id + " " + socket.id);
  socket.emit("gameId", games[gameId].id);
}
);		  
		  
		  
socket.on('createGame', function (msg)
{
  console.log("createGame start");
  for(var index = 0; index < games.length; index++)
  {
    if(socket.id == games[index].player1SocketId)// || socket.id == games[index].player2SocketId)
    {
		var obj = JSON.parse(msg);
		games[index].levelModifier = obj.levelModifier;
		if(games[index].player2SocketId != "")
		{
			io.to(games[index].player2SocketId).emit('loadGame', games[index]);
		}
  }
  }		
}
);


socket.on('gameUpdate', function (msg)
{
            //TODO send only to correct socket
            socket.broadcast.emit('gameUpdateToAll', msg);
          }
          );


socket.on('levelEnded', function (msg)
{
  console.log("levelEnded " + msg );
  for(var index = 0; index < games.length; index++)
  {
    if(socket.id == games[index].player1SocketId)// || socket.id == games[index].player2SocketId)
    {
      console.log(games[index].level);
      if(msg == games[index].level)
      {
      //games[index].level++;
      //io.to(games[index].player1SocketId).emit('startGame', games[index].level);
      //io.to(games[index].player2SocketId).emit('startGame', games[index].level);
    }
    }
  }
  //socket.broadcast.emit('gameUpdateToAll', msg);
}
);


socket.on('playerDied', function (msg)
{
  for(var index = 0; index < games.length; index++)
  {
    if(socket.id == games[index].player1SocketId)
    {      

      //io.to(games[index].player1SocketId).emit('startGame', games[index].level);
       this.player2Wins++; 
      io.to(games[index].player2SocketId).emit('winner', null);
    }
    else if(socket.id == games[index].player2SocketId) 
    {
       this.player1Wins++;
 io.to(games[index].player1SocketId).emit('winner', null);
    
    }

      io.to(games[index].player1SocketId).emit('levelEnded', games[index]);
      io.to(games[index].player2SocketId).emit('levelEnded', games[index]);

    }
  
}
);


socket.on('joinGame', function (msg)
{
  console.log("Joining " + msg);
  for(var index = 0; index < games.length; index++)
  {
    if(msg==games[index].id)
    {
      if(games[index].player2SocketId == "")
      {
        games[index].player2SocketId = socket.id;
        console.log(games[index]);

		/*
        io.to(games[index].player1SocketId).emit('startGame', games[index].level);
        io.to(games[index].player2SocketId).emit('startGame', games[index].level);
		*/
		 io.to(games[index].player2SocketId).emit('loadGame', games[index]);
		
      }
      else if(games[index].player2SocketId == socket.id)
      {
        console.log("Next Match");
		 io.to(games[index].player2SocketId).emit('loadGame', games[index]);
      }
      else
      {
       console.log("Game already started"); 
     }
     break;
   }
 }
}
);


socket.on('readyGame', function (msg)
{
  console.log("readyGame " + msg);
  for(var index = 0; index < games.length; index++)
  {
	if(games[index].player2SocketId == socket.id)
      {
       console.log(games[index]);

        io.to(games[index].player1SocketId).emit('startGame', "");
        io.to(games[index].player2SocketId).emit('startGame', "");
	
      }
     break;
   }
}
);

}
);

http.listen(process.env.PORT || 3000, function ()
{
  console.log('listening on ' + (process.env.PORT || 3000));
}
);





function Game(id){
  this.id = id;
  this.player1SocketId = "";
  this.player2SocketId = "";
  this.player1Wins = 0;
  this.player2Wins = 0;
  this.level=0;
  this.levelModifier= "";
}

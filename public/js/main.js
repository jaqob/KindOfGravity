"use strict";
/// <reference path="lib/pixi.js.d.ts"/>
(function ()
{
    // Global variables
    var BOUNCE_FACTOR = 0.6,
    //var BOUNCE_FACTOR = 1,
    LEVEL_WIDTH = 1024,
    LEVEL_HEIGHT = 512,
    INFO_HEIGHT = 50;

    var data,
    jsonData,
    keyMap = [],
    lastTimeCount,
    count = 0,
    player,
    otherPlayer = [],
    otherBullets = [],
    lastTime,
    currentLevel,
    healthBar,
    text,
    loadText,
    winnerText,
    collectedText = [],
    outerStage,
    loadingStage,
    infoStage,
    stage,
    gameLoop,
    loadingBackground,
    remotePlayerJoined,
    exportedDataTimes,
    logoSprite,
    currentLevelNumber=0,  
    multiplayer,
    collectedByOtherPlayer = 0;





var socket = io();
console.log("socket " + socket);
  

    var tempCollisionTimer;

    var time = [];

    var renderer = PIXI.autoDetectRenderer(
        LEVEL_WIDTH,
        LEVEL_HEIGHT + INFO_HEIGHT,
        {
            view : document.getElementById("game-canvas")
        }
        );

    loadTextures();

    function loadTextures()
    {
        //Load textures
        console.log("Downloading Textures");
        PIXI.loader.add('spriteSheet', "textures/mapSpritesheet.json?v=0.1");
        PIXI.loader.add('bullet3x3', "textures/bullet3x3.png");
        PIXI.loader.add('ship16x24blue', "textures/ship16x24blue.png");
        PIXI.loader.add('ship16x24bluefire', "textures/ship16x24bluefire.png");
        PIXI.loader.add('ship16x24red', "textures/ship16x24red.png");
        PIXI.loader.add('ship16x24redfire', "textures/ship16x24redfire.png");
        PIXI.loader.add('logo', "textures/logo.png");
        PIXI.loader.add('gold1', "textures/gold1.png");
        PIXI.loader.add('gold2', "textures/gold2.png");
        PIXI.loader.add('gold3', "textures/gold3.png");
        PIXI.loader.add('gold4', "textures/gold4.png");
        PIXI.loader.once('complete', init);
        PIXI.loader.load();
    }


    function init()
    {
        data = null,
        jsonData = null,
        keyMap = [],
        lastTimeCount = null,
        count = 0,
        player = null,
        otherPlayer = [],
        otherBullets = [],
        lastTime = null,
        currentLevel = null,
        healthBar = null,
        text,
        loadText = null,
        winnerText = null,
        collectedText = [],
        exportedDataTimes = 0,
        outerStage = new PIXI.Container(0x000000),
        loadingStage = new PIXI.Container(0x000000),
        infoStage = new PIXI.Container(0x000000),
        stage = new PIXI.Container(0x000000),
        gameLoop = null,
        loadingBackground = new PIXI.Graphics(),
        multiplayer = false,
        collectedByOtherPlayer = 0;

        loadingBackground = new PIXI.Graphics();
        loadingBackground.beginFill(0x000000);
        loadingBackground.drawRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT + INFO_HEIGHT);

        loadingStage.addChild(loadingBackground);
        outerStage.addChild(loadingStage);
        loadText = new PIXI.Text("Loading textures",
        {
            font : "15px Arial",
            fill : "red",
        }
        );
        loadText.position.y = 25;
        loadText.position.x = 8;
        loadingStage.addChild(loadText);
        renderer.render(outerStage);

        console.log("Loading Textures");
        loadText.text += " - Done\n"
        logoSprite = new PIXI.Sprite(PIXI.loader.resources['logo'].texture);
        logoSprite.position.x = (LEVEL_WIDTH / 2) - (logoSprite.width / 2);
        logoSprite.position.y = 100;
        loadingStage.addChild(logoSprite);
        renderer.render(outerStage);



                var pathname = window.location.pathname; // Returns path only
    var url      = window.location.href;     // Returns full URL
    
    console.log("pathname: " + pathname);
    console.log("url: " + url);
    
    console.log("server: "  + getQueryVariable("server"));

    if(pathname=="/join")
    {
        console.log("match");
        $("#levelDiv").hide();
        joinMultiplayer(getQueryVariable("server"));
    }



}




function loadLevelData(levelNr)
{
    loadText.text = "Level " + currentLevelNumber;
    loadText.text += "Downloading Level Data"

    $.ajax(
    {
        type : 'GET',
        url : 'levels/Level' + levelNr + '.json?v=0.2',
        data : data,
        async : true,
        dataType : 'json',
        success : function (data)
        {
            jsonData = data;
            loadText.text += " - Done\n"
            renderer.render(outerStage);
            initLevel();
        },
        error : function (data)
        {
            jsonData = data;
            loadText.text += " - Fail\n"
            renderer.render(outerStage);
        }
    }
    );
}

function clearStages()
{

        outerStage.removeChild(stage);
        outerStage.removeChild(infoStage);
        stage.removeChild(currentLevel);
        stage.removeChild(player);
        infoStage.removeChild(healthBar);
        stage.destroy();
        infoStage.destroy();
        //loadingStage.destroy();
        outerStage.destroy();
}

function initLevel()
{
        clearStages();
        outerStage = new PIXI.Container(0x000000);
        //loadingStage = new PIXI.Container(0x000000);
        infoStage = new PIXI.Container(0x000000);
        stage = new PIXI.Container(0x000000);

        //Only works if data is loaded
        LEVEL_WIDTH = jsonData.spritesWidth * 8;
        LEVEL_HEIGHT = jsonData.spritesHeight * 8;
        document.getElementById("game-canvas").width = LEVEL_WIDTH;
        document.getElementById("game-canvas").height = LEVEL_HEIGHT + INFO_HEIGHT;
        renderer.resize(LEVEL_WIDTH, LEVEL_HEIGHT + INFO_HEIGHT);
        loadingBackground.clear();
        loadingBackground.beginFill(0x000000);
        loadingBackground.drawRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT + INFO_HEIGHT);

        loadText.text += "Processing Level"
        renderer.render(outerStage);
        currentLevel = new Level(jsonData);
        outerStage.removeChild(loadingStage);
        outerStage.addChild(stage);
        stage.addChild(currentLevel);

        loadText.text += "- Done\n"
        renderer.render(outerStage);
        outerStage.addChild(loadingStage);
        loadingStage.alpha = 0.9;
        renderer.render(outerStage);

        addPlayers();
    }

    function addPlayers()
    {
        loadText.text += "Adding Players - Done\n"
        outerStage.removeChild(loadingStage);
        infoStage.position.y = LEVEL_HEIGHT;


        outerStage.addChild(infoStage);



        healthBar = new HealthBar(8, infoStage);
        player = new Player(jsonData.player1StartX, jsonData.player1StartY, currentLevel.realWidth, currentLevel.realHeight, "blue", stage);
        collectedByOtherPlayer=0;

        for(var index = 0; index < 10; index++)
        {
            otherPlayer[index] = new Player(-10, -10, currentLevel.realWidth, currentLevel.realHeight, "red", stage);
            otherBullets[index] = new Bullets(null, 0, 0);
            for(var index2 = 0; index2 < 50; index2++)
            {
               otherBullets[index].bullet[index2] = new Bullet(0, 0, 0, 0, 0, 0, 0);
               otherBullets[index].bullet[index2].position.x = -10;
               otherBullets[index].bullet[index2].position.y = -10;
               stage.addChild(otherBullets[index].bullet[index2]);
           }
       }



       collectedText[0] = new PIXI.Text("" + player.collected + " / " + currentLevel.toCollect,
       {
        font : "15px Arial",
        fill : "yellow",
    }
    );
       collectedText[0].position.x = 8;
       collectedText[0].position.y = 25;
       infoStage.addChild(collectedText[0]);

       outerStage.removeChild(loadingStage);
       outerStage.addChild(loadingStage);
       loadingStage.alpha = 0.9;
       renderer.render(outerStage);
       startGame();
   }

   function startGame()
   {
    if (text)
    {
        infoStage.removeChild(text);
    }


    text = new PIXI.Text("FPS: 0",
    {
        font : "15px Arial",
        fill : "red",
    }
    );
    text.position.y = 25;
    text.position.x = 200;
    infoStage.addChild(text);

    lastTimeCount = performance.now();
    lastTime = performance.now() - 16;
    outerStage.removeChild(loadingStage);
    outerStage.removeChild(winnerText);
    gameLoop=update;
    gameLoop();
}



function update()
{
	//	testFunction();

    var dT = performance.now() - lastTime;
    lastTime = performance.now();

    var dTfactor = dT / (1000 / 60);

        //If FPS lower than 6
        if (dTfactor > 10)
        {
            dTfactor = 10;
        }

        count++;
        var since = performance.now() - lastTimeCount;
        if (since >= 1000)
        {
            lastTimeCount = performance.now();
            text.text = "FPS: " + count;
            count = 0;

            //console.log("Collsion Timer: "  + (tempCollisionTimer/60));
            tempCollisionTimer = 0;

        }

        time[0] = (performance.now() - lastTime);

        //Player 1
        handleHealth(0);
        collectedText[0].text = "" + player.collected + " / " + currentLevel.toCollect + " (-" + collectedByOtherPlayer + ")";

        //UP
        if (keyMap[38])
        {
            player.accelerate();
        }
        else
        {
            player.stopAccelerate();
        }
        //SPACE
        if (keyMap[17])
        {
            if (player.bullets.coolDown < 1)
            {
                player.bullets.addBullet(stage);
            }
        }
        player.bullets.coolDown -= 1 * dTfactor;

        if (keyMap[39])
        {
            player.rotateLeft(dTfactor);
        }
        if (keyMap[37])
        {
            player.rotateRight(dTfactor);
        }

        etcUpdate(0, dTfactor);

        exportData();

        if(player.collected >= (currentLevel.toCollect-collectedByOtherPlayer))
        {
           console.log("out " + player.collected + " " + currentLevel.toCollect);
           gameLoop=levelEnded;
       }

       renderer.render(outerStage);
        //setTimeout(gameLoop, 5);
        requestAnimationFrame(gameLoop);
    }


    function gameOver()
    {}

    function startSinglePlayer()
    {
      nextLevel();
  }

  function levelEnded()
  {
     outerStage.addChild(loadingStage);
     loadingStage.addChild(logoSprite);
     outerStage.removeChild(winnerText);
     winnerText = new PIXI.Text("Waiting for next level",
     {
        font : "20px Arial",
        fill : "red",
    }
    );
     winnerText.position.y = 300;
     winnerText.position.x = (outerStage.width/2)-(winnerText.width/2);
     loadText.text = "Loading next level";

     outerStage.addChild(winnerText);
     renderer.render(outerStage);
     console.log("levelEnded " + currentLevelNumber);
     socket.emit("levelEnded", currentLevelNumber);
 }

 function startMultiPlayer()
 {
    console.log("CreateGame");
    
    multiplayer=true;
    outerStage.addChild(loadingStage);
    loadingStage.addChild(logoSprite);
    winnerText = new PIXI.Text("Waiting for a second player",
    {
        font : "20px Arial",
        fill : "red",
    }
    );
    winnerText.position.y = 300;
    winnerText.position.x = (outerStage.width/2)-(winnerText.width/2);
    loadText.text = "Waiting for server"
    outerStage.addChild(winnerText);
    renderer.render(outerStage);
    console.log("socket " + socket.connected);
    socket.emit('createGame', "null");
		//nextLevelStart();
	}

    function joinMultiplayer(serverId)
    {
        socket.emit('joinGame', serverId);

        multiplayer=true;
        outerStage.addChild(loadingStage);
        loadingStage.addChild(logoSprite);
        winnerText = new PIXI.Text("Joining game " + serverId,
        {
            font : "20px Arial",
            fill : "red",
        }
        );
        winnerText.position.y = 300;
        winnerText.position.x = (outerStage.width/2)-(winnerText.width/2);
        loadText.text = "Waiting for server"
        outerStage.addChild(winnerText);
        renderer.render(outerStage);
    }



    function startLevel(levelNr)
    {
        // outerStage.removeChild(loadingStage);
        outerStage.addChild(loadingStage);
        loadingStage.addChild(logoSprite);
        outerStage.removeChild(winnerText);
        winnerText = new PIXI.Text("Starting",
        {
            font : "20px Arial",
            fill : "red",
        }
        );
        winnerText.position.y = 300;
        winnerText.position.x = (outerStage.width/2)-(winnerText.width/2);
        loadText.text = "Loading next level";

        outerStage.addChild(winnerText);
        renderer.render(outerStage);
            //loadLevelData(1);
        setTimeout(loadLevelData, 1000, levelNr);   
        //requestAnimationFrame(gameLoop);
    }


/*
	function nextLevel()
	{
		// outerStage.removeChild(loadingStage);
       outerStage.addChild(loadingStage);
       loadingStage.addChild(logoSprite);
       outerStage.removeChild(winnerText);
       winnerText = new PIXI.Text("Starting",
       {
        font : "20px Arial",
        fill : "red",
    }
    );
       winnerText.position.y = 300;
       winnerText.position.x = (outerStage.width/2)-(winnerText.width/2);
       loadText.text = "Loading next level";

       outerStage.addChild(winnerText);
       renderer.render(outerStage);
			//loadLevelData(1);
        setTimeout(nextLevelStart, 1000);	
        //requestAnimationFrame(gameLoop);
    }


    function nextLevelStart()
    {
        currentLevelNumber++;
        loadText.text = "Level " + currentLevelNumber;
        loadLevelData(currentLevelNumber);
    }


    */
    function exportData()
    {
      if(multiplayer)
      {
          exportedDataTimes++;
          var obj = new Object();
          obj.pX = Math.round(player.position.x);
          obj.pY = Math.round(player.position.y);
          obj.pR = player.rotation;
          obj.pA = player.acceleration;

		//Send the whole data once every second.
		if(exportedDataTimes < 60)
		{
            obj.removedTiles = currentLevel.removedDelta;
        }
        else
        {
            obj.removedTiles = currentLevel.removedFull;
            exportedDataTimes=0;
        }
        obj.collected = currentLevel.collectedFull;
        obj.bullets = player.bullets.export();
        var jsonString = JSON.stringify(obj);
        //console.log("exportData: " + jsonString);
        socket.emit('gameUpdate', jsonString);

        currentLevel.removedDelta.length=0;
    }

}

function handleHealth(playerNr)
{
    if (player.health < 1)
    {
        healthBar.setHealth(0);
        stage.alpha /= 2;

        winnerText = new PIXI.Text("The End",
        {
            font : "20px Arial",
            fill : "red",
        }
        );
        winnerText.position.y = 20;
        winnerText.position.x = 500;
        infoStage.addChild(winnerText);
        gameLoop = gameOver;
    }
    else
    {
        healthBar.setHealth(player.health);
    }
}

function etcUpdate(playerNr, dTfactor)
{
    player.update(dTfactor);
    player.bullets.update(stage, dTfactor);
    var before = performance.now();
    collisionHandling2(currentLevel, player, dTfactor);
    bulletCollision2(currentLevel, player.bullets);
    tempCollisionTimer += (performance.now() - before);
        //console.log("collisionHandling Time: " + (performance.now()-before));
    }

    function bulletCollision2(level, bullets)
    {

        for (var bulletIndex = 0; bulletIndex < bullets.bullet.length; bulletIndex++)
        {

            if (!bullets.bullet[bulletIndex])
            {
                continue;
            }

            for (var currentIndex = 0; currentIndex < level.spriteChart.length; currentIndex++)

            {
                if (level.spriteChart[currentIndex])
                {
                    if (level.spriteChart[currentIndex])
                    {
                        var bX = bullets.bullet[bulletIndex].position.x;
                        if (((bullets.bullet[bulletIndex].position.y + bullets.bullet[bulletIndex].height <= level.spriteChart[currentIndex].position.y) ||
                            (bullets.bullet[bulletIndex].position.y >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                            (bX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                            (bX + bullets.bullet[bulletIndex].width <= level.spriteChart[currentIndex].position.x)) === false)
                        {
                           if(level.spriteChart[currentIndex].collectable != 1)
                           {
                            bullets.removeBullet(bulletIndex, stage);
                            level.hitTile(currentIndex);
                            break;
                        }
                    }
                }
            }

        }
    }

};

function bulletCollisionPlayer(player, bullets)
{
    var hit = false;
    for (var bulletIndex = 0; bulletIndex < bullets.bullet.length; bulletIndex++)
    {
        hit = false;
        if (!bullets.bullet[bulletIndex])
        {
            continue;
        }
        var bX = bullets.bullet[bulletIndex].position.x;
        if (((bullets.bullet[bulletIndex].position.y + bullets.bullet[bulletIndex].height <= player.getRealY()) ||
            (bullets.bullet[bulletIndex].position.y >= player.getRealY() + player.height) ||
            (bX >= player.getRealX() + player.width) ||
            (bX + bullets.bullet[bulletIndex].width <= player.getRealX())) === false)
        {
            bullets.removeBullet(bulletIndex, stage);
            player.hit();

            break;
        }
    }
};

function collisionHandling2(level, player, dTfactor)
{
    var playerRealX = player.getRealX();
    var playerRealY = player.getRealY();
    var currentIndex;

        //console.log(level.spriteChart.length + " vs " + (level.nrSpritesWidth*level.nrSpritesHeight));

        for (var currentIndex = 0; currentIndex < level.spriteChart.length; currentIndex++)
        {
            if (level.spriteChart[currentIndex])
            {
                if (((playerRealY + player.shipHeight <= level.spriteChart[currentIndex].position.y) ||
                    (playerRealY >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                    (playerRealX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                    (playerRealX + player.width <= level.spriteChart[currentIndex].position.x)) === false)
                {
                    if (level.spriteChart[currentIndex].collectable === 1)
                    {
                        level.collect(currentIndex);
                        player.collected++;
                    }
                    else
                    {

                        var w = (player.width + level.spriteChart[currentIndex].width) / 2;
                        var h = (player.shipHeight + level.spriteChart[currentIndex].height) / 2;
                        var dx = player.position.x - (level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width / 2);
                        var dy = player.position.y - (level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height / 2);

                        player.velocity_y = player.velocity_y * -0.1;
                        player.velocity_x = player.velocity_x * -0.1;
                        while (((playerRealY + player.shipHeight <= level.spriteChart[currentIndex].position.y) ||
                            (playerRealY >= level.spriteChart[currentIndex].position.y + level.spriteChart[currentIndex].height) ||
                            (playerRealX >= level.spriteChart[currentIndex].position.x + level.spriteChart[currentIndex].width) ||
                            (playerRealX + player.width <= level.spriteChart[currentIndex].position.x)) === false)
                        {
                            player.updatePosition(dTfactor);
                            playerRealX = player.getRealX();
                            playerRealY = player.getRealY();
                        }
                        //Reduce the risk to get stuck by moving one more step
                        player.updatePosition(dTfactor);
                        player.velocity_y = player.velocity_y * -10;
                        player.velocity_x = player.velocity_x * -10;

                        var wy = w * dy;
                        var hx = h * dx;

                        if (wy > hx)
                        {
                            if (wy > -hx)
                            {
                                //console.log("UP");
                                player.velocity_y = player.velocity_y * -BOUNCE_FACTOR;
                                player.velocity_x = player.velocity_x * BOUNCE_FACTOR;
                                player.hit();

                            }
                            else
                            {
                                //console.log("LEFT");
                                player.velocity_x = player.velocity_x * -BOUNCE_FACTOR;
                                player.velocity_y = player.velocity_y * BOUNCE_FACTOR;
                                player.hit();
                            }
                        }
                        else
                        {
                            if (wy > -hx)
                            {
                                //console.log("RIGHT");
                                player.velocity_x = player.velocity_x * -BOUNCE_FACTOR;
                                player.velocity_y = player.velocity_y * BOUNCE_FACTOR;
                                player.hit();
                            }
                            else
                            {

                                player.velocity_y = player.velocity_y * -BOUNCE_FACTOR;
                                player.velocity_x = player.velocity_x * BOUNCE_FACTOR;
                                if (Math.abs(Math.sin(player.rotation)) > 0.4)
                                {
                                    player.hit();

                                }
                            }
                        }
                    }
                    break;
                }
            }

        }
    };

    document.onkeyup = document.onkeydown = function (e)
    {
        keyMap[e.keyCode] = e.type == 'keydown';
        //console.log("UP:" + map[38] + " DOWN:" + map[40] + " LEFT:" + map[39] + " RIGHT:" + map[37]);
    }


    $('#1p').on('change', function (event)
    {
        event.preventDefault(); // To prevent following the link (optional)
        console.log("1p");
        $("#start").prop('disabled', false);

        multiplayer=false;
        startSinglePlayer();

    }
    );

    $('#2p').on('change', function (event)
    {
        event.preventDefault(); // To prevent following the link (optional)
        console.log("2p");
        $("#start").prop('disabled', false);        
        startMultiPlayer();
    }
    );


    socket.on('startGame', function (levelNr)
    {
        //TODO get socket id from server
        currentLevelNumber=levelNr;
        startLevel(levelNr);
    }
    );


    socket.on('gameUpdateToAll', function (msg)
    {
		//TODO get socket id from server
		var id = 1;
		handleGameDataFromServer(msg, otherPlayer[1], otherBullets[1]);
    }
    );



   socket.on('gameId', function (msg)
    {
        console.log("gameId " + msg);
        document.getElementById("gameId").textContent="URL to join: https://kindofgravity.herokuapp.com/join?server=" + msg;
    }
    );



    function handleGameDataFromServer(msg, player, bullets)
    {
		        //console.log("update " + msg );'
                if(gameLoop == update)
                {
                    var obj = JSON.parse(msg);
                    player.position.x = obj.pX;
                    player.position.y = obj.pY;
                    player.rotation = obj.pR;
                    if (obj.pA > 0)
                    {
                        player.texture = player.shipTextureFire;
                    }
                    else
                    {
                        player.texture = player.shipTexture;
                    }

                    for (var index = 0; index < obj.removedTiles.length; index++)
                    {
                        currentLevel.deleteTile(obj.removedTiles[index]);
                    }

                    collectedByOtherPlayer=obj.collected.length;

                    for (var index = 0; index < obj.collected.length; index++)
                    {
                        currentLevel.deleteTile(obj.collected[index]);
                    }

                    for(var index = 0; index < bullets.bullet.length; index++)
                    {
                     bullets.bullet[index].position.x = -10;
                     bullets.bullet[index].position.y = -10;
                 }
                 for (var index = 0; index < obj.bullets.length; index++)
                 {
				//console.log(obj.bullets[index].x);
                bullets.bullet[index].position.x = obj.bullets[index].x;
                bullets.bullet[index].position.y = obj.bullets[index].y;
            }
        }
    }

    function testFunction()
    {
      var obj = {"pX":153,"pY":327,"pR":-0.314080725542665,"pA":0,"removedTiles":[306,302,303,259,258,301,161,162,34,163,164,580,271,356,616,412,668,732,820,880,970,1220,1307,1298,1180,1150,1114,1115,1151,1260,1279,1221,925,940,1261,955,1181,808,699,309,150,308,264,307],"bullets":[{"x":69,"y":69},{"x":87,"y":125},{"x":104,"y":178},{"x":122,"y":231},{"x":139,"y":285}]};
      var jsonString = JSON.stringify(obj);
      handleGameDataFromServer(jsonString, otherPlayer[1], otherBullets[1]);

      obj = {"pX":253,"pY":327,"pR":0.314080725542665,"pA":0.01,"removedTiles":[306,302,303,259,258,301,161,162,34,163,164,580,271,356,616,412,668,732,820,880,970,1220,1307,1298,1180,1150,1114,1115,1151,1260,1279,1221,925,940,1261,955,1181,808,699,309,150,308,264,307],"bullets":[{"x":69,"y":69},{"x":87,"y":125},{"x":104,"y":178},{"x":122,"y":231},{"x":139,"y":285}]};
      jsonString = JSON.stringify(obj);
      handleGameDataFromServer(jsonString, otherPlayer[2], otherBullets[2]);
  }


  function getQueryVariable(variable)
  {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
       var pair = vars[i].split("=");
       if(pair[0] == variable){return pair[1];}
   }
   return(false);
}

}
)
();

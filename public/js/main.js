"use strict";
/// <reference path="lib/pixi.js.d.ts"/>

// Global variables
var BOUNCE_FACTOR = 0.6,
//var BOUNCE_FACTOR = 1,
LEVEL_WIDTH = 1024,
LEVEL_HEIGHT = 512,
INFO_HEIGHT = 50;

(function ()
{
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
    currentLevelNumber = 0,
    multiplayer,
    collectedByOtherPlayer = 0,
    host;

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

        PIXI.loader.add('cross1', "textures/Cross/Cross1.png");
        PIXI.loader.add('cross2', "textures/Cross/Cross2.png");
        PIXI.loader.add('cross3', "textures/Cross/Cross3.png");
        PIXI.loader.add('cross4', "textures/Cross/Cross4.png");
        PIXI.loader.add('cross5', "textures/Cross/Cross5.png");
        PIXI.loader.add('cross6', "textures/Cross/Cross6.png");
        PIXI.loader.add('cross7', "textures/Cross/Cross7.png");
        PIXI.loader.add('cross8', "textures/Cross/Cross8.png");
        PIXI.loader.add('cross9', "textures/Cross/Cross9.png");
        PIXI.loader.add('cross10', "textures/Cross/Cross10.png");
        PIXI.loader.add('cross11', "textures/Cross/Cross11.png");
        PIXI.loader.add('cross12', "textures/Cross/Cross12.png");

		PIXI.loader.add('TwoBullet1', "textures/TwoBullet/TwoBullet1.png");
        PIXI.loader.add('TwoBullet2', "textures/TwoBullet/TwoBullet2.png");
		PIXI.loader.add('TwoBullet3', "textures/TwoBullet/TwoBullet3.png");
		PIXI.loader.add('TwoBullet4', "textures/TwoBullet/TwoBullet4.png");
		PIXI.loader.add('TwoBullet5', "textures/TwoBullet/TwoBullet5.png");
		
		
        PIXI.loader.once('complete', init);
        PIXI.loader.load();
    }

    function init()
    {
        data = null;
        jsonData = null;
        keyMap = [];
        lastTimeCount = null;
        count = 0;
        player = null;
        otherPlayer = [];
        otherBullets = [];
        lastTime = null;
        currentLevel = null;
        text;
        loadText = null;
        winnerText = null;
        collectedText = [];
        exportedDataTimes = 0;
        outerStage = new PIXI.Container(0x000000);
        loadingStage = new PIXI.Container(0x000000);
        infoStage = new PIXI.Container(0x000000);
        stage = new PIXI.Container(0x000000);
        gameLoop = null;
        loadingBackground = new PIXI.Graphics();
        multiplayer = false;
        collectedByOtherPlayer = 0;
        host = false;

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
        var url = window.location.href; // Returns full URL

        console.log("pathname: " + pathname);
        console.log("url: " + url);

        console.log("server: " + getQueryVariable("server"));

        if (pathname == "/join")
        {
            console.log("match");
            $("#levelDiv").hide();
            joinMultiplayer(getQueryVariable("server"));
        }

    }

    function loadLevelData(levelNr, levelModifier)
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
                initLevel(levelNr, levelModifier);
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
        stage.destroy();
        infoStage.destroy();
        //loadingStage.destroy();
        outerStage.destroy();
    }

    function initLevel(levelNr, externalLevelModifier)
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
		
		var levelModifier = [];
		if(host == true)
		{
		
		
		for(var index = 0; index < 5; index++)
		{
			var item = 9;
			var itemLocation = Math.random()*jsonData.map.length;
			
			while(jsonData.map[Math.floor(itemLocation)] != 0)
			{
				itemLocation = Math.random()*jsonData.map.length;
			}
			
			var obj = new Object();
			obj.itemLocation = Math.floor(itemLocation);
			obj.item = item;
			levelModifier.push(obj);
		}
		
		for(var index = 0; index < 1; index++)
		{
			var item = 8;
			var itemLocation = Math.random()*jsonData.map.length;
									
			while(jsonData.map[Math.floor(itemLocation)] != 0)
			{
				itemLocation = Math.random()*jsonData.map.length;
			}
			
			var obj = new Object();
			obj.itemLocation = Math.floor(itemLocation);
			obj.item = item;
			levelModifier.push(obj);
		}
		}
		else{
			levelModifier = externalLevelModifier;
		}
		
		console.log(JSON.stringify(levelModifier));
		
		for(var index = 0; index < levelModifier.length; index++)
		{
			jsonData.map[levelModifier[index].itemLocation] = levelModifier[index].item;
		}	
		
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
		
		var obj = new Object();
		obj.levelNr = levelNr;
		obj.levelModifier = levelModifier;
		
		var jsonString = JSON.stringify(obj);

		if(host == true)
		{
		socket.emit('createGame', jsonString);
		}
		else
		{
		socket.emit('readyGame', jsonString);
		}
		
		
		if(multiplayer == false)
		{
		startGame();
		}
    }

    function addPlayers()
    {
        loadText.text += "Adding Players - Done\n"
        outerStage.removeChild(loadingStage);
        infoStage.position.y = LEVEL_HEIGHT;

        outerStage.addChild(infoStage);

        if(host==true)
        {
        player = new Player(jsonData.player1StartX, jsonData.player1StartY, currentLevel.realWidth, currentLevel.realHeight, "blue", stage);
        }
        else
        {
                    player = new Player(jsonData.player2StartX, jsonData.player2StartY, currentLevel.realWidth, currentLevel.realHeight, "blue", stage);

        }
        collectedByOtherPlayer = 0;

        for (var index = 0; index < 3; index++)
        {
            otherPlayer[index] = new Player(-100, -100, currentLevel.realWidth, currentLevel.realHeight, "red", stage);
            otherBullets[index] = new Bullets(null, 0, 0, stage);
            for (var index2 = 0; index2 < 50; index2++)
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
        gameLoop = update;
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
                player.bullets.addBullet();
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

		/*
        if (player.collected >= (currentLevel.toCollect - collectedByOtherPlayer))
        {
            console.log("out " + player.collected + " " + currentLevel.toCollect);
            gameLoop = levelEnded;
        }
		*/

        renderer.render(outerStage);
        //setTimeout(gameLoop, 5);
        requestAnimationFrame(gameLoop);
    }

    function gameOver()
    {
    }

    function startSinglePlayer(levelNr)
    {
        //currentLevelNumber = 1;
        startLevel(levelNr, null);
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
        winnerText.position.x = (outerStage.width / 2) - (winnerText.width / 2);
        loadText.text = "Loading next level";

        outerStage.addChild(winnerText);
        renderer.render(outerStage);
        console.log("levelEnded " + currentLevelNumber);
        socket.emit("levelEnded", currentLevelNumber);

        if (multiplayer == false)
        {
            startLevel(currentLevelNumber++, null);
        }
    }

    function startMultiPlayer(levelNr)
    {
        console.log("CreateGame");

        multiplayer = true;
        outerStage.addChild(loadingStage);
        loadingStage.addChild(logoSprite);
        winnerText = new PIXI.Text("Waiting for a second player",
            {
                font : "20px Arial",
                fill : "red",
            }
            );
        winnerText.position.y = 300;
        winnerText.position.x = (outerStage.width / 2) - (winnerText.width / 2);
        loadText.text = "Waiting for server"
            outerStage.addChild(winnerText);
        renderer.render(outerStage);
        console.log("socket " + socket.connected);
		startLevel(levelNr, null);
        //socket.emit('createGame', levelNr);
        //nextLevelStart();
    }

    function joinMultiplayer(serverId)
    {
        socket.emit('joinGame', serverId);

        multiplayer = true;
        outerStage.addChild(loadingStage);
        loadingStage.addChild(logoSprite);
        winnerText = new PIXI.Text("Joining game " + serverId,
            {
                font : "20px Arial",
                fill : "red",
            }
            );
        winnerText.position.y = 300;
        winnerText.position.x = (outerStage.width / 2) - (winnerText.width / 2);
        loadText.text = "Waiting for server"
        outerStage.addChild(winnerText);
        renderer.render(outerStage);
    }

    function startLevel(levelNr, levelModifier)
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
        winnerText.position.x = (outerStage.width / 2) - (winnerText.width / 2);
        loadText.text = "Loading next level";

        outerStage.addChild(winnerText);
        renderer.render(outerStage);
        loadLevelData(levelNr, levelModifier);
		console.log("loadLevelData " + levelNr);
        //setTimeout(loadLevelData, 1000, levelNr);
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
        if (multiplayer)
        {
            exportedDataTimes++;
            var obj = new Object();
            obj.pX = Math.round(player.position.x);
            obj.pY = Math.round(player.position.y);
            obj.pR = player.rotation;
            obj.pA = player.acceleration;
			obj.pH = player.health;
            //Send the whole data once every second.
            if (exportedDataTimes < 60)
            {
                obj.removedTiles = currentLevel.removedDelta;
            }
            else
            {
                obj.removedTiles = currentLevel.removedFull;
                exportedDataTimes = 0;
            }
            obj.collected = currentLevel.collectedFull;
            obj.bullets = player.bullets.export();
            var jsonString = JSON.stringify(obj);
            //console.log("exportData: " + jsonString);
            socket.emit('gameUpdate', jsonString);

            currentLevel.removedDelta.length = 0;
        }

    }

    function handleHealth(playerNr)
    {
        if (player.health < 1)
        {
            stage.alpha /= 2;

            winnerText = new PIXI.Text("The End - Lost",
                {
                    font : "20px Arial",
                    fill : "red",
                }
                );
            winnerText.position.y = 20;
            winnerText.position.x = 500;
            infoStage.addChild(winnerText);
                    socket.emit("playerDied", null);

            gameLoop = gameOver;
        }

    }

    function etcUpdate(playerNr, dTfactor)
    {
        player.update(dTfactor);
        player.bullets.update(dTfactor);
        var before = performance.now();
        collisionHandling(currentLevel, player, dTfactor);
        bulletCollision(currentLevel, player.bullets);
        //bulletCollisionPlayer(player, player.bullets);
        bulletCollisionPlayer(player, otherBullets[1]);
        tempCollisionTimer += (performance.now() - before);
        //console.log("collisionHandling Time: " + (performance.now()-before));
    }

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

        multiplayer = false;
        host = true;

        var level = 1;
        if(document.getElementById('level1').checked)
            {
                level=1;
            }
        else if(document.getElementById('level2').checked)
            {
                level=2;
            }
            else if(document.getElementById('level3').checked)
            {
                level=3;
            }
console.log("startSinglePlayer " + level);
        startSinglePlayer(level);
    }
    );

    $('#2p').on('change', function (event)
    {
        event.preventDefault(); // To prevent following the link (optional)
        console.log("2p");
        $("#start").prop('disabled', false);
        host = true;


        var level = 1;
        if(document.getElementById('level1').checked)
            {
                level=1;
            }
        else if(document.getElementById('level2').checked)
            {
                level=2;
            }
            else if(document.getElementById('level3').checked)
            {
                level=3;
            }

        startMultiPlayer(level);
    }
    );

    socket.on('startGame', function ()
    {
        startGame();
    }
    );
	
	socket.on('loadGame', function (gameData)
    {
        //TODO get socket id from server
		console.log("loadGame gameData.level " + gameData.level);
        currentLevelNumber = gameData.level;
        startLevel(gameData.level, gameData.levelModifier);
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
        document.getElementById("gameId").textContent = "URL to join: https://kindofgravity.herokuapp.com/join?server=" + msg;
    }
    );

        socket.on('winner', function (msg)
    {
                    winnerText = new PIXI.Text("The End - You won",
                {
                    font : "20px Arial",
                    fill : "red",
                }
                );
            winnerText.position.y = 20;
            winnerText.position.x = 500;
            infoStage.addChild(winnerText);
            gameLoop=gameOver;
    }
    );

    function handleGameDataFromServer(msg, player, bullets)
    {
        //console.log("update " + msg );'
        if (gameLoop == update)
        {
            var obj = JSON.parse(msg);
            player.position.x = obj.pX;
            player.position.y = obj.pY;
            player.rotation = obj.pR;
			player.health = obj.pH;
            player.updateHealthBar();


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

            collectedByOtherPlayer = obj.collected.length;

            for (var index = 0; index < obj.collected.length; index++)
            {
                currentLevel.deleteTile(obj.collected[index]);
            }

            for (var index = 0; index < bullets.bullet.length; index++)
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
        var obj =
        {
            "pX" : 153,
            "pY" : 327,
            "pR" : -0.314080725542665,
            "pA" : 0,
            "removedTiles" : [306, 302, 303, 259, 258, 301, 161, 162, 34, 163, 164, 580, 271, 356, 616, 412, 668, 732, 820, 880, 970, 1220, 1307, 1298, 1180, 1150, 1114, 1115, 1151, 1260, 1279, 1221, 925, 940, 1261, 955, 1181, 808, 699, 309, 150, 308, 264, 307],
            "bullets" : [
                {
                    "x" : 69,
                    "y" : 69
                },
                {
                    "x" : 87,
                    "y" : 125
                },
                {
                    "x" : 104,
                    "y" : 178
                },
                {
                    "x" : 122,
                    "y" : 231
                },
                {
                    "x" : 139,
                    "y" : 285
                }
            ]
        };
        var jsonString = JSON.stringify(obj);
        handleGameDataFromServer(jsonString, otherPlayer[1], otherBullets[1]);

        obj =
        {
            "pX" : 253,
            "pY" : 327,
            "pR" : 0.314080725542665,
            "pA" : 0.01,
            "removedTiles" : [306, 302, 303, 259, 258, 301, 161, 162, 34, 163, 164, 580, 271, 356, 616, 412, 668, 732, 820, 880, 970, 1220, 1307, 1298, 1180, 1150, 1114, 1115, 1151, 1260, 1279, 1221, 925, 940, 1261, 955, 1181, 808, 699, 309, 150, 308, 264, 307],
            "bullets" : [
                {
                    "x" : 69,
                    "y" : 69
                },
                {
                    "x" : 87,
                    "y" : 125
                },
                {
                    "x" : 104,
                    "y" : 178
                },
                {
                    "x" : 122,
                    "y" : 231
                },
                {
                    "x" : 139,
                    "y" : 285
                }
            ]
        };
        jsonString = JSON.stringify(obj);
        handleGameDataFromServer(jsonString, otherPlayer[2], otherBullets[2]);
    }

    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++)
        {
            var pair = vars[i].split("=");
            if (pair[0] == variable)
            {
                return pair[1];
            }
        }
        return (false);
    }

}
)
();
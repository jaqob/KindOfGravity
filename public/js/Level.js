"use strict";
function Level(levelData) {
	// ParticleContainer does not support alpha. Could be used if FPS becomes an issue. 
    PIXI.Container.call(this);
	//PIXI.ParticleContainer.call(this);

this.realWidth = 0;
this.realHeight = 0;
this.toCollect = 0;
this.spriteChart = [];
this.removedDelta = [];
this.removedFull = [];
this.collectedFull = [];
	
    this.loadLevel2(levelData);
	//this.loadLevel(levelData);



}

//Level.prototype = Object.create(PIXI.ParticleContainer.prototype);
Level.prototype = Object.create(PIXI.Container.prototype);


Level.prototype.hitTile = function (x) {
    this.deleteTile(x);
    this.removedDelta.push(x);
	this.removedFull.push(x);
    console.log("Removed: " + this.removedDelta);
};

Level.prototype.deleteTile = function (x) {
        this.removeChild(this.spriteChart[x]);
        this.spriteChart[x] = null;
};


Level.prototype.hitTile2 = function (x) {
    if (this.spriteChart[x].health > 0) {
        this.spriteChart[x].alpha /= 2;
        this.spriteChart[x].health--;
    }
    else {
        this.removeChild(this.spriteChart[x]);
        this.spriteChart[x] = null;
    }
};


Level.prototype.collect = function (x) {
		//this.collected++;
		this.collectedFull.push(x);
        this.removeChild(this.spriteChart[x]);
        this.spriteChart[x] = null;

};

/*
Level.prototype.loadLevel = function (jsonMap) {
    this.nrSpritesWidth = jsonMap.spritesWidth;
	this.nrSpritesHeight = jsonMap.spritesHeight;
	this.realWidth = jsonMap.spritesWidth*8;
	this.realHeight = jsonMap.spritesHeight*8;
	
	var frames = [];
	frames.push(PIXI.Texture.fromFrame('textures/gold1.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold2.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold3.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold4.png'));
	var goldSprite = new PIXI.extras.MovieClip(frames);
	

    for (var indexY = 0; indexY < jsonMap.spritesHeight; indexY++) {
        for (var indexX = 0; indexX < jsonMap.spritesWidth; indexX++) {
            var mapIndex = indexY * jsonMap.spritesWidth + indexX;
            var mapType = jsonMap.map[mapIndex];

            if (mapType != 0 && mapType != 9) {
				this.spriteChart[mapIndex] = new levelSprite(PIXI.Texture.fromFrame(jsonMap.tiles[mapType].texture));
                this.spriteChart[mapIndex].health = jsonMap.tiles[mapType].health;
                this.spriteChart[mapIndex].position.x = 8 * indexX;
                this.spriteChart[mapIndex].position.y = 8 * indexY;
                this.addChild(this.spriteChart[mapIndex]);
            }
			else if(mapType == 9)
			{			
				this.toCollect++;		
				this.spriteChart[mapIndex] = new collectableSprite(frames);
				this.spriteChart[mapIndex].position.x = 8 * indexX;
				this.spriteChart[mapIndex].position.y = 8 * indexY;
				this.addChild(this.spriteChart[mapIndex]);
	
			}
			//else{
			//	this.spriteChart[mapIndex] = 0;	
			//}
        }
    }
};
*/

Level.prototype.loadLevel2 = function (jsonMap) {
    this.nrSpritesWidth = jsonMap.spritesWidth;
	this.nrSpritesHeight = jsonMap.spritesHeight;
	this.realWidth = jsonMap.spritesWidth*8;
	this.realHeight = jsonMap.spritesHeight*8;
	
	var frames = [];
	frames.push(PIXI.Texture.fromFrame('textures/gold1.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold2.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold3.png'));
	frames.push(PIXI.Texture.fromFrame('textures/gold4.png'));
	var goldSprite = new PIXI.extras.MovieClip(frames);
	
	var tempIndex = 0;

    for (var indexY = 0; indexY < jsonMap.spritesHeight; indexY++) {
        for (var indexX = 0; indexX < jsonMap.spritesWidth; indexX++) {
            var mapType = jsonMap.map[indexY * jsonMap.spritesWidth + indexX];

            if (mapType != 0 && mapType != 9) {
				this.spriteChart[tempIndex] = new levelSprite(PIXI.Texture.fromFrame(jsonMap.tiles[mapType].texture));
                this.spriteChart[tempIndex].health = jsonMap.tiles[mapType].health;
                this.spriteChart[tempIndex].position.x = 8 * indexX;
                this.spriteChart[tempIndex].position.y = 8 * indexY;
                this.addChild(this.spriteChart[tempIndex]);
				tempIndex++;
            }
			else if(mapType == 9)
			{			
				this.toCollect++;		
				this.spriteChart[tempIndex] = new collectableSprite(frames);
				this.spriteChart[tempIndex].position.x = 8 * indexX;
				this.spriteChart[tempIndex].position.y = 8 * indexY;
				this.addChild(this.spriteChart[tempIndex]);
				tempIndex++;
			}
        }
    }
};

function levelSprite(texture) {
    PIXI.Sprite.call(this, texture, 8, 8);
};
levelSprite.prototype = Object.create(PIXI.Sprite.prototype);
levelSprite.prototype.health = 1;


function collectableSprite(texture) {
    PIXI.extras.MovieClip.call(this, texture, 8, 8);
	this.animationSpeed = 0.07;
	this.play();
};
collectableSprite.prototype = Object.create(PIXI.extras.MovieClip.prototype);
collectableSprite.prototype.health = 0;
collectableSprite.prototype.collectable = 1;

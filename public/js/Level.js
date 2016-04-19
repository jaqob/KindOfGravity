"use strict";
function Level(levelData)
{
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

Level.prototype.hitTile = function (x)
{
    this.deleteTile(x);
    this.removedDelta.push(x);
    this.removedFull.push(x);
    console.log("Removed: " + this.removedDelta);
};

Level.prototype.deleteTile = function (x)
{
    this.removeChild(this.spriteChart[x]);
    this.spriteChart[x] = null;
};

Level.prototype.hitTile2 = function (x)
{
    if (this.spriteChart[x].health > 0)
    {
        this.spriteChart[x].alpha /= 2;
        this.spriteChart[x].health--;
    }
    else
    {
        this.removeChild(this.spriteChart[x]);
        this.spriteChart[x] = null;
    }
};

Level.prototype.collect = function (x)
{
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

Level.prototype.loadLevel2 = function (jsonMap)
{
    this.nrSpritesWidth = jsonMap.spritesWidth;
    this.nrSpritesHeight = jsonMap.spritesHeight;
    this.realWidth = jsonMap.spritesWidth * 8;
    this.realHeight = jsonMap.spritesHeight * 8;


    var crossFrames = [];
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross1.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross2.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross3.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross4.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross5.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross6.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross7.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross8.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross9.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross10.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross11.png"));
    crossFrames.push(PIXI.Texture.fromFrame("textures/Cross/Cross12.png"));

	
	var twoBulletFrames = [];
    twoBulletFrames.push(PIXI.Texture.fromFrame("textures/TwoBullet/TwoBullet1.png"));
	twoBulletFrames.push(PIXI.Texture.fromFrame("textures/TwoBullet/TwoBullet2.png"));
	twoBulletFrames.push(PIXI.Texture.fromFrame("textures/TwoBullet/TwoBullet3.png"));
	twoBulletFrames.push(PIXI.Texture.fromFrame("textures/TwoBullet/TwoBullet4.png"));
	twoBulletFrames.push(PIXI.Texture.fromFrame("textures/TwoBullet/TwoBullet5.png"));


    var tempIndex = 0;

    for (var indexY = 0; indexY < jsonMap.spritesHeight; indexY++)
    {
        for (var indexX = 0; indexX < jsonMap.spritesWidth; indexX++)
        {
            var mapType = jsonMap.map[indexY * jsonMap.spritesWidth + indexX];

            if (mapType != 0 && mapType != 8 && mapType != 9)
            {
                this.spriteChart[tempIndex] = new levelSprite(PIXI.Texture.fromFrame(jsonMap.tiles[mapType].texture));
                this.spriteChart[tempIndex].health = jsonMap.tiles[mapType].health;
                this.spriteChart[tempIndex].position.x = 8 * indexX;
                this.spriteChart[tempIndex].position.y = 8 * indexY;
                this.addChild(this.spriteChart[tempIndex]);
                tempIndex++;
            }
			
			else if (mapType == 8)
            {
				console.log("Adding 9");
                this.toCollect++;
                this.spriteChart[tempIndex] = new collectableSprite(twoBulletFrames,0.05, mapType);
                this.spriteChart[tempIndex].position.x = 8 * indexX;
                this.spriteChart[tempIndex].position.y = 8 * indexY;
                this.addChild(this.spriteChart[tempIndex]);
                tempIndex++;
            }
			
            else if (mapType == 9)
            {
				console.log("Adding 9");
                this.toCollect++;
                this.spriteChart[tempIndex] = new collectableSprite(crossFrames, 0.1, mapType);
                this.spriteChart[tempIndex].position.x = 8 * indexX;
                this.spriteChart[tempIndex].position.y = 8 * indexY;
                this.addChild(this.spriteChart[tempIndex]);
                tempIndex++;
            }
        }
    }
};

/*
Level.prototype.addExtras = function () {

var frames = [];
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross1.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross2.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross3.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross4.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross5.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross6.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross7.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross8.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross9.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross10.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross11.png"));
frames.push(PIXI.Texture.fromFrame("textures/Cross/Cross12.png"));
var crossSprite = new PIXI.extras.MovieClip(frames);
this.spriteChart[1000] =

}
 */

function levelSprite(texture)
{
    PIXI.Sprite.call(this, texture, 8, 8);
};
levelSprite.prototype = Object.create(PIXI.Sprite.prototype);
levelSprite.prototype.health = 1;

function collectableSprite(texture, speed, type)
{
    PIXI.extras.MovieClip.call(this, texture, 16, 16);
    this.animationSpeed = speed;
	this.collectableType = type;
    this.play();
};
collectableSprite.prototype = Object.create(PIXI.extras.MovieClip.prototype);
collectableSprite.prototype.health = 0;
collectableSprite.prototype.collectable = 1;

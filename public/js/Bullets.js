'use strict';
function Bullets(player, worldWidth, worldHeight, stage)
{
  this.player = player;
  this.worldWidth = worldWidth;
  this.worldHeight = worldHeight;
  this.bullet = [];
  this.coolDown = 0;
  this.stage = stage;
}


Bullets.prototype.cleanArray = function()
{
                this.bullet = this.bullet.filter(function (n)
                    {
                        return n != undefined
                    }
                    );
};

Bullets.prototype.addBullet = function()
{
				this.cleanArray();
                this.bullet[this.bullet.length] = new Bullet(this.player.position.x, this.player.position.y, this.player.rotation, this.player.velocity_x, this.player.velocity_y, this.worldWidth, this.worldHeight);
				this.stage.addChild(this.bullet[this.bullet.length - 1]);
				this.coolDown=15;
};

Bullets.prototype.update = function(dT)
{
	    for (var index = 0; index < this.bullet.length; index++)
        {
            if (this.bullet[index])
            {
                this.bullet[index].updatePosition(dT);
                if (this.bullet[index].totalDistance > 2000)
                {
                    this.removeBullet(index);
                }
            }

        }
}

Bullets.prototype.removeBullet = function(index)
{
	                this.stage.removeChild(this.bullet[index]);
                    delete this.bullet[index];
                    this.cleanArray();
}

Bullets.prototype.export = function()
{
	this.cleanArray();
	
	var obj = [];
		for (var index = 0; index < this.bullet.length; index++)
        {
            if (this.bullet[index])
            {
				obj[index] = new Object();
				obj[index].x = Math.round(this.bullet[index].position.x);
				obj[index].y = Math.round(this.bullet[index].position.y);
					
		}
		}
		return obj;
}


function Bullet(x, y, rotation, initVelocityX, initVelocityY, worldWidth, worldHeight)
{
    PIXI.Sprite.call(this, PIXI.loader.resources['bullet3x3'].texture, 3, 3);
	console.log((9*Math.cos(rotation + Math.PI / 2)));
    this.position.x = x - 1 - (12*Math.cos(rotation + Math.PI / 2));
    this.position.y = y - 1 - (12*Math.sin(rotation + Math.PI / 2));
    this.velocity_x = initVelocityX;
    this.velocity_y = initVelocityY;

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    var tempvelocity_x = this.velocity_x + 4 * Math.cos(rotation + Math.PI / 2);
    var tempvelocity_y = this.velocity_y + 4 * Math.sin(rotation + Math.PI / 2);

    this.velocity_x = tempvelocity_x;
    this.velocity_y = tempvelocity_y;

    this.totalDistance = 0;
}

Bullet.prototype = Object.create(PIXI.Sprite.prototype);

Bullet.prototype.updatePosition = function (dT)
{
    this.velocity_y = this.velocity_y - 0.03*dT;

    var velocity = Math.sqrt(Math.pow(this.velocity_y, 2) + Math.pow(this.velocity_y, 2));
    this.totalDistance += velocity;

    this.position.y -= this.velocity_y*dT;
    this.position.x -= this.velocity_x*dT;

    if (this.position.y < 0)
    {
        this.position.y += this.worldHeight;
    }
    else if (this.position.y > this.worldHeight)
    {
        this.position.y -= this.worldHeight;
    }

    if (this.position.x < 0)
    {
        this.position.x += this.worldWidth;
    }
    else if (this.position.x > this.worldWidth)
    {
        this.position.x -= this.worldWidth;
    }
};

'use strict'
function Player(x, y, worldWidth, worldHeight, color, stage) {

	if(color === "blue")
	{
		this.shipTexture = PIXI.loader.resources['ship16x24blue'].texture;
		this.shipTextureFire = PIXI.loader.resources['ship16x24bluefire'].texture;
	}
	else if( color === "red")
	{
		this.shipTexture = PIXI.loader.resources['ship16x24red'].texture;
		this.shipTextureFire = PIXI.loader.resources['ship16x24redfire'].texture;
	}		
	
  PIXI.Sprite.call(this, this.shipTexture, 16, 24);
  
  this.worldWidth = worldWidth;
  this.worldHeight = worldHeight;

  this.position.x = x;
  this.position.y = y;
  
  this.pivot.set(8, 8);
  
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.acceleration = 0;
  
  this.maxVelocity=0;
  
  this.shipHeight = 16;
  this.health = 100;
  this.invulnerableTimer = 0;
  this.pivotOffset = 8;
  this.collected=0;
  this.bullets = new Bullets(this, this.worldWidth, this.worldHeight, stage);
  stage.addChild(this);
  
  
  
  this.healthBarTest = new PIXI.Graphics();
  this.healthBarTest.beginFill(0xFF0000);
  this.healthBarTest.drawRect(-12, 20, 28, 3);

	//Handle oddness with initialization
  this.healthBarTest.x = this.position.x;
  this.healthBarTest.y = this.position.y;
  stage.addChild(this.healthBarTest);
}

//Player.constructor = Player;
Player.prototype = Object.create(PIXI.Sprite.prototype);

Player.prototype.getRealY = function() {
return this.position.y - this.pivotOffset;
}

Player.prototype.getRealX = function() {
return this.position.x - this.pivotOffset;
}


Player.prototype.accelerate = function() {
    this.acceleration=0.1;
    this.texture = this.shipTextureFire;
};

Player.prototype.stopAccelerate = function() {
    this.acceleration=0.0;
    this.texture = this.shipTexture;
};

Player.prototype.rotateLeft = function(dT) {
    this.rotation +=(Math.PI/60)*dT;
};

Player.prototype.rotateRight = function(dT) {
    this.rotation -=(Math.PI/60)*dT;
};

Player.prototype.update = function(dT) {
		this.invulnerableTimer-=(1*dT);
        this.updateVelocity(dT);
        this.updatePosition(dT);
		this.updateHealthBar();
}

Player.prototype.applyGravity = function(dT) {
    
	/*
		var tempvelocity_x = this.velocity_x;
        var tempvelocity_y = this.velocity_y;// - (0.03*dT); //gravity
		
		var velocity = Math.sqrt(Math.pow(tempvelocity_x, 2) + Math.pow(tempvelocity_y,2))
		
		
		
		if(velocity < 3)
		{
			this.velocity_x = tempvelocity_x;
			this.velocity_y = tempvelocity_y;	
		}
		*/
        
};
	
Player.prototype.updateVelocity = function(dT) {
		var tempvelocity_x = this.velocity_x + this.acceleration * Math.cos(this.rotation + Math.PI / 2)*dT;
        var tempvelocity_y = this.velocity_y + this.acceleration * Math.sin(this.rotation + Math.PI / 2)*dT;
		tempvelocity_y-=(0.03*dT);
        
		var velocity = Math.sqrt(Math.pow(tempvelocity_x, 2) + Math.pow(tempvelocity_y,2));
        
        if(velocity > 0)
        {
        var tempvelocity_xNorm = tempvelocity_x/velocity;
        var tempvelocity_yNorm = tempvelocity_y/velocity;
        }
        else
        {
            var tempvelocity_xNorm=0;
            var tempvelocity_yNorm=0;
        }
		
		
        
     
        if(velocity < 4)
        {
        this.velocity_x = tempvelocity_xNorm*velocity;
		this.velocity_y = tempvelocity_yNorm*velocity;
        }
        else
        {
        this.velocity_x = tempvelocity_xNorm*4;
		this.velocity_y = tempvelocity_yNorm*4; 
        }
		
	//this.velocity_y-=(0.03*dT);
        

};

Player.prototype.hit = function() {
	if(this.invulnerableTimer<1)
	{
	this.health-=5;
	this.invulnerableTimer=30;
	}

}

Player.prototype.updatePosition = function(dT) {
        this.position.y -= this.velocity_y*dT;
		this.position.x -= this.velocity_x*dT;
		
		
		if(this.position.y < 0)
		{
			this.position.y+=this.worldHeight;
		}
		else if(this.position.y > this.worldHeight)
		{
			this.position.y-=this.worldHeight;
		}
		
		if(this.position.x < 0)
		{
			this.position.x+=this.worldWidth;
		}
		else if(this.position.x > this.worldWidth)
		{
			this.position.x-=this.worldWidth;
		}
};

Player.prototype.updateHealthBar = function() {
	this.healthBarTest.x = this.position.x;
	this.healthBarTest.y = this.position.y;
	this.healthBarTest.width = ((this.health/100)*24);
};


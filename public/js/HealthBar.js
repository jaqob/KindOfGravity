function HealthBar(x, stage) {
		PIXI.Container.call(this);
		
		this.x = x;
		this.stage = stage;
		
	    this.healthFrame = new PIXI.Graphics();
        this.healthFrame.lineStyle(2, 0xFF0000);
        this.healthFrame.drawRect(this.x, 8, 104, 14);
        stage.addChild(this.healthFrame);

        this.healthBar = new PIXI.Graphics();
        this.healthBar.beginFill(0xFF0000);
        this.healthBar.drawRect(this.x+2, 10, 100, 10);
}

HealthBar.prototype = Object.create(PIXI.Container.prototype);

HealthBar.prototype.setHealth = function(health) {
            this.healthBar.clear();
            this.healthBar.beginFill(0xFF0000);
            this.healthBar.drawRect(this.x+2, 10, health, 10);
            this.stage.addChild(this.healthBar);
}
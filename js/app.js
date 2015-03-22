/*
	MAIN SUPERCLASS THANG
	Params are xcoord, ycoord, speed, and sprite url
*/
var Thang = function(xc, yc, spd, spr){
	this.sprite = spr;
	this.x = xc;
	this.y = yc;
	this.speed = spd;
}
//rendering method is pretty much the same for everyone
Thang.prototype.render = function(){
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
Thang.prototype.update = function(dt) {/*empty stub just so all thangs can have update() called on em */}


/*
	ENEMY CLASS SYNONYMOUS WITH BUG. EXTENDS THANG
	(If I was ever going to add more enemies I
	would add the sprite as a constructor parameter)
	Params are x coord, y coord, speed, and flip. When flip is
	true, bug moves to the left. Otherwise it moves to the right.
*/
var Enemy = function(xc, yc, sp, fl) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
	if (fl)
		Thang.call(this, xc, yc, sp, 'images/enemy-bug-flipped.png');
	else
		Thang.call(this, xc, yc, sp, 'images/enemy-bug.png');
	if (fl) this.flip = fl;
	else this.flip = false;
	this.spriteWidth = 101;
	this.hitbox = {
		minx: 2, 
		miny: 78, 
		maxx: 110, 
		maxy: 143
	};
}
Enemy.prototype = Object.create(Thang.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	dt = dt %300;
	if (this.flip)
		this.x -= dt*this.speed;
	else
		this.x += dt*this.speed;
	if (this.x > canvasWidth) this.x = -this.spriteWidth+5;
	if (this.x < -this.spriteWidth) this.x = canvasWidth-5;
}
//Had to override thang's rendering method in order to support
//bugs moving to the left without having to create a new bug png

/*
	GEM CLASS
*/
var Gem = function(xc, yc, spd, spr){
	Thang.call(this, xc, yc, spd, spr);
	this.hitbox = {
		minx: 18, 
		miny: 70, 
		maxx: 84, 
		maxy: 150
	};
}
Gem.prototype = Object.create(Thang.prototype);
Gem.prototype.constructor = Gem;

/*
	PLAYER CLASS ALSO EXTENDS THANG
	Players always start at fixed x,y. 
	Params for constructor: name of sprite,
	width of oscillation between hops,
	speed of movement.
*/
var Player = function(sprite, hop, spd){
	Thang.call(this, 200, 400, spd, sprite);
	this.status = 'idle';
	this.hitbox = {
		minx: 18, 
		miny: 90, 
		maxx: 84, 
		maxy: 139
	};
	this.dead = false;
	this.hopHeight = hop; 
	//higher hopheight means the character will arc more steeply when hopping to the side
	this.lastIdlePos = { x : 200, y : 400 };
	this.score = 0;
	
	document.addEventListener('keyup', function(e) {
		var allowedKeys = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down'
		};
	
		player.handleInput(allowedKeys[e.keyCode]);
	});
	
};
Player.prototype = Object.create(Thang.prototype);
Player.prototype.constructor = Player;

Player.prototype.reset = function(){
	this.x = 200;
	this.y = 400;
}

Player.prototype.update = function(dt){
	var collision = this.detectCollisions();
	if (powerup && collision === 'powerup'){
		if (powerup.sprite.indexOf('green') > 2) this.score += 1;
		else if (powerup.sprite.indexOf('blue') > 2) this.score += 3;
		else if (powerup.sprite.indexOf('orange') > 2) this.score += 5;
		powerup = null;
	}
	else if (collision === 'enemy'){
		this.dead = true;
		this.status = 'idle';
		this.score -= 5;
		if (this.score < 0) this.score = 0;
		return;
	}
	if (this.status === 'hoppingLeft'){
		//x always moves to the left speed*dt pixels regardless 
		this.x -= this.speed*dt; 
		/*y has to oscillate, hence the cosine function
		  total move distance is 100 so the value deltaX = 50-(this.lastIdlePos.x - this.x)
		  starts out being 50 and goes to -50 as we complete the hop to the left.
		  Thus, if we take deltaX and divide it by 50 and multiply by pi, we can apply 
		  the cosine function to obtain an obscillation between pi and -pi. Then multiply this
		  by hopHeight to get the value we're gonna subtract from the last idle y coord.
		  Same reasoning applies to hopping right.
		  */
		var deltaX = 50-(this.lastIdlePos.x - this.x);
		this.y = this.lastIdlePos.y - this.hopHeight*Math.cos(Math.PI*deltaX/50);
		if (this.x <= this.lastIdlePos.x-100){ //reached the end of the move
			this.x = this.lastIdlePos.x = this.lastIdlePos.x-100;
			this.y = this.lastIdlePos.y;
			this.status = 'idle';
		}
	}
	else if (this.status === 'hoppingRight'){
		//x always moves to the right by speed*dt pixels until it reaches end
		this.x += this.speed*dt; 
		var deltaX = 50-(this.x - this.lastIdlePos.x);
		this.y = this.lastIdlePos.y - this.hopHeight*Math.cos(Math.PI*deltaX/50);
		if (this.x >= this.lastIdlePos.x+100){ //here is when we reached the end of the move length
			this.x = this.lastIdlePos.x = this.lastIdlePos.x+100;
			this.y = this.lastIdlePos.y;
			this.status = 'idle';
		}
	}
	else if (this.status === 'hoppingUp'){
		/* Similar reasoning here except the tiles apparently are only 90px tall 
		Also, we don't want the bounce to be too bouncy so we oscilate between 0 and pi
		rather than between pi and -pi
		*/
		this.y -= this.speed*dt; //y moves up by speed*dt
		var delta = (this.lastIdlePos.y - this.y );
		//introducing the oscillating bounciness element:
		/*this.y -= this.hopHeight*Math.cos(Math.PI*3*delta);
		if (this.y <= this.lastIdlePos.y - 90){
			this.y = this.lastIdlePos.y = this.lastIdlePos.y-90;
			this.status = 'idle';
		}*/
		//hop move dampened by 50% with respect to hoppingLeft and hoppingRight
		this.x = this.lastIdlePos.x + 0.5*this.hopHeight*Math.cos(Math.PI*delta/90); 
		if (this.y <= this.lastIdlePos.y-90){ //here is when we reached the end of the move length
			this.y = this.lastIdlePos.y = this.lastIdlePos.y-90;
			this.x = this.lastIdlePos.x;
			this.status = 'idle';
		}
	}
	else if (this.status === 'hoppingDown'){ //just the converse from hoppingUp
		this.y += this.speed*dt; 
		var delta = (this.lastIdlePos.y - this.y );
		//hops to the right when going down, rightward movement dampened by 50%s
		this.x = this.lastIdlePos.x - 0.5*this.hopHeight*Math.cos(Math.PI*delta/90); 
		if (this.y >= this.lastIdlePos.y+90){ //here is when we reached the end of the move length
			this.y = this.lastIdlePos.y = this.lastIdlePos.y+90;
			this.x = this.lastIdlePos.x;
			this.status = 'idle';
		}
	}
};

/*
	handleInput converted to instance method so that its invocation can wait
	until we instantiate the player after making the choice in the start menu
*/
Player.prototype.handleInput = function(key){
	if (!key || this.status != 'idle') return;
	//console.log("handleInput received "+key);
	if (key === 'left' && this.x > 10) this.status = 'hoppingLeft';
	if (key === 'right' && this.x+this.hitbox.maxx < canvasWidth-50) this.status = 'hoppingRight'; 
	if (key === 'up' && this.y > 0) this.status = 'hoppingUp';
	if (key === 'down' && this.y+this.hitbox.maxy < canvasHeight-100) this.status = 'hoppingDown';
	this.lastIdlePos.x = this.x;
	this.lastIdlePos.y = this.y;
};

/*	Collision detection based on 
*	bounding boxes of enemy objects and
*	player object
*/
Player.prototype.detectCollisions = function(){
	if (powerup)
		if ( this.x + this.hitbox.maxx > powerup.x + powerup.hitbox.minx &&   
			this.x + this.hitbox.minx < powerup.x +powerup.hitbox.maxx &&   
			this.y + this.hitbox.maxy > powerup.y + powerup.hitbox.miny &&   
			this.y + this.hitbox.miny < powerup.y +powerup.hitbox.maxy){
				return 'powerup';
			}
	for (var i in allEnemies){
		var en = allEnemies[i];
		if ( this.x + this.hitbox.maxx > en.x + en.hitbox.minx &&
		   this.x + this.hitbox.minx < en.x +en.hitbox.maxx &&
		   this.y + this.hitbox.maxy > en.y + en.hitbox.miny &&
		   this.y + this.hitbox.miny < en.y +en.hitbox.maxy){
			return 'enemy';
		}
		
	}
	return false;
};



// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player; // = new Player(); Instantiated in the engine
allEnemies = [];
var ctr = 0;
while (ctr < 5){
	if (Math.random() < 0.5) //half the time enemies will be normal...
		allEnemies.push(new Enemy(ctr*100, 60+(ctr*85)%340, (150+Math.random()*75), false  )); 
	else	//the other half will be flipped
		allEnemies.push(new Enemy(ctr*100, 60+(ctr*85)%340, (150+Math.random()*75), true  )); 
	ctr++;
}
var powerup;



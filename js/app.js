// Enemies our player must avoid
var Enemy = function(xc, yc, sp) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.x = xc;
	this.y = yc;
	this.speed = sp;
	this.spriteWidth = 101;
	this.hitbox = {
		minx: 2, 
		miny: 78, 
		maxx: 98, 
		maxy: 143
	};
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x += dt*this.speed;
	if (this.x > canvasWidth) this.x = -this.spriteWidth+5;
	
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	ctx.strokeRect(this.x, this.y, 5,5);
}

var Player = function(){
	this.x=200;
	this.y=400;
	this.sprite = 'images/char-boy.png';
	this.hitbox = {
		minx: 18, 
		miny: 80, 
		maxx: 84, 
		maxy: 139
	};
	this.dead = false;
};
Player.prototype.update = function(){
	if (this.detectCollisions()) this.dead = true;
};

Player.prototype.detectCollisions = function(){
	for (var i in allEnemies){
		var en = allEnemies[i];
		if ( this.x + this.hitbox.maxx > en.x + en.hitbox.minx
		&&   this.x + this.hitbox.minx < en.x +en.hitbox.maxx
		&&   this.y + this.hitbox.maxy > en.y + en.hitbox.miny
		&&   this.y + this.hitbox.miny < en.y +en.hitbox.maxy){
			//console.log("looked for collision with enemy "+en);
			return true;
		}
	}
	return false;
};

Player.prototype.render = Enemy.prototype.render;/*function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}*/

Player.prototype.handleInput = function(key){
	if (!key) return;
	console.log("handleInput received "+key);
	if (key == 'left') this.x -= 100;
	if (key == 'right') this.x += 100;
	if (key == 'up') this.y -= 90;
	if (key == 'down') this.y += 90;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
allEnemies = [];
var ctr = 0;
while (ctr < 5){
	allEnemies.push(new Enemy(ctr*100, 60+(ctr*85)%255, 75+Math.random()*50));
	ctr++;
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

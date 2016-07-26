

import Thang from './Thang.js';
import Enemy from './Enemy.js';
import Gem from './Gem.js';
import Player from './Player.js';
import Engine from './Engine.js';

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player; // = new Player(); Instantiated in the engine
var allEnemies = [];
var ctr = 0;
while (ctr < 5){
	if (Math.random() < 0.5) //half the time enemies will be normal...
		allEnemies.push(new Enemy(ctr*100, 143+(ctr*83)%249, (150+Math.random()*75), false  ));
	else	//the other half will be flipped
		allEnemies.push(new Enemy(ctr*100, 143+(ctr*83)%249, (150+Math.random()*75), true  ));
	ctr++;
}
window.powerup = false;


export {allEnemies};
Engine(window, player);

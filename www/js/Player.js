import Thang from './Thang.js';
import {allEnemies} from './app.js';
/*
	PLAYER CLASS ALSO EXTENDS THANG
	Players always start at fixed x,y.
	Params for constructor: name of sprite,
	width of oscillation between hops,
	speed of movement.
*/
export default class Player extends Thang{
  constructor(sprite, hop, spd){
    super(200, 400, spd, sprite);
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

    Array.prototype.forEach.call(document.querySelectorAll('#controls img'), (arrow)=>{
      arrow.addEventListener('click', evt=>this.handleInput(evt.target.id));
      arrow.addEventListener('touchend', evt=>{
        console.log("touched key");
        this.handleInput(evt.target.id)
      });
    });

  	document.addEventListener('keyup', (e) => {
  		var allowedKeys = {
  			37: 'left',
  			38: 'up',
  			39: 'right',
  			40: 'down'
  		};

  		this.handleInput(allowedKeys[e.keyCode]);
  	});
  }
  reset(){
    this.x = 200;
  	this.y = 400;
  }
  update(dt){
    var collision = this.detectCollisions();
  	if (powerup && collision === 'powerup'){
  		if (powerup.sprite.indexOf('green') > 2) this.score += 1;
  		else if (powerup.sprite.indexOf('blue') > 2) this.score += 3;
  		else if (powerup.sprite.indexOf('orange') > 2) this.score += 5;
  		powerup = null;
  	}
  	else if (collision === 'enemy' || this.y < 0){
  		this.dead = true;
  		this.status = 'idle';
  		this.score -= 5;
  		if (this.score < 0) this.score = 0;
  		return;
  	}
    var deltaX = 0;
    var delta = 0;
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
  		deltaX = 50-(this.lastIdlePos.x - this.x);
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
  		deltaX = 50-(this.x - this.lastIdlePos.x);
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
  		delta = (this.lastIdlePos.y - this.y );
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
  		delta = (this.lastIdlePos.y - this.y );
  		//hops to the right when going down, rightward movement dampened by 50%s
  		this.x = this.lastIdlePos.x - 0.5*this.hopHeight*Math.cos(Math.PI*delta/90);
  		if (this.y >= this.lastIdlePos.y+90){ //here is when we reached the end of the move length
  			this.y = this.lastIdlePos.y = this.lastIdlePos.y+90;
  			this.x = this.lastIdlePos.x;
  			this.status = 'idle';
  		}
  	}
  }
  handleInput(key){
    if (!key || this.status != 'idle') return;
  	//console.log("handleInput received "+key);
  	if (key === 'left' && this.x > 10) this.status = 'hoppingLeft';
  	if (key === 'right' && this.x+this.hitbox.maxx < canvasWidth-50) this.status = 'hoppingRight';
  	if (key === 'up' && this.y > 0) this.status = 'hoppingUp';
  	if (key === 'down' && this.y+this.hitbox.maxy < canvasHeight-100) this.status = 'hoppingDown';
  	this.lastIdlePos.x = this.x;
  	this.lastIdlePos.y = this.y;
  }
  /*	Collision detection based on
  *	bounding boxes of enemy objects and
  *	player object
  */
  detectCollisions(){
    if (powerup){
  		if ( this.x + this.hitbox.maxx > powerup.x + powerup.hitbox.minx &&
  			this.x + this.hitbox.minx < powerup.x +powerup.hitbox.maxx &&
  			this.y + this.hitbox.maxy > powerup.y + powerup.hitbox.miny &&
  			this.y + this.hitbox.miny < powerup.y +powerup.hitbox.maxy){
  				return 'powerup';
  			}
    }
    for (var i in allEnemies){
      if (allEnemies.hasOwnProperty(i)){
        var en = allEnemies[i];
        if ( this.x + this.hitbox.maxx > en.x + en.hitbox.minx &&
            this.x + this.hitbox.minx < en.x +en.hitbox.maxx &&
            this.y + this.hitbox.maxy > en.y + en.hitbox.miny &&
            this.y + this.hitbox.miny < en.y +en.hitbox.maxy){
          return 'enemy';
        }
      }
    }
  	return false;
  }
}

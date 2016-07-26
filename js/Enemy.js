import Thang from './Thang';

/*
	ENEMY CLASS SYNONYMOUS WITH BUG. EXTENDS THANG
	(If I was ever going to add more enemies I
	would add the sprite as a constructor parameter)
	Params are x coord, y coord, speed, and flip. When flip is
	true, bug moves to the left. Otherwise it moves to the right.
*/
export default class Enemy extends Thang{
  constructor(xc, yc, sp, fl) {
    super(xc, yc, sp, 'images/enemy-bug.png');
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
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
  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt){
    dt = dt %300;
  	if (this.flip)
  		this.x -= dt*this.speed;
  	else
  		this.x += dt*this.speed;
  	if (this.x > canvasWidth) this.x = -this.spriteWidth+5;
  	if (this.x < -this.spriteWidth) this.x = canvasWidth-5;
  }
  render(){
    if (this.flip){
      ctx.save();
      ctx.translate(this.x + 50,0);
      ctx.scale(-1,1);
      ctx.translate(-this.x - 50, 0);
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
      ctx.restore();
    }
    else{
      super.render();
    }
  }
}

//module.exports = Enemy;

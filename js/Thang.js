/*
	MAIN SUPERCLASS THANG
	Params are xcoord, ycoord, speed, and sprite url
*/
class Thang{
  constructor(xc, yc, spd, spr){
  	this.sprite = spr;
  	this.x = xc;
  	this.y = yc;
  	this.speed = spd;
  }
  render(){
  	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
  update(){
    //empty stub so there aren't exceptions when you call
    //update on a Thang
  }
}

module.exports = Thang;

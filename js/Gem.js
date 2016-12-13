/*
	GEM CLASS
*/
import Thang from './Thang.js';

export default class Gem extends Thang{
  constructor(xc, yc, spd, spr){
  	super(xc, yc, spd, spr);
  	this.hitbox = {
  		minx: 18,
  		miny: 70,
  		maxx: 84,
  		maxy: 150
  	};
  }
}

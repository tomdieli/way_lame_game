export class PlayerPiece extends PIXI.Sprite {
  constructor(texture, hex, direction){
    super(texture);
    this.hittable = new Set();
    this.engagedWith = new Set();
    this.x = hex.toPoint().x + 30;
    this.y = hex.toPoint().y + 25;
    this.width = 30;
    this.height = 30;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.ma = 8;
    this.hex = hex;
    this.setDirection(direction);
  }

  setDirection(direction){
    this.direction = direction;
    const offset = this.direction + 2 > 5 ? Math.abs(4 - this.direction) : this.direction + 2;
    this.rotation = offset * (3.14/3);
  }

  advanceDirection() {
    const direction = this.direction + 1 > 5 ? this.direction - 5 : this.direction + 1;
    this.setDirection(direction);
  }

  setHex(hex) {
    this.hex = hex;
    const center = this.hex.toPoint();
    this.x = center.x + 30;
    this.y = center.y + 25;
  }

  getHex() {
    return this.hex;
  }

  getDirection(){
    return this.direction;
  }
}


  
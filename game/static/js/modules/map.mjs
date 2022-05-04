export const Hex = Honeycomb.extendHex({
    size: 30,
    orientation: 'flat'
  });

export class GameMap {
  constructor() {

    // create a Grid factory that uses the Hex factory:
    this.Grid = Honeycomb.defineGrid(Hex);

    // create our hex grid
    this.grid = this.Grid.rectangle({ width: 10, height: 10 });
  }

  getMap() {
    console.log('getMap calld')
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, 0x999999);
    this.grid.forEach(hex => {
      const point = hex.toPoint();
      // Draw hex shape based off hex's central point.
      const corners = hex.corners().map(corner => corner.add(point))
      const [firstCorner, ...otherCorners] = corners;
      graphics.moveTo(firstCorner.x, firstCorner.y);
      otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.lineTo(firstCorner.x, firstCorner.y);
    });
    return graphics;
  }

  getNeighborHexes(hex, direction){
    const hexDirection = direction;
    const left = (hexDirection - 1) < 0 ? 5 : hexDirection - 1;
    const right = (hexDirection + 1) > 5 ? 0 : hexDirection + 1;
    const neighbors = this.grid.neighborsOf(hex, [left, hexDirection, right]);
    return neighbors;
  }

  distance(hex1, hex2) {
    const hexesBetween = this.grid.hexesBetween(hex1, hex2);
    const distance = (hexesBetween.length - 1);
    return distance;
  }
}
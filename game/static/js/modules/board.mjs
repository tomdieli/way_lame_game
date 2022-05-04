import {GameMap} from './map.mjs'
import {PlayerPiece} from './marker.mjs'

export class GameBoard extends PIXI.Application {
  constructor(localPlayerName) {
    super({ transparent: false , width: 460, height: 545});
    this.mouseIn = false;     //cheap hack
    this.localPlayerName = localPlayerName;
    this.players = [];
    this.gameMap = new GameMap();
    var map = this.gameMap.getMap()
    console.log(this.gameMap)
    this.stage.addChild(map);
    this.stage.interactive = true;
    this.stage.hitArea = new PIXI.Rectangle(0,0,this.renderer.width, this.renderer.height);
    this.renderer.plugins.interaction.on( 'pointerdown', this.movePlayer);
    this.renderer.plugins.interaction.on( 'mouseover', () => { this.mouseIn = true; });
    this.renderer.plugins.interaction.on( 'mouseout', () => { this.mouseIn = false; });
    //this.renderer.plugins.interaction.on( 'mousemove', this.updateBoard);
    //this.renderer.plugins.interaction.on( 'mouseup', this.updateBoard);
  }

  movePlayer = (e) => {
    const data = e.data;
    const player = this.stage.getChildByName(this.localPlayerName);
    switch(data.button){
    case 0:
      const offsetX = data.global.x;
      const offsetY = data.global.y;
      const targetHex = this.gameMap.Grid.pointToHex(offsetX, offsetY);
      player.setHex(targetHex);
      break;
    case 2:
      player.advanceDirection()
      break;
    default:
      console.log(`Sorry, we don't react to ${data.button}.`);
      return;
    }
    const neighbors = this.gameMap.getNeighborHexes(player.getHex(), player.getDirection());
    player.engagedWith.clear();
    player.hittable.clear();
    // foreach peice on field
    this.stage.children.forEach(chi => {
      if((chi instanceof PlayerPiece) && (chi.name !== player.name)) {
        let found = false;
        for(const neighbor of neighbors) {
          if((neighbor.x === chi.hex.x) && (neighbor.y === chi.hex.y)) {
            player.hittable.add(chi.name);
            chi.engagedWith.add(player.name);
          }
          const engagables = this.gameMap.getNeighborHexes(chi.getHex(), chi.getDirection());
          for(const engageable of engagables){
            if((engageable.x === player.hex.x) && (engageable.y === player.hex.y)) {
              chi.hittable.add(player.name)
              player.engagedWith.add(chi.name);
              found = true;
            }
          }
        }
      }
    });
  }

  updateBoard = (e) => {
    if(this.mouseIn) {
      const data = e.data;
      const offsetX = data.global.x
      const offsetY = data.global.y
      const targetHex = this.gameMap.Grid.pointToHex(offsetX, offsetY);
      // cheap hack
      if( targetHex === undefined ) {
        return;
      }

      // document.getElementById("pointer-hex").innerHTML = targetHex;

      // // TODO: extract these...
      // const player = this.stage.getChildByName("tom");
      // const enemy = this.stage.getChildByName("fucker");

      // const playerHex = player.getHex();
      // const playerDistance = this.gameBoard.distance(targetHex, playerHex);
      // const playerDirection = player.getDirection();
      // const playerNeighbors = this.gameBoard.getNeighborHexes(playerHex, playerDirection);

      // document.getElementById("player-hex").innerHTML = playerHex;
      // document.getElementById("player-distance").innerHTML = playerDistance;
      // document.getElementById("player-direction").innerHTML = playerDirection;

      // const eDirection = enemy.getDirection();
      // const eNeighbors = this.gameBoard.getNeighborHexes(enemy.getHex(), eDirection);
      // // player.engagedWith = [];
      // // player.hittables = [];
      // // don't know why I can't use includes
      // let found = false;
      // for(const en of eNeighbors) {
      //   // console.log(`comparing ${en} to ${cat.getHex()}`)
      //   if((en.x === player.hex.x) && (en.y === player.hex.y)) {
      //     enemy.hittables.add(player.name);
      //     player.engagedWith.add(enemy.name);
      //     found = true;
      //   }
      // }
      // if (!found) {
      //   enemy.hittables.delete(player.name);
      //   player.engagedWith.delete(enemy.name);
      // }
      // document.getElementById("player-hittables").innerHTML = [...player.hittables];
      // document.getElementById('player-engaged').innerHTML = [...player.engagedWith];
      
      // // TODO: extract. .call during move, not mouseover.
      // // const player = this.stage.getChildByName("tom");
      // const enemyHex = enemy.getHex();
      // const enemyDistance = this.gameBoard.distance(targetHex, enemyHex);
      // const enemyDirection = enemy.getDirection();
      // const enemyNeighbors = this.gameBoard.getNeighborHexes(enemyHex, enemyDirection);

      // document.getElementById("enemy-hex").innerHTML = enemyHex;
      // document.getElementById("enemy-distance").innerHTML = enemyDistance;
      // document.getElementById("enemy-direction").innerHTML = enemyDirection;

      // // const enemy = this.stage.getChildByName("fucker");
      // const pDirection = player.getDirection();
      // const pNeighbors = this.gameBoard.getNeighborHexes(player.getHex(), pDirection);
      // // enemy.engagedWith = [];
      // // enemy.hittables = []
      // // don't know why I can't use includes
      // found = false;
      // for(const pl of pNeighbors) {
      //   // console.log(`comparing ${en} to ${cat.getHex()}`)
      //   if((pl.x === enemy.hex.x) && (pl.y === enemy.hex.y)) {
      //     player.hittables.add(enemy.name);
      //     enemy.engagedWith.add(player.name);
      //     found = true;
      //   }
      // }
      // if (!found) {
      //   player.hittables.delete(enemy.name);
      //   enemy.engagedWith.delete(player.name);
      // }
      // document.getElementById("enemy-hittables").innerHTML = [...enemy.hittables];
      // document.getElementById('enemy-engaged').innerHTML = [...enemy.engagedWith];
    }
  }
}
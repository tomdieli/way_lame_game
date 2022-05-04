import { GameBoard } from './board.mjs';
import { Hex } from './map.mjs';

export class GameTable {
  // requires figures
  constructor(playerID, playerName) {
    // Object.assign(this, gameData);
    // console.log(gameData)
    this.playerID = playerID;
    this.playerName = playerName;
    this.figures = [];
    this.gameBoard = new GameBoard(playerName);
    //this.gamePhase = "pre-game";
  }

  announce(message) {
    document.querySelector("#status").textContent += message + "\n";
    document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
  }

  addMarker(marker){
    this.gameBoard.stage.addChild(marker);
  }


  // extract this to player
  doDexPenalties() {
    // TODO: extract to figure via doPenalties!
    this.figures.forEach(figure => {
      if(figure.penalties.includes('dx_adj')) {
        figure.adj_dx -= 2;
        figure.penalties.splice(figure.penalties.indexOf('dx_adj'), 1)
      }
      else if (figure.penalties.includes('st_dx_adj')) {
        figure.adj_dx -= 3;
        figure.penalties.splice(figure.penalties.indexOf('st_dx_adj'), 1)
      }
    });
    this.renderFigures();
  }

  setCombatStates(playerName, newStates){
    for(const oppoID of newStates.hittable){
      const opponent = this.figures.find(figure => figure.figure_name == oppoID)
      opponent.marker.engagedWith.add(playerName)
      console.log(`${opponent.figure_name} engaged: ${[...opponent.marker.engagedWith]}`)
    }
    for(const oppoID of newStates.engaged){
      const opponent = this.figures.find(figure => figure.figure_name == oppoID)
      opponent.marker.hittable.add(playerName)
      console.log(`${opponent.figure_name} hittable: ${[...opponent.marker.hittable]}`)
    }
  }

  renderFigures() {
    this.figures.forEach(figure => figure.render())
  }

  renderMarker(playerName, coords) {
    const idxd = this.figures.findIndex(p => p.figure_name === playerName);
    this.figures[idxd].marker.setHex(Hex(coords.x, coords.y));
    this.figures[idxd].marker.setDirection(coords.d);
  }
}




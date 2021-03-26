import { Figure } from './figure.mjs';
import {Receiver} from './referee.mjs';
import {Attack, Dodge, GetUp, PickUp} from './action.mjs';

export class Table {
  constructor(gameData, playerID, gameSocket) {
    Object.assign(this, gameData);
    this.playerID = playerID;
    this.figures = [];
    this.gameOver = false;
    this.theFirst = null;
    this.currentPlayer = null;
    this.currentRound = 0;
    this.gameSocket = gameSocket;
    this.receiver = new Receiver(gameSocket);
  }

  initGameSocket() {
    this.gameSocket.onmessage = (message) => {
      const my_message = JSON.parse(message.data);
      const my_data = my_message['message']
      if(my_data.action === "attack"){
        this.updatePlayer(my_data.attacker);
        this.updatePlayer(my_data.attackee);
      } else if( my_data.action === "get-up" ) {
        this.updatePlayer(my_data.prone_one);
      } else if( my_data.action === "pick-up" ) {
        this.updatePlayer(my_data.picker);
      }
      document.querySelector("#status").textContent += my_data.info_txt + "\n";
      document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
      if(this.currentPlayer.id === this.playerID)
        this.currentPlayer.updateActions()
        this.currentPlayer.disableActions();
      this.nextPlayer();
    };
  }

  loadFigures(figureData){
    this.figures = figureData.map((figdata) => {
      let newFigure = new Figure(figdata);
      let attackCommand = new Attack(this.receiver);
      //let dodgeCommand = Dodge(this.receiver);
      let getUpCommand = new GetUp(this.receiver);
      let pickUpCommand = new PickUp(this.receiver);
      newFigure.register('attack', attackCommand)
      // newFigure.register('dodge', attackCommand)
      newFigure.register('get-up', getUpCommand)
      newFigure.register('pick-up', pickUpCommand)
      return newFigure;
    });
    this.receiver.registerPlayers(this.figures);
  }

  start() {
    this.initGameSocket();
    this.updateOpponentLists();
    this.nextTurn();
  }

  nextTurn() {
    if( this.figures.length === 1 ) {
      let winMsg = figure[0].figure_name + " Wins!!!";
      document.querySelector("#status").textContent += winMsg + "\n";
      this.gameOver = true;
      return null;
    }
    this.current_round += 1;
  
    this.doDxStates();

    let newPlayers = this.doInitiative();
  
    
    this.figures = newPlayers;
    this.theFirst = this.figures[0];
    console.log("it is now turn " + this.current_round + ". " + this.theFirst.figure_name + " goes first")
    this.nextPlayer();
  }

  nextPlayer() {
    this.currentPlayer = this.figures.shift()
    if (this.playerID === this.currentPlayer.id) {
      this.currentPlayer.updateActions()
      this.currentPlayer.enableActions();
    } //else {
    //   const otherPlayer = this.figures.find(figure => figure.id === this.playerID)
    //   this.currentPlayer.disableActions();
    // }
    this.figures.push(this.currentPlayer)
  }

  doDxStates() {
    // move to figure?
    const getDexAdj = function(playerItems) {
      let adjustment = 0;
      // TODO: reduce!
      for(let playerItem of playerItems) {
        if(playerItem.dx_adj !== 0) {
          adjustment += playerItem.dx_adj;
        }
      }
      return adjustment;
    }

    // TODO: map!
    this.figures.forEach(figure => {
      figure.adj_dx = figure.dexterity - getDexAdj(figure.equipped_items);
      if(figure.dx_adj === true) {
        figure.adj_dx -= 2;
        figure.dx_adj = false;
      }
    });
    this.renderFigures();
  }

  doInitiative(){
    let orderedByDex = {}
    //TODO: map or something better
    for(let figure of this.figures) {
      let adjDX = figure.adj_dx;
      if(adjDX in orderedByDex) {
        orderedByDex[adjDX].push(figure);
      } else {
        orderedByDex[adjDX] = [figure];
      }
    }
    let keys = Object.keys(orderedByDex);
    keys.sort(function (a, b) { return b-a; });

    let newPlayers = [];
    // TODO: map!
    for ( let i = 0; i < keys.length; i++ ) {
      let newList = orderedByDex[keys[i]];
      if (newList.length > 1) {
        orderedByDex[keys[i]] = doInit(newList);
      }
      newPlayers = newPlayers.concat(newList);
    }
    return newPlayers
  }

  doInit(playerList) {
    rolls = {};
    for(player of playerList) {
      dSix = Math.ceil(Math.random()*6);
      dSix in rolls ? rolls[dSix].push(player) : rolls[dSix] = [player];
    }
    for(roll in rolls) {
      if (rolls[roll].length > 1) {
        this.doInit(rolls[roll])
      }
    }
  }

  updatePlayer(playerData) {
    const idxd = this.figures.findIndex(p => p.id === playerData.id)
    this.figures[idxd].update(playerData)
    // remove player if dead
    if( this.figures[idxd].hits <= 0 ){
      this.figures.splice(idxd, 1)
      this.updateOpponentLists()
    }
    this.receiver.registerPlayers(this.figures)
  }

  updateOpponentLists() {
    const figuresCopy = [...this.figures];
    this.figures.forEach((figure) => {
      figure.opponents = figuresCopy.filter(
        fig => fig.figure_name !== figure.figure_name
      );
    });
  }  

  renderFigures() {
    this.figures.forEach(figure => figure.render())
  }
}




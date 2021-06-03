import { Figure } from './figure.mjs';
import { Receiver} from './receiver.mjs';
import { Attack, Dodge, GetUp, PickUp, Move, Initiative, Pass } from './command.mjs';
import { GameTable } from './playfield.mjs';

export class Table {
  constructor(gameData, playerID, playerName, gameSocket) {
    Object.assign(this, gameData);
    this.playerID = playerID;
    this.playerName = playerName;
    this.figures = [];
    // TODO: use Map instead.
    this.initiativeRolls = {};
    this.gameOver = false;
    this.theFirst = null;
    this.currentPlayer = null;
    this.currentRound = 0;
    this.gameSocket = gameSocket;
    this.receiver = new Receiver(gameSocket);
    this.playField = new GameTable(playerName);
    this.phase = "pre-game";
  }

  // extract to contain table?
  initGameSocket() {
    this.gameSocket.onmessage = (message) => {
      const my_message = JSON.parse(message.data);
      const my_data = my_message['message']
      if(my_data.action === "initiative") {
        // TODO: extract most of this to separate game master.
        //  use switch statement instead.
        const name = my_data.name;
        const roll = my_data.roll;
        const rollTotal = roll.reduce((a, b) => a + b, 0)
        if(rollTotal in this.initiativeRolls){
          this.initiativeRolls[rollTotal].push(name);
        }
        else {
          this.initiativeRolls[rollTotal] = [name];
        }
        console.log(this.initiativeRolls)
        let total = 0;
        const rollVals = Object.keys(this.initiativeRolls);
        for (const rollVal of rollVals) {
          total += this.initiativeRolls[rollVal].length;
        }
        console.log(`${name} rolled a ${rollTotal} (${roll})`)
        console.log(`comparing ${this.figures.length} to ${total}`)
        if(name === this.playerName){
          this.figures.find(
            figure => {return figure.figure_name === this.playerName}
          ).disableActions();
        }
        if(this.figures.length === total){
          this.initiativeRolls = {};
          this.nextMoveTurn();
          return;
        } else {
          return;
        }
      }
      if(my_data.action === "move"){
        this.renderMarker(my_data.player_name, my_data.coords);
        this.setCombatStates(my_data.player_name, my_data.new_states);
        if(this.currentPlayer.id === this.playerID){
          this.currentPlayer.disableActions();
        }
        this.nextPlayerMove();
        return;
      }
      if(my_data.action === "attack"){
        this.updatePlayer(my_data.attacker);
        this.updatePlayer(my_data.attackee);
      } else if( my_data.action === "get-up" ) {
        this.updatePlayer(my_data.prone_one);
      } else if( my_data.action === "pick-up" ) {
        this.updatePlayer(my_data.picker);
      } else if( my_data.action === "pass" ) {
        console.log(`player took no action`);
      } else if( my_data.action === "dodge" ) {
        console.log(`player dodge`);
        this.updatePlayer(my_data.dodger);
      }
      this.announce(my_data.info_txt);
      if(this.currentPlayer.id === this.playerID)
        this.currentPlayer.updateActions(this.phase)
        this.currentPlayer.disableActions();
      this.nextPlayer();
    };
  }

  announce(message) {
    document.querySelector("#status").textContent += message + "\n";
    document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
  }

  // extract to receiver
  loadFigures(figureData, hexFactory){
    const startCoords = [
      {x:1, y:1, d:0},
      {x:8, y:8, d:3},
      {x:1, y:8, d:2},
      {x:8, y:1, d:5},
    ]
    this.figures = figureData.map((figdata) => {
      const coord = startCoords.shift();
      let newFigure = new Figure(figdata, coord, hexFactory);
      newFigure.register('initiative', new Initiative(this.receiver));
      newFigure.register('move', new Move(this.receiver));
      newFigure.register('attack', new Attack(this.receiver));
      newFigure.register('dodge', new Dodge(this.receiver));
      newFigure.register('get-up', new GetUp(this.receiver));
      newFigure.register('pick-up', new PickUp(this.receiver));
      newFigure.register('pass', new Pass(this.receiver));
      return newFigure;
    });
    for(const figure of this.figures) {
      this.playField.stage.addChild(figure.marker)
    }
    this.receiver.players = this.figures;
  }

  start() {
    this.initGameSocket();
    this.rollForInit();
  }

  rollForInit(){
    this.phase = "initiative";
    let roller = this.figures.find(roller => {
      return roller.id === this.playerID;
    });
    if (roller) {
      roller.updateActions(this.phase);
      roller.enableActions();
    }
    return;
  }

  nextMoveTurn() {
    this.phase = "movement";
    this.current_round += 1;
    this.doDexPenalties();
    this.theFirst = null;
    console.log("it is now turn " + this.current_round + ".");
    this.nextPlayerMove();
  }

  nextTurn() {
    this.phase = "action";
    let newPlayers = this.doInitiative();
    this.figures = newPlayers;
    this.theFirst = null;
    this.nextPlayer();
  }

  nextPlayerMove() {
    if(this.figures[0] === this.theFirst) {
      console.log("Move turn complete");
      this.nextTurn();
    }
    this.currentPlayer = this.figures.shift();
    
    if (this.theFirst === null) {
      this.theFirst = this.currentPlayer;
      console.log(this.theFirst.figure_name + " goes first.");
    }
    if (this.playerID === this.currentPlayer.id) {
      this.currentPlayer.updateActions(this.phase);
      this.currentPlayer.enableActions();
    }
    this.figures.push(this.currentPlayer);
  }

  nextPlayer() {
    if(this.figures[0] === this.theFirst){
      console.log("Action phase over.");
      this.rollForInit();
    }
    this.receiver.players = this.figures;
    this.currentPlayer = this.figures.shift()
    if (this.currentPlayer === null) {
      this.theFirst = this.currentPlayer;
    }
    if (this.playerID === this.currentPlayer.id) {
      this.currentPlayer.updateActions(this.phase)
      this.currentPlayer.enableActions();
    }
    this.figures.push(this.currentPlayer)
    // if(this.currentPlayer.noActions()) {
    //   console.log(`${this.currentPlayer.figure_name} has no actions.`)
    //   // this.nextPlayer();
    //   this.currentPlayer.execute('pass', this.currentPlayer)
    // }
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

  // extract! to where ?
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
        orderedByDex[keys[i]] = this.doInit(newList);
      }
      newPlayers = newPlayers.concat(newList);
    }
    return newPlayers
  }

  // extract! to where?
  doInit(playerList) {
    const rolls = {};
    for(const player of playerList) {
      const dSix = Math.ceil(Math.random()*6);
      console.log(`${player.figure_name} rolls a ${dSix}`)
      dSix in rolls ? rolls[dSix].push(player) : rolls[dSix] = [player];
    }
    for(const roll in rolls) {
      if (rolls[roll].length > 1) {
        this.doInit(rolls[roll])
      }
    }
    return rolls;
  }

  updatePlayer(playerData) {
    const idxd = this.figures.findIndex(p => p.figure_name === playerData.figure_name)
    this.figures[idxd].update(playerData)
    // remove player if dead
    if( this.figures[idxd].hits <= 0 ){
      this.figures.splice(idxd, 1)
    }
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
    const hex = this.playField.gameBoard.Hex;
    const idxd = this.figures.findIndex(p => p.figure_name === playerName);
    this.figures[idxd].marker.setHex(hex(coords.x, coords.y));
    this.figures[idxd].marker.setDirection(coords.d);
  }
}




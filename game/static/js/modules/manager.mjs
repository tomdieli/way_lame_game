import { GameTable } from './table.mjs';
import { Receiver} from './receiver.mjs';
import { Figure } from './figure.mjs';
import {Attack, Dodge, GetUp, PickUp, Move, Initiative, Pass} from './command.mjs'

export class ClientManager {
  //todo: must handle on open registration event.
  constructor(gameSocket, playerData){
    this.gameSocket = gameSocket;
    this.playerData = playerData;
    this.receiver = new Receiver(this.gameSocket);
    this.table = new GameTable();
  }

  startGame() {
    this.table.figures = this.loadFigures()
    this.initGameSocket();
    //this.table.startGame();
  }

  initGameSocket() {
    this.gameSocket.onmessage = (message) => {
      const my_message = JSON.parse(message.data);
      const my_data = my_message['message']
      // use switch statement instead.
      const phase = this.table.gamePhase;
      switch(phase){
        case "initiative":
          // anounce, disable
        case "movement":
          // anounce, disable
          if(my_data.action === "move"){
            this.table.renderMarker(my_data.player_name, my_data.coords);
            this.table.setCombatStates(my_data.player_name, my_data.new_states);
          // announce, disable
          }
        case "action":
          if(my_data.action === "attack"){
            this.table.updatePlayer(my_data.attacker);
            this.table.updatePlayer(my_data.attackee);
          } else if( my_data.action === "get-up" ) {
            this.table.updatePlayer(my_data.prone_one);
          } else if( my_data.action === "pick-up" ) {
            this.table.updatePlayer(my_data.picker);
          } else if( my_data.action === "pass" ) {
            console.log(`player took no action`);
          } else if( my_data.action === "dodge" ) {
            console.log(`player dodge`);
            this.table.updatePlayer(my_data.dodger);
          }
      }
      this.table.announce(my_data.info_txt);
      // this stinks. redo!
      if(this.currentPlayer.id === this.playerID) {
        this.currentPlayer.updateActions(this.phase);
        this.currentPlayer.disableActions();
      }
      this.nextPlayer();
    };
  }

  loadFigures(){
    const startCoords = [
      {x:1, y:1, d:0},
      {x:8, y:8, d:3},
      {x:1, y:8, d:2},
      {x:8, y:1, d:5},
    ]
    const figures = this.playerData.map((figdata) => {
      const coord = startCoords.shift();
      let newFigure = new Figure(figdata, coord);
      newFigure.register('initiative', new Initiative(this.receiver));
      newFigure.register('move', new Move(this.receiver));
      newFigure.register('attack', new Attack(this.receiver));
      newFigure.register('dodge', new Dodge(this.receiver));
      newFigure.register('get-up', new GetUp(this.receiver));
      newFigure.register('pick-up', new PickUp(this.receiver));
      newFigure.register('pass', new Pass(this.receiver));
      return newFigure;
    });
    for(const figure of figures) {
      this.table.addMarker(figure.marker)
    }
    return figures;
  }
}
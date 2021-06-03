import {PlayerPiece} from './marker.mjs';
import {Action} from './action.mjs';

export class Figure {
  constructor(figureData, startingCoords, hexFactory) {
    Object.assign(this, figureData);
    this.marker = new PlayerPiece(
      PIXI.Texture.from("/static/images/blue-matreshka.png"),
      hexFactory(startingCoords.x, startingCoords.y),
      startingCoords.d
    );
    this.marker.name = this.figure_name;
    this.commands = {};
    this.penalties = [];
  }

  update(data) {
    Object.assign(this, data);
    // this.doPenalties();
    this.render();
  }

  attackInfo(){
    const info = (
      ({ figure_name, adj_dx, equipped_items, penalties }) => (
        { figure_name, adj_dx, equipped_items, penalties }
      )
    )(this);
    return info;
  }

  defendInfo(){
    const info = (
      ({ figure_name, dodging, equipped_items, hits, penalties }) => (
        { figure_name, dodging, equipped_items, hits, penalties }
      )
    )(this);
    return info;
  }

  render() {
    const tag = this.figure_name;
    const status = (this.hits <= 0) ? "DEAD" : this.hits;
    document.querySelector("#" + tag + "_hits").innerHTML = status;
    document.querySelector("#" + tag + "_adx").innerHTML = this.adj_dx;
    const penaltyList = document.getElementById(tag + "_penalties");
    while( penaltyList.firstChild ) {
      penaltyList.removeChild(penaltyList.firstChild);
    }
    for( const penalty of this.penalties ) {
      const penaltyItem = document.createTextNode( penalty );    
      penaltyList.appendChild( penaltyItem );
    }
  }

  noActions() {
    const actions = document.getElementById(this.figure_name + "_actions").childNodes;
    return actions.length === 0;
  }

  enableActions() {
    const actions = document.getElementById(this.figure_name + "_actions").childNodes
    for(const action of actions) {
      action.disabled = false;
    }
  }

  disableActions() {
    const actions = document.getElementById(this.figure_name + "_actions").childNodes
    for(const action of actions) {
      action.disabled = true;
    }
  }

  getActions() {
    return document.getElementById(this.figure_name + "_actions").childNodes
  }

  register(name, command) {
    this.commands[name] = command;
  };

  execute(commandName, ...commandArgs) {
    if(Object.keys(this.commands).includes(commandName)) {
      this.commands[commandName].execute(commandArgs)
    }
    else {
      console.error("Command '" + commandName + "' not recognized.");
    };
  };

  clearActions(){
    const actions = document.querySelector('#' + this.figure_name + '_actions')
    
    while( actions.firstChild ) {
      actions.removeChild(actions.firstChild);
    }
    return actions;
  }
            
  updateActions(gameState) {
    const actions = this.clearActions();
    for(const commandName in this.commands) {
      if(this.commands[commandName].rule(this, gameState)) {
        this.addAction(commandName);
      }
    }
  }

  addAction(name) {
    let actionList = document.getElementById(this.figure_name + "_actions");
    let newElement = Action.createAction(name, this);
    actionList.appendChild(newElement);
  }
  
  getPrimaryWeapon(){
    // TODO: reduce!
    for(let i of this.equipped_items){
      if(i.damage_dice !== 0) {
        return i
      }
    }
  }
}
  
  
import {Action} from './ui.mjs';

export class Figure {
  // TODO: Encapsulate update. Do a true render. Others?
  constructor(figureData) {
    Object.assign(this, figureData);
    this.opponents = [];
    //this.gameSocket = null;
    this.commands = {};
  }

  update(data) {
    Object.assign(this, data)
    this.render()
  }

  getStats(){
    let stats = { ...this}
    delete stats.opponents;
    delete stats.commands;
    return stats;
  }
  
  render() {
    let tag = this.figure_name;
    let status = "";
    // TODO: ternary op
    if ( this.hits <= 0){
      status = "DEAD";
    } else {
      status = this.hits;
    }
    document.querySelector("#" + tag + "_hits").innerHTML = status;
    document.querySelector("#" + tag + "_adx").innerHTML = this.adj_dx;
    for( let prop of ['prone', 'dx_adj', 'dropped_weapon']){
      if (this.prop === true) {
        let penaltyList = document.getElementById(tag + "_penalties");
        let penalty = document.createTextNode(prop);    
        penaltyList.appendChild( penalty );
      }
    }
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
      action.disabled = true
    }
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
            
  updateActions() {
    let actions = document.querySelector('#' + this.figure_name + '_actions')
    
    while( actions.firstChild ) {
      actions.removeChild(actions.firstChild);
    }

    for(const commandName in this.commands) {
      if(this.commands[commandName].rule(this)) {
        this.addAction(commandName);
      }
    }
  }

  addAction(name) {
    let actionList = document.getElementById(this.figure_name + "_actions");
    let newElement = Action.createAction(name, this, this.opponents);
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
  
  
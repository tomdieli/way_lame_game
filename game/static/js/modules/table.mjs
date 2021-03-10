class Figure {
  // TODO: Encapsulate update. Do a true render. Others?
  constructor(figureData) {
    Object.assign(this, figureData);
  }

  render() {
    let tag = this.figure_name;
    let status = "";
    if ( this.hits <= 0){
      status = "DEAD";
    } else {
      status = this.hits;
    }
    document.querySelector("#" + tag + "_hits").innerHTML = status;
    document.querySelector("#" + tag + "_adx").innerHTML = this.adj_dx;
    for( let prop of ['prone', 'dx_adj', 'dropped_weapon']){
      if (prop === true) {
        let penaltyList = document.getElementById(tag + "_penalties");
        let penalty = document.createTextNode(prop);    
        penaltyList.appendChild( penalty );
      }
    }
  }
}


export class Table {
  constructor(gameData, playerID, gameSocket) {
    Object.assign(this, gameData);
    this.playerID = playerID;
    this.figures = [];
    this.gameOver = false;
    this.theFirst = null;
    this.currentPlayer = null;
    this.currentRound = 0;
    this.gameSocket = gameSocket
  }

  loadFigures(figureData){
    // TODO: MAP!
    figureData.forEach(element => {
      let newFigure = new Figure(element);
      this.figures.push(newFigure);
    });
  }

  start() {
    while( !this.gameOver() ) {
      nextTurn();
    }
  }

  nextTurn() {
    if( this.figures.length === 1 ) {
      let winMsg = figure[0].figure_name + " Wins!!!";
      document.querySelector("#status").textContent += winMsg + "\n";
      this.gameOver = true;
      return null;
    }
    this.current_round += 1;
  
    // doAdjDx for all players
    // TODO: RENAME
    this.doStates();
  
    // TODO: begin extract!
    let dxOrder = {};
    // TODO: map!
    for(let figure of this.figures) {
      let adjDX = figure.adj_dx;
      if(adjDX in dxOrder) {
        dxOrder[adjDX].push(figure);
      } else {
        dxOrder[adjDX] = [figure];
      }
    }
    let keys = Object.keys(dxOrder);
    keys.sort(function (a, b) { return b-a; });

    let newPlayers = [];
    // TODO: map!
    for ( let i = 0; i < keys.length; i++ ) {
      let newList = dxOrder[keys[i]];
      if (newList.length > 1) {
        dxOrder[keys[i]] = doInit(newList);
      }
      newPlayers = newPlayers.concat(newList);
    }
    // TODO: end extract!
    this.figures = newPlayers;
    this.theFirst = this.figures[0];
    console.log("it is now turn " + this.current_round + ". " + this.theFirst.figure_name + " goes first")
    this.nextPlayer();
  }

  nextPlayer() {
    this.currentPlayer = this.figures.shift()
    if (this.playerID === this.currentPlayer.id) {
      this.enablePlayerActions(this.currentPlayer.figure_name);
    } else {
      const playerName = this.figures.find(figure => figure.id === this.playerID).figure_name
      this.disablePlayerActions(playerName);
      console.warn("disable func should be here")
    }
    this.figures.push(this.currentPlayer)
  }

  doStates() {
    // helper func, replace with reduce
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
    this.updatePlayerActions();
  }

  doInit(playerList) {
    rolls = {};
    for(player of playerList) {
      dSix = Math.ceil(Math.random()*6)
      if(dSix in rolls) {
        rolls[dSix].push(player);
      } else {
        rolls[dSix] = [player];
      }
    }
    for(roll in rolls) {
      if (rolls[roll].length > 1) {
        this.doInit(rolls[roll])
      }
    }
  }

  // TODO: extract to player
  enablePlayerActions(playerName) {
    const actions = document.getElementById(playerName + "_actions").childNodes
    for(let action of actions.values()) {
      if(action.id === 'attack-form') {
        this.enableAttack()
      } else {
        action.disabled = false;
      }
    }
  }

  enableAttack() {
    console.log("Stub for enable attack")
    const attackForm = document.getElementById('attack-form')
    let allElements = attackForm.elements;
    for (let i = 0, l = allElements.length; i < l; ++i) {
      allElements[i].disabled = false;
    }
  }

  // TODO: extract to player
  disablePlayerActions(playerName) {
    console.log("Stub for disablePlayerActions")
    const actions = document.getElementById(playerName + "_actions").childNodes
    for(let action of actions.values()) {
      if(action.id === 'attack-form') {
        this.disableAttack()
      } else {
        action.disabled = true
      }
    }
  }

  disableAttack(){
    const attackForm = document.getElementById('attack-form')
    let allElements = attackForm.elements;
    for (let i = 0, l = allElements.length; i < l; ++i) {
      allElements[i].disabled = true;
    }
  }

  // TODO: extract to player
  updatePlayer(player) {
    const idxd = this.figures.findIndex(p => p.id === player.id)
    Object.assign(this.figures[idxd], player)
    this.figures[idxd].render()
    // remove player if dead
    if( this.figures[idxd].hits <= 0 ){
      this.figures.splice(idxd, 1)
      return null
    }
  }

  renderFigures() {
    this.figures.forEach(figure => figure.render())
  }

  // TODO: extract to player
  updatePlayerActions() {
    const player = this.figures.find(figure => figure.id === this.playerID);
    let actions = document.querySelector('#' + player.figure_name + '_actions')
    
    while( actions.firstChild ) {
      actions.removeChild(actions.firstChild);
    }

    if(!(player.prone || player.dropped_weapon)) {
      this.addAction('attack', player )
    }
    if( player.prone ) {
      this.addAction('get-up', player)
    }
    if( player.dropped_weapon ) {
      this.addAction('pick-up', player)
    }
  }

  // TODO: extract to player???
  addAction(name, figure) {
    let actionList = document.getElementById(figure.figure_name + "_actions");
    let actionElement = document.createElement('dummy')
    switch(name){
      case 'attack':
        actionElement = document.createElement('form');
        actionElement.id = 'attack-form'

        const selectList = document.createElement("select");
        selectList.id = "opponent";
        // add the other players to the list
        // TODO: MAP!
        for (let i = 0; i < this.figures.length; i++) {
          if(this.figures[i].id !== this.playerID) {
            let option = document.createElement("option");
            option.value = this.figures[i].figure_name;
            option.text = this.figures[i].figure_name;
            selectList.appendChild(option);
          }
        }
        actionElement.appendChild(selectList);

        let submitButton = document.createElement("input");
        submitButton.setAttribute("type", "submit");
        actionElement.appendChild(submitButton);
        actionElement.addEventListener("submit", (event) => {
          event.preventDefault();
          let weapon = this.getPrimaryWeapon(figure)
          let selection  = document.querySelector("#opponent").value;
          console.log("SELECTION: " + selection)
          let attackee = this.figures.find(function(el) {
            return el.figure_name === selection
          })
          console.log("ATTACKEE: " + attackee)
          const attack_action = {
            "action": "attack",
            "attacker": figure,
            "attackee": attackee,
            "weapon": weapon
          }
          this.gameSocket.send(JSON.stringify(attack_action));
        });
        break;
      case 'get-up':
        // code block
        actionElement = document.createElement("button");
        actionElement.innerHTML = "Get Up"
        actionElement.id = "get-up"
        actionElement.disabled = true

        actionElement.addEventListener("click", (event) => {
          event.preventDefault();
          const getUp = {
            "action": "get_up",
            "prone_one": figure,
          }
          this.gameSocket.send(JSON.stringify(pickUp));
        });
        break;
      case "pick-up":
        actionElement = document.createElement("button");
        actionElement.innerHTML = "Pick Up Weapon"
        actionElement.id = "pick-up"
        actionElement.disabled = true

        actionElement.addEventListener("submit", (event) => {
          event.preventDefault();
          pickUp = {
            "action": "pick-up",
            "picker": player,
          }
          this.gameSocket.send(JSON.stringify(pickUp));
        });
        break;      
    }
    actionList.appendChild(actionElement)
  }

  getPrimaryWeapon(p){
    for(let i of p.equipped_items){
      if(i.damage_dice !== 0) {
        return i
      }
    }
  }
}




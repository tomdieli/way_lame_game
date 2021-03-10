export const name = 'player';

export function getNextPlayer(players, game, theFirst ) {
    nextPlayer = players[0]
    // console.log("Next Player: " + nextPlayer.figure_name + ", The First: " + theFirst.figure_name)
    if ( game.current_round === 0 ) {
      nextTurn()
    } else if( nextPlayer.id === theFirst.id ) {
      nextTurn()
    }

    let currentPlayer = players.shift()
    // TODO: display current player
    if (pID === currentPlayer.id) {
      enablePlayerActions()
    } else {
      disablePlayerActions()
    }
    return {
        "current": currentPlayer,
        "playerList": players
    }
}

function nextTurn(players, game) {
    console.log("Stub for next turn")
    if( players.length === 1 ) {
      let winMsg = players[0].figure_name + " Wins!!!"
      document.querySelector("#status").textContent += winMsg + "\n"
      return null
    }
    game.current_round += 1
  
    // doAdjDx for all players
    doStates()
  
    let dxOrder = {}
    for(p of players) {
      adjDX = p.adj_dx
      if(adjDX in dxOrder) {
        dxOrder[adjDX].push(p)
      } else {
        dxOrder[adjDX] = [p]
      }
    }
    let newPlayers = []
    let keys = Object.keys(dxOrder)
    
    keys.sort(function (a, b) { return b-a; })
    for ( let i = 0; i < keys.length; i++ ) {
      let newList = dxOrder[keys[i]]
      if (newList.length > 1) {
        dxOrder[keys[i]] = doInit(newList)
      }
      newPlayers = newPlayers.concat(newList)
    }
    players = newPlayers
    theFirst = players[0]
    console.log("it is now turn " + game.current_round + ". " + theFirst.figure_name + " goes first")
  }

function doInit(playerList) {
  rolls = {}
  for(player of playerList) {
    dSix = Math.ceil(Math.random()*6)
    if(dSix in rolls) {
      rolls[dSix].push(player)
    } else {
      rolls[dSix] = [player]
    }
  }
  for(roll in rolls) {
    if (rolls[roll].length > 1) {
    }
  }
}
  
const doStates = function() {
  const getDexAdj = function(playerItems) {
    let adjustment = 0
    for(let playerItem of playerItems) {
      if(playerItem.dx_adj !== 0) {
        adjustment += playerItem.dx_adj
      }
    }
    return adjustment
  }
  console.log("stub for doStates")
  let pOne = null
  for(pr of players){
    if(pr.id === pID) {
      pOne = pr
    }
    pr.adj_dx = pr.dexterity - getDexAdj(pr.equipped_items)
    if(pr.dx_adj === true) {
      pr.adj_dx -= 2
      pr.dx_adj = false
    }
  }
  renderPlayers(players)
  updatePlayerActions(pOne)
}

function enablePlayerActions(){
  console.log("Stub for enablePlayerActions")
  let actions = document.getElementById("p1_actions").childNodes
  for(action of actions.values()) {
    console.log(action.id)
    if(action.id === 'attack-form') {
      enableAttack()
    } else {
      action.disabled = false
    }
  }
}

function disablePlayerActions() {
  console.log("Stub for disablePlayerActions")
  let actions = document.getElementById("p1_actions").childNodes
  for(action of actions.values()) {
    if(action.id === 'attack-form') {
      disableForm(action)
    } else {
      action.disabled = true
    }
  }
}

renderPlayers = function(pl) {
  for( pi of pl) {
    if(pi.id === pID) {
      tag = 'p1'
    } else {
      tag = pi.figure_name
    }
    if ( pi.hits <= 0){
      status = "DEAD"
    } else {
      status = pi.hits
    }
    document.querySelector("#" + tag + "_hits").innerHTML = status
    document.querySelector("#" + tag + "_adx").innerHTML = pi.adj_dx
    penalties = []
    for( prop of ['prone', 'dx_adj', 'dropped_weapon']){
      if (pi[prop] == true) {
        theDiv = document.getElementById(tag + "_penalties")
        newNode = document.createElement('p')      
        newNode.innerHTML = prop
        theDiv.appendChild( newNode )
      }
    }
  }
}

function updatePlayerActions(p) {
  console.log("Stub for update player actions.")
  console.log(p)
  let actions = document.querySelector('#p1_actions')
  //actions.innerHTML = ''
  while( actions.firstChild ) {
    actions.removeChild(actions.firstChild);
  }
  // ['prone', 'dx_adj', 'dropped_weapon']
  //console.log("PRONE: " + p.prone)
  if(!(p.prone || p.dropped_weapon)) {
    addAttack(actions)
  }
  if( p.prone ) {
    addGetUp(actions)
  }
  if( p.dropped_weapon ) {
    addPickUp(actions)
  }
}

function addAttack(actionList) {
  console.log("Stub for add attack")
  // TODO: create form and append
  let attackForm = document.createElement('form');
  attackForm.id = 'attack-form'

  let selectList = document.createElement("select");
  selectList.id = "opponent";
  attackForm.appendChild(selectList);

  let submitButton = document.createElement("input");
  submitButton.setAttribute("type", "submit");
  attackForm.appendChild(submitButton);

  // add the other players to the list
  for (let i = 0; i < players.length; i++) {
    if(players[i].id !== pID) {
      let option = document.createElement("option");
      option.value = players[i].figure_name;
      option.text = players[i].figure_name;
      selectList.appendChild(option);
    }
  }

  // actionList = document.getElementById("p1_actions")
  actionList.appendChild(attackForm)

  disableForm(attackForm)

  attackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    var weapon = getPrimaryWeapon(currentPlayer)
    var selection  = document.querySelector("#opponent").value;
    console.log("SELECTION: " + selection)
    attackee = players.filter(function(el) {
      return el.figure_name === selection
    })
    console.log("ATTACKEE: " + attackee)
    punch = {
      "action": "attack",
      "attacker": currentPlayer,
      "attackee": attackee[0],
      "weapon": weapon
    }
    gameSocket.send(JSON.stringify(punch));
  })
}

function removeAttack() {
  console.log("Stub for remove attack")
  let actionList = document.getElementById('p1_actions')
  console.log(actionList.children)
}

function disableForm(actionForm){
  allElements = actionForm.elements;
  for (let i = 0, l = allElements.length; i < l; ++i) {
    allElements[i].disabled = true;
  }
}

function enableAttack() {
  console.log("Stub for enable attack")
  attackForm = document.getElementById('attack-form')
  allElements = attackForm.elements;
  for (let i = 0, l = allElements.length; i < l; ++i) {
    allElements[i].disabled = false;
  }
}

function addGetUp() {
  console.log("Stub for get up")
  var getUpButton = document.createElement("button");
  getUpButton.innerHTML = "Get Up"
  getUpButton.id = "get-up"
  getUpButton.disabled = true

  actionList = document.getElementById("p1_actions")
  actionList.appendChild(getUpButton)

  getUpButton.addEventListener("click", (event) => {
    console.log("Stub for getUp event")
    event.preventDefault();
    getUp = {
      "action": "get_up",
      "prone_one": currentPlayer,
    }
    gameSocket.send(JSON.stringify(getUp));
  })
}

function addPickUp() {
  var pickUpButton = document.createElement("button");
  pickUpButton.innerHTML = "Pick Up Weapon"
  pickUpButton.id = "pick-up"
  pickUpButton.disabled = true

  actionList = document.getElementById("p1_actions")
  actionList.appendChild(pickUpButton)

  pickUpButton.addEventListener("submit", (event) => {
    event.preventDefault();
    pickUp = {
      "action": "pick_up",
      "picker": currentPlayer,
    }
    gameSocket.send(JSON.stringify(pickUp));
  })
}


  
  
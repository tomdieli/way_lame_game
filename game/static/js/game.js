import { Table } from './modules/table.mjs';

// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://";
};

// get the data we need to start game
var game = JSON.parse(document.getElementById('game-data').textContent);
var players = JSON.parse(document.getElementById('players-data').textContent);
var pID = JSON.parse(document.getElementById('player1-data').textContent).id;
  
const gameSocket = new WebSocket(
  ws_scheme
  + window.location.host
  + '/ws/game/'
  + game.id
  + '/'
);

var gameTable = new Table(game, pID, gameSocket);

// add the additional attributes to players so we can play the game.
window.onload = (event) => {
  players.forEach(p => {
    p['dodging'] = false
    p['prone'] = false
    p['dx_adj'] = false
    p['dropped_weapon'] = false
    p['adj_dx'] = p['dexterity']
    p['hits'] = p['strength']
  });
  gameTable.loadFigures(players)
  gameTable.nextTurn()
};

gameSocket.onopen = function() {
  console.log('game socket open.');
};

gameSocket.onclose = function(e) {
  console.log('Game socket closed.');
};

gameSocket.onmessage = function(message) {
  const my_message = JSON.parse(message.data)
  const my_data = my_message['message']
  if(my_data.action === "attack"){
    gameTable.updatePlayer(my_data.attacker);
    gameTable.updatePlayer(my_data.attackee);
    if((my_data.attacker.id === pID) || (my_data.attackee.id === pID)){
      gameTable.updatePlayerActions()
    } 
  } else if( my_data.action === "get-up" ) {
    gameTable.updatePlayer(my_data.prone_one)
    if(my_data.prone_one.id === pID){
      gameTable.updatePlayerActions()
    }
  } else if( my_data.action === "pick-up" ) {
    gameTable.updatePlayer(my_data.picker)
    if(my_data.picker.id === pID){
      gameTable.updatePlayerActions()
    }
  }
  document.querySelector("#status").textContent += my_data.info_txt + "\n"
  document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
  
  gameTable.nextPlayer()
};

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
  gameTable.start()
};

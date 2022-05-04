import {ClientManager} from './modules/manager.mjs'

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
var pName = JSON.parse(document.getElementById('player1-data').textContent).figure_name;
  
const gameSocket = new WebSocket(
  ws_scheme
  + window.location.host
  + '/ws/game/'
  + game.id
  + '/'
);

// replace with gamemanager
// var gameTable = new Table(game, pID, pName, gameSocket);

// add the additional attributes to players so we can play the game.
// todo: this should be extracted.
window.onload = () => {
  players.forEach(p => {
    p['dodging'] = false
    p['prone'] = false
    p['dx_adj'] = false
    p['dropped_weapon'] = false
    p['adj_dx'] = p['dexterity']
    p['hits'] = p['strength']
  });

  // this is stupid.
  const board = document.getElementById("board");
  board.oncontextmenu = function () {
    return false;     // cancel default menu
  }

  //
  //board.appendChild(gameTable.playField.view);
  //const hexFactory = gameTable.playField.gameBoard.Hex;
  //gameTable.loadFigures(players, hexFactory);
  //gameTable.start();

  const gameManager = new ClientManager(gameSocket, players);
  gameManager.startGame();
};

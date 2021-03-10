// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
  var ws_scheme = "wss://"
} else {
  var ws_scheme = "ws://"
}

var game = JSON.parse(document.getElementById('game-data').textContent);
var player1 = JSON.parse(document.getElementById('player1-data').textContent);
var players = JSON.parse(document.getElementById('players-data').textContent);

const gameSocket = new WebSocket(
  ws_scheme
  + window.location.host
  + '/ws/game/'
  + game.id
  + '/'
);

gameSocket.onmessage = function(message) {
  msg_data = message.data
  my_data = JSON.parse(msg_data).message
  console.log(my_data)
  if (my_data["action"] === "join-game") {
    // add user to game
    // currentElements = document.getElementById('playerList').childNodes;
    currentElements = document.querySelectorAll('#playerList li')
    var currentList = Array.from(currentElements);
    const found = currentList.find(element => element.innerHTML === my_data['figure_name']);
    if (!found) {
      console.log("Fighter " + my_data['figure_name'] + " has joined game.")
      theDiv = document.getElementById("otherPlayers")
      newNode = document.createElement('p')      
      newNode.innerHTML = my_data["figure_name"]
      theDiv.appendChild( newNode )
    }
  } else if (my_data["action"] === "start-game") {
    window.location.href = '/arena/games/' + my_data['game_id'] + '/play?figure=' + player1.id
  }
}

gameSocket.onclose = function(e) {
  console.error('Chat socket closed.');
};

gameSocket.onopen = function() {
  join_game = {
    "action": "join-game",
    "figure_name": player1.figure_name,
  }
  gameSocket.send(JSON.stringify(join_game));
};

startButton = document.querySelector("#start-game")

if ( startButton !== null ) {
  startButton.addEventListener("click", (event) => {
    event.preventDefault();
    if(document.querySelectorAll('#playerList li').length === 0) {
    // playerList = document.getElementById("otherPlayers")
    // if ( playerList.childNodes > 1 ){
      start_game = {
        "action": "start-game",
        "game_id": game.id,
      }
      gameSocket.send(JSON.stringify(start_game));
    }
    else {
      alert("More Than 1 player required!")
    }
  })
}

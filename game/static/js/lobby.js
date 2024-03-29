import { announce, newGame } from './modules/users.mjs';


if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://";
}


const userName = JSON.parse(document.getElementById('user-name').textContent);

const lobbySocket = new WebSocket(
  ws_scheme +
  window.location.host +
  '/ws/game/lobby'
);

lobbySocket.onmessage = function(message) {
  let msg_data = message.data;
  let my_data = JSON.parse(msg_data).message;
  if (my_data.action === "join-lobby") {
    announce(my_data.user_name, userName, my_data.info_txt);
  } else if (my_data.action === "new-game") {
      newGame(my_data.user_name, userName, my_data.game_id, my_data.info_txt, lobbySocket);
  } else if (my_data.action === "delete-game") {
    let gameElements = document.getElementById('gamesList').childNodes;
    gameElements.forEach( function(el) {
      console.log(el.textContent);
      if (el.textContent.includes(my_data.game_id)) {
        el.remove();
      }
    });
  }
};

lobbySocket.onclose = function(e) {
  console.log('Lobby socket closed.');
};

lobbySocket.onopen = function() {
  console.log("lobby: on open being called");
  let join_lobby = {
    "action": "join-lobby",
    "user_name": userName,
  };
  lobbySocket.send(JSON.stringify(join_lobby));
};

const playerHasGame = function(uname) {
  let hasGame = false;
  let currentElements = document.getElementById('gamesList').childNodes;
  currentElements.forEach((element) => {
    console.log(element.textContent);
    if( element.textContent.includes(uname)) {
        hasGame = true;
    }
  });
};

var newGameButton = document.querySelector("#create_game");

if ( newGameButton !== null ) {
  newGameButton.addEventListener("click", (event) => {
    if ( !playerHasGame(userName) ){ 
      event.preventDefault();
      let new_game = {
        "action": "new-game",
        "user_name": userName,
      };
      lobbySocket.send(JSON.stringify(new_game));
    }
    else {
      alert("Player already has game!");
    }
  });
}


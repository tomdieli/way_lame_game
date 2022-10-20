import { announce, newGame } from './modules/users.mjs';

// Support TLS-specific URLs, when appropriate.
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
  // console.log("DATA: ")
  // for( k in my_data ) {
  //   console.log(k + ": " + my_data[k])
  // }
  if (my_data.action === "join-lobby") {
    announce(my_data.user_name, userName, my_data.info_txt);
    // found = null
    // currentElements = document.getElementById('otherUsers').childNodes;
    // currentElements.forEach( function(el) {
    //   console.log(el.textContent)
    //   if (el.textContent.includes(my_data['user_name'])) {
    //     found = my_data['user_name']
    //   }
    // })
    // if((found === null) && (my_data['user_name'] !== userName)) {
    //   document.querySelector("#status").textContent += my_data['info_txt'] + "\n"
    //   document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
    //   theDiv = document.getElementById('otherUsers')
    //   newNode = document.createElement('p')      
    //   newNode.innerHTML = my_data['user_name']
    //   theDiv.appendChild(newNode)
    // }
  } else if (my_data.action === "new-game") {
      newGame(my_data.user_name, userName, my_data.game_id, my_data.info_txt, lobbySocket);
      // console.log("Stub for New Game")
      // document.querySelector("#status").textContent += my_data['info_txt'] + "\n"
      // document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
      // let theList = document.getElementById('gamesList')
      // let newNode = document.createElement('li')      
      // newNode.innerHTML = "Game " + my_data['game_id'] + " By " + my_data['user_name']
      // let joinLink = document.createElement('a')
      // joinLink.innerHTML = " JOIN "
      // joinLink.setAttribute('href', 'games/' + my_data['game_id'] + '/add/' )
      // newNode.appendChild(joinLink)
      // if( my_data['user_name'] === userName ){
      //   let deleteButton = document.createElement('button')
      //   deleteButton.innerHTML = " DELETE "
      //   deleteButton.value = my_data['game_id']
      //   deleteButton.onclick = function(event) {
      //     event.preventDefault()
      //     console.log("Stub for delete game event")
      //     delete_game = {
      //       "action": "delete-game",
      //       "user_name": userName,
      //       "game_id": event.target.value,
      //     }
      //     lobbySocket.send(JSON.stringify(delete_game));
      //   }
      //   newNode.appendChild(deleteButton)
      // }
      // theList.appendChild(newNode)
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


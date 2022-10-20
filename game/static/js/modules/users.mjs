export const name = 'users';

// what happens to the UI when user joins lobby
//
// -announce in status box
// -update/refresh list of users
// 

export function announce(userName, thisName, infoText){
    let found = null
    let currentElements = document.getElementById('otherUsers').childNodes;
    currentElements.forEach( function(el) {
      // console.log(el.textContent)
      if (el.textContent.includes(userName)) {
        found = userName
      }
    })
    if((found === null) && (userName !== thisName)) {
      document.querySelector("#status").textContent += infoText + "\n"
      document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
      let theDiv = document.getElementById('otherUsers')
      let newNode = document.createElement('p')      
      newNode.innerHTML = my_data['user_name']
      theDiv.appendChild(newNode)
    }
}

export function newGame(userName, thisUser, gameID, infoText, sock){
    let socko = sock
    document.querySelector("#status").textContent += infoText + "\n"
    document.getElementById("status").scrollTop = document.getElementById("status").scrollHeight
    let theList = document.getElementById('gamesList')
    let newNode = document.createElement('li')      
    newNode.innerHTML = "Game " + gameID + " By " + userName
    let joinLink = document.createElement('a')
    joinLink.innerHTML = " JOIN "
    joinLink.setAttribute('href', 'games/' + gameID + '/add/' )
    newNode.appendChild(joinLink)
    if( userName === thisUser ){
      let deleteButton = document.createElement('button')
      deleteButton.innerHTML = " DELETE "
      deleteButton.value = gameID
      deleteButton.onclick = function(event) {
        event.preventDefault()
        console.log("Stub for delete game event")
        let delete_game = {
          "action": "delete-game",
          "user_name": thisUser,
          "game_id": event.target.value,
        }
        socko.send(JSON.stringify(delete_game));
      }
      newNode.appendChild(deleteButton)
    }
    theList.appendChild(newNode)
}

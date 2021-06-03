export class Receiver {
  constructor(gameSocket) {
    this.players = null;
    this.gameSocket = gameSocket;
  }

  initiative(name){
    const initRoller = {
      action: "initiative",
      name: name,
    }
    this.gameSocket.send(JSON.stringify(initRoller));
  }

  move(playerName, coords, newStates) {
    const move = {
      "action": "move",
      "player_name": playerName,
      "coords": coords,
      "new_states": newStates
    }
    this.gameSocket.send(JSON.stringify(move));
  };

  attack(attacker, attackeeName) {
    const weapon = attacker.getPrimaryWeapon();
    const attackee = this.players.find(opponent => attackeeName === opponent.figure_name);
    const attackInfo = {
      "action": "attack",
      "attacker": attacker.attackInfo(),
      "attackee": attackee.defendInfo(),
      "weapon": weapon
    }
    this.gameSocket.send(JSON.stringify(attackInfo));
  };

  getUp(player) {
    const getUp = {
      "action": "get-up",
      "prone_one": player[0].defendInfo(),
    }
    this.gameSocket.send(JSON.stringify(getUp));
  };

  dodge(playerdata) {
    const player = playerdata[0]
    const dodge = {
      "action": "dodge",
      "dodger": player,
    }
    this.gameSocket.send(JSON.stringify(dodge));
  };

  pickUp(player) {
    const getUp = {
      "action": "pick-up",
      "picker": player.attackInfo(),
    }
    this.gameSocket.send(JSON.stringify(getUp));
  };

  pass(player) {
    const pass = {
      "action": "pass",
      "passer": player.attackInfo(),
    }
    this.gameSocket.send(JSON.stringify(pass));
  };
}




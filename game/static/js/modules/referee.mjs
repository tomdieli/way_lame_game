export class Receiver {
  constructor(gameSocket) {
    this.players = [];
    this.gameSocket = gameSocket;
  }

  registerPlayers(playerList) {
    this.players = [...playerList].map(player => ({ ...player}));
  }

  attack(players) {
    const [attacker, attackeeName] = players;
    let weapon = attacker.getPrimaryWeapon();
    let attackee = this.players.find(opponent => attackeeName === opponent.figure_name);
    delete attackee.opponents;
    delete attackee.commands;
    const attackInfo = {
      "action": "attack",
      "attacker": attacker.getStats(),
      "attackee": attackee,
      "weapon": weapon
    }
    this.gameSocket.send(JSON.stringify(attackInfo));
  };

  getUp(player) {
    const getUp = {
      "action": "get-up",
      "prone_one": player,
    }
    this.gameSocket.send(JSON.stringify(getUp));
  };

  dodge() {};

  pickUp(player) {
    const getUp = {
      "action": "pick-up",
      "picker": player,
    }
    this.gameSocket.send(JSON.stringify(getUp));
  };
}




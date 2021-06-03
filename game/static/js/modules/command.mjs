class Command {
  constructor(receiver) {
    this.receiver = receiver;
  };
};

class Initiative extends Command{
  execute(args){
    const [name] = args;
    this.receiver.initiative(name);
  }

  rule(dummy,gamePhase) {
    return gamePhase === "initiative";
  }
}

class Move extends Command{
  execute(args){
    const [player_id, coords, newStates] = args;
    this.receiver.move(player_id, coords, newStates);
  }

  rule(player, gamePhase) {
    return (
      gamePhase === "movement" &&
      !player.penalties.includes('prone')
    );
  }
}

class Attack extends Command {
  execute(args){
    const [attacker, attackeeName] = args;
    this.receiver.attack(attacker, attackeeName);
  };

  rule(player, gamePhase) {
    return (
      gamePhase === "action" &&
      !player.penalties.includes('prone') &&
      !player.penalties.includes('dropped_weapon') &&
      player.marker.hittable.size > 0
    );
  }
};

class Dodge extends Command {
  execute(figure){
    this.receiver.dodge(figure);
  };

  rule(player, gamePhase) {
    return (
      gamePhase === "action" &&
      !player.penalties.includes('prone')
    )
  }
};

class GetUp extends Command {
  execute(figure){
    this.receiver.getUp(figure)
  };

  rule(player, gamePhase) {
    //return player.prone;
    return (
      gamePhase === "action" &&
      player.penalties.includes('prone')
    );
  }
};

class PickUp extends Command {
  execute(figure){
    this.receiver.pickUp(figure)
  };

  rule(player, gamePhase) {
    // return player.dropped_weapon;
    return (
      gamePhase === "action" &&
      !player.penalties.includes('prone') &&
      player.penalties.includes('dropped_weapon')
    );
  }
};

class Pass extends Command {
  execute(figure){
    this.receiver.pass(figure)
  };

  rule(player, gamePhase) {
    return gamePhase === "action" ||
    (gamePhase === "movement" && player.penalties.includes('prone'));
  }
};

export {Attack, Dodge, GetUp, PickUp, Move, Initiative, Pass}
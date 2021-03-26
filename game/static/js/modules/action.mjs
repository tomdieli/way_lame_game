class Command {
  constructor(receiver) {
    this.receiver = receiver;
  };
};

class Attack extends Command {
  execute(...argos){
    const [attacker, attackeeName] = argos;
    this.receiver.attack(attacker, attackeeName)
  };

  rule(player) {
    return !(player.prone || player.dropped_weapon);
  }
};

class Dodge extends Command {
  execute(figure){
    this.receiver.dodge(figure)
  };

  rule(player) {
    return !player.prone;
  }
};

class GetUp extends Command {
  execute(figure){
    this.receiver.getUp(figure)
  };

  rule(player) {
    return player.prone;
  }
};

class PickUp extends Command {
  execute(figure){
    this.receiver.pickUp(figure)
  };

  rule(player) {
    return player.dropped_weapon;
  }
};

export {Attack, Dodge, GetUp, PickUp}
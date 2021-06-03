export class Action {
  static createAction(name, ...playerData) {
    switch(name) {
      case 'attack':
        return AttackForm.getAction(playerData);
      case 'get-up':
        return GetUpButton.getAction(playerData);
      case 'pick-up':
        return PickUpButton.getAction(playerData);
      case 'move':
        return MoveButton.getAction(playerData)
      case 'initiative':
        return InitiativeButton.getAction(playerData)
      case 'pass':
        return PassButton.getAction(playerData)
      case 'dodge':
        return DodgeButton.getAction(playerData)
    }
  }
}


class AttackForm {
  static getAction(playerData){

    const attacker = playerData[0];
    const opponents = attacker.marker.hittable;

    const actionElement = document.createElement('form');
    actionElement.id = 'attack-form';

    const selectList = document.createElement("select");
    selectList.id = "opponent";
    for (const figure_name of opponents) {
      const option = document.createElement("option");
      option.value = figure_name;
      option.text = figure_name;
      selectList.appendChild(option);
    }
    actionElement.appendChild(selectList);

    const submitButton = document.createElement("input");
    submitButton.setAttribute("type", "submit");
    actionElement.appendChild(submitButton);

    actionElement.addEventListener("submit", (event) => {
      event.preventDefault();
      const selection  = document.querySelector("#opponent").value;
      attacker.execute('attack', attacker, selection)
    });
    return actionElement;
  };
}

class PassButton {
  static getAction(playerData){
    let player = playerData[0];
    let actionElement = document.createElement("button");
    actionElement.innerHTML = "End Turn";
    actionElement.id = "pass";
    actionElement.disabled = false;

    actionElement.addEventListener("click", () => {
      player.execute('pass', player.figure_name)
    });
    return actionElement;
  }
};

class InitiativeButton {
  static getAction(playerData){
    let player = playerData[0];
    let actionElement = document.createElement("button");
    actionElement.innerHTML = "Roll Initiative";
    actionElement.id = "initiative";
    actionElement.disabled = false;

    actionElement.addEventListener("click", () => {
      player.execute('initiative', player.figure_name)
    });
    return actionElement;
  }
};

class MoveButton {
  static getAction(playerData){
    const player = playerData[0];
    const actionElement = document.createElement("button");
    actionElement.innerHTML = "Done";
    actionElement.id = "move";
    actionElement.disabled = true;
    
    actionElement.addEventListener("click", () => {
      const locationData = {
        x: player.marker.hex.x,
        y: player.marker.hex.y,
        d: player.marker.direction
      }
      const controlData = {
        engaged: [...player.marker.engagedWith],
        hittable: [...player.marker.hittable]
      }
      player.execute('move', player.figure_name, locationData, controlData);
    });
    return actionElement;
  };
}

class GetUpButton {
  static getAction(player){
    let figure = player[0];
    let actionElement = document.createElement("button");
    actionElement.innerHTML = "Get Up";
    actionElement.id = "get-up";
    actionElement.disabled = true;

    actionElement.addEventListener("click", () => {
      figure.execute('get-up', figure.defendInfo())
    });
    return actionElement;
  };
}

class PickUpButton {
  static getAction(player){
    let figure = player[0];
    const actionElement = document.createElement("button");
    actionElement.innerHTML = "Pick Up Weapon";
    actionElement.id = "pick-up";
    actionElement.disabled = true;

    actionElement.addEventListener("click", () => {
      figure.execute('pick-up', figure.attackInfo())
    });
    return actionElement;
  }
};

class DodgeButton {
  static getAction(player){
    let figure = player[0];
    const actionElement = document.createElement("button");
    actionElement.innerHTML = "Dodge";
    actionElement.id = "dodge";
    actionElement.disabled = true;

    actionElement.addEventListener("click", () => {
      figure.execute('dodge', figure.defendInfo())
    });
    return actionElement;
  }
};




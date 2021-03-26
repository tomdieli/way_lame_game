export class Action {
  static createAction(name, ...playerData) {
    switch(name) {
      case 'attack':
        return AttackForm.getAction(playerData);
      case 'get-up':
        return GetUpButton.getAction(playerData[0]);
      case 'pick-up':
        return PickUpButton.getAction(playerData[0]);
    }
  }
}


class AttackForm {
  static getAction(playerData){

    const attacker = playerData[0];
    const opponents = playerData[1];

    const actionElement = document.createElement('form');
    actionElement.id = 'attack-form';

    const selectList = document.createElement("select");
    selectList.id = "opponent";
    for (const figure of opponents) {
      const option = document.createElement("option");
      option.value = figure.figure_name;
      option.text = figure.figure_name;
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

class GetUpButton {
  static getAction(player){
    const actionElement = document.createElement("button");
    actionElement.innerHTML = "Get Up";
    actionElement.id = "get-up";
    actionElement.disabled = true;

    actionElement.addEventListener("click", 
      player.execute('get-up', player)
    );
    return actionElement;
  };
}

class PickUpButton {
  static getAction(player){
    const actionElement = document.createElement("button");
    actionElement.innerHTML = "Pick Up Weapon";
    actionElement.id = "pick-up";
    actionElement.disabled = true;

    actionElement.addEventListener("click",
      player.execute('pick-up', player)
    );
    return actionElement;
  }
};

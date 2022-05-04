import random

from django.contrib.auth.models import User

from game.models import Item, Figure, Item, Game


def create_game(user_name):
    owner = User.objects.get(username=user_name)
    game = Game.objects.create(owner=owner)
    return game.id


def delete_game(game_id):
    game = Game.objects.get(id=game_id)
    return game.delete()


def roll_dice(num_dice=1):
    rolls = []
    for die in range(1, num_dice + 1):
        die_roll = random.randrange(1, 7)
        rolls.append(die_roll)
    return rolls


def roll_init():
    roll = roll_dice(3)
    return roll

def pre_attack_info(weapon, disadvantage=False):
    # Provides most info needed to perform the attack action.

    attack_info = {}
    if disadvantage:
        attack_info['num_dice'] = 4
        attack_info['auto_miss'] = 20
        attack_info['fumble_mod'] = 2
    else:
        attack_info['num_dice'] = 3
        attack_info['auto_miss'] = 16
        attack_info['fumble_mod'] = 1
    attack_info['damage_dice'] = weapon['damage_dice']
    attack_info['damage_mod'] = weapon['damage_mod']
    return attack_info

def get_hit_takes(inventory):
    armourshields = [i for i in inventory if i['hit_takes'] != 0]
    if armourshields:
        desc = ''
        hit_takes = 0
        for armour in armourshields:
            hit_takes = armour['hit_takes']
            desc += f'{armour["name"]}, '
    return hit_takes, desc

def attack_results(binfo):
    # contains the info that will be published to each player.
    rolls = roll_dice(binfo['num_dice'])
    attack_roll = sum(rolls)
    attack_dict = {
            'status': None,
            'rolls': rolls,
            'roll': attack_roll,
            'damage_rolls': [],
            'damage': 0,
    }
    if ((binfo['attacker_dx'] >= attack_roll) and (attack_roll <= binfo['auto_miss'])) or\
            (attack_roll <= 5):
        attack_dict['status'] = 'Hit'
        damage_rolls = roll_dice(binfo['damage_dice'])
        damage_roll = sum(damage_rolls)
        attack_damage = damage_roll + binfo['damage_mod']
        if attack_roll == 3:
            attack_damage *= 3
            attack_dict['status'] += '-TripleDamage'
        if attack_roll == 4:
            attack_damage *= 2
            attack_dict['status'] += '-DoubleDamage'
        attack_dict['damage_rolls'] = damage_rolls
        attack_dict['damage'] = attack_damage
    else:
        # TODO: get broken weapon to work
        attack_dict['status'] = 'Miss'
        if attack_roll >= binfo['auto_miss'] + binfo['fumble_mod']:
            attack_dict['status'] += '-DroppedWeapon'
        elif attack_roll >= binfo['auto_miss'] + (binfo['fumble_mod'] * 2):
            attack_dict['status'] += '-BrokenWeapon'
    return attack_dict

# this one called first
def attack(attacker, attackee, weapon):
    battle_info = pre_attack_info(weapon, attackee['dodging'])
    battle_info['hit_takes'], battle_info['armor'] = get_hit_takes(attackee['equipped_items'])
    battle_info['attacker_dx'] = attacker['adj_dx']
    attacker_name = attacker['figure_name']
    attackee_name = attackee['figure_name']
    message = "player %s attacks player %s.\n" % (attacker_name, attackee_name)
    result = attack_results(battle_info)
    if attackee['dodging']:
        message += "player %s is dodging. it's a 4-die roll. " % attackee_name
        attackee['dodging'] = False
    message += "Dice rolls: %s -> %s, Result: %s. " % (result['rolls'], result['roll'], result['status'])
    if result['status'].startswith('Hit'):
        message += "Damage dice rolls: %s -> %s, Result: %s " % (result['damage_rolls'], result['damage'], result['status'])
        damage = result['damage']
        message += f"{battle_info['armor']} removes {battle_info['hit_takes']}" 
        f"hits from the damage total of {damage}. "
        damage -= battle_info['hit_takes']
        if damage < 0:
            damage = 0
        message += "Total damage to Player %s: %s. " % (attackee_name, damage)
        attackee['hits'] -= damage
        if attackee['hits'] <= 0:
            attackee['hits'] = 0
            attackee['penalties'].append('DEAD')
            message += "Player %s is DEAD!!!. " % attackee_name
        elif damage >= 8:
            message += "Player %s is PRONE due to heavy damage. " % attackee_name
            attackee['penalties'].append('prone')
        elif damage >= 5:
            message += "Player %s has -2 ADJ_DX next turn due to heavy damage. " % attackee_name
            attackee['penalties'].append('dx_adj')
        elif attackee['hits'] <= 3:
            message += "Player %s has -3 ADJ_DX next turn due to low hits. " % attackee_name
            attackee['penalties'].append('st_dx_adj')
        
    elif 'Weapon' in result['status']:
        if weapon:
            message += "Player %s dropped his weapon. " % attacker_name
            attacker['penalties'].append('dropped_weapon')
    result['message'] = message
    result['attacker'] = attacker
    result['attackee'] = attackee
    return result

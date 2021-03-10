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
        # print('die %s of %s: %s' % (die, num_dice, die_roll))
        rolls.append(die_roll)
    return rolls


def do_attack(attacker_dx, weapon, disadvantage=False):
    if disadvantage:
        num_dice = 4
        auto_miss = 20
        fumble_mod = 2
    else:
        num_dice=3
        auto_miss = 16
        fumble_mod = 1
    rolls = roll_dice(num_dice)
    attack_roll = sum(rolls)
    attack_dict = {
            'status': None,
            'rolls': rolls,
            'roll': attack_roll,
            'damage_rolls': [],
            'damage': 0,
    }
    if ((attacker_dx >= attack_roll) and (attack_roll <= auto_miss)) or\
            (attack_roll <= 5):
        attack_dict['status'] = 'Hit'
        damage_dice = weapon['damage_dice']
        damage_mod = weapon['damage_mod']
        damage_rolls = roll_dice(damage_dice)
        damage_roll = sum(damage_rolls)
        attack_damage = damage_roll + damage_mod
        if attack_roll == 3:
            attack_damage *= 3
            attack_dict['status'] += '-TripleDamage'
        if attack_roll == 4:
            attack_damage *= 2
            attack_dict['status'] += '-DoubleDamage'
        attack_dict['damage_rolls'] = damage_rolls
        attack_dict['damage'] = attack_damage
    else:
        attack_dict['status'] = 'Miss'
        if attack_roll >= auto_miss + fumble_mod:
            attack_dict['status'] += '-DroppedWeapon'
        elif attack_roll >= auto_miss + (fumble_mod * 2):
            attack_dict['status'] += '-BrokenWeapon'
    return attack_dict


def attack(attacker, attackee, weapon):
    attacker_name = attacker['figure_name']
    attacker_dex = attacker['dexterity']
    attackee_name = attackee['figure_name']
    message = "player %s attacks player %s.\n" % (attacker_name, attackee_name)
    # weapon = attacker.items.exclude(damage_dice=0)
    if attackee['dodging']:
        message += "player %s is dodging. it's a 4-die roll. " % attackee_name
        result = do_attack(attacker.adjusted_dex, weapon, disadvantage=True)
        attackee.dodging = False
    else:
        result = do_attack(attacker_dex, weapon)
        message += "Dice rolls: %s -> %s, Result: %s. " % (result['rolls'], result['roll'], result['status'])
    if result['status'].startswith('Hit'):
        message += "Damage dice rolls: %s -> %s, Result: %s " % (result['damage_rolls'], result['damage'], result['status'])
        damage = result['damage']
        armourshields = [i for i in attackee['equipped_items'] if i['hit_takes'] != 0]
        if armourshields:
            hit_takes = 0
            for armour in armourshields:
                hit_takes = armour['hit_takes']
                message += "%s removes %s hits from the damage total of %s. " % (armour['name'], hit_takes, damage)
                damage -= hit_takes
                if damage < 0:
                    damage = 0
        message += "Total damage to Player %s: %s. " % (attackee_name, damage)
        attackee['hits'] -= damage
        if attackee['hits'] <= 0:
            attackee['hits'] = 0
            message += "Player %s is DEAD!!!. " % attackee_name
        if damage >= 8:
            message += "Player %s is PRONE due to heavy damage. " % attackee_name
            attackee['prone'] = True
        elif damage >= 5:
            message += "Player %s has -2 ADJ_DX next turn due to heavy damage. " % attackee_name
            attackee['dx_adj'] = True
    elif 'Weapon' in result['status']:
        if weapon:
            message += "Player %s dropped his weapon. " % attacker_name
            attacker['dropped_weapon'] = True
    result['message'] = message
    result['attacker'] = attacker
    result['attackee'] = attackee
    return result

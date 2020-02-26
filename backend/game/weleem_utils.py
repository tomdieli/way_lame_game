import random

from game.models import Item


def roll_dice(num_dice=1):
    rolls = []
    for die in range(1, num_dice + 1):
        die_roll = random.randrange(1, 7)
        print('die %s of %s: %s' % (die, num_dice, die_roll))
        rolls.append(die_roll)
    # print('rolls: %s, roll total: %s' % (rolls, sum(rolls)))
    return rolls


def do_attack(attacker_dx, weapon_name=None, disadvantage=False):
    #print("dx: %s, weapon_name: %s, disadvantage: %s" % (attacker_dx, weapon_name, disadvantage))
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

        if not weapon_name:
            damage_dice = 1
            damage_mod = -3
            weapon_name = 'Fist'
        else:
            weapon = Item.objects.get(name=weapon_name)
            damage_dice = weapon.damage_dice
            damage_mod = weapon.damage_mod
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

from unittest.mock import patch

from django.test import TestCase

from game.weleem_utils import roll_dice, do_attack
from game.models import Game, Figure, Item


class RollDiceTests(TestCase):
    def test_one_die(self):
        my_roll = roll_dice()

    def test_three_dice(self):
        my_roll = roll_dice(3)

    def test_bad_values(self):
        pass


class AttackTests(TestCase):
    def setUp(self):
        my_game = Game.objects.create()
        dagger = Item.objects.create(
                name='Dagger',
                damage_dice=1,
                damage_mod=-1,
                equip_pts=1,
                equipped=True
        )
        leather = Item.objects.create(
                name='Leather Armour',
                hit_takes=2,
                adj_ma=8,
                dx_adj=2,
                equipped=True
        )
        self.roll_patch = patch('game.weleem_utils.roll_dice')
        self.roll_mock = self.roll_patch.start()
        self.attacker = Figure.objects.create()
        self.attacker.items.add(dagger, leather)

        self.attackee = Figure.objects.create()
        self.attackee.items.add(dagger, leather)

    def tearDown(self):
        self.roll_patch.stop()

    def test_attack_hit(self):
        self.roll_mock.return_value = [1, 2, 4]
        result = do_attack(self.attacker.adjusted_dex, 'Dagger')

    def test_attack_miss(self):
        self.roll_mock.return_value = [2,4,6]
        result = do_attack(self.attacker.adjusted_dex, 'Dagger')

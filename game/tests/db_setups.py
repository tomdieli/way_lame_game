from django.test import TestCase, Client
from django.contrib.auth.models import User

from game.models import Game, Figure, Item


class NewUserTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='joe', password='super_secret')
        self.client = Client()
        self.client.login(username='joe', password='super_secret')
        self.leather_armor = Item.objects.create(
            name='Leather Armour',
            hit_takes=2,
            adj_ma=8,
            dx_adj=2
        )
        self.chain_armor = Item.objects.create(
            name='Chain Mail',
            hit_takes=2,
            adj_ma=6,
            dx_adj=3
        )
        self.short_sword = Item.objects.create(
            name='Short Sword',
            damage_dice=2,
            damage_mod=-1,
            equip_pts=1,
            min_st=11
        )
        self.long_sword = Item.objects.create(
            name='Two-Handed Sword',
            damage_dice=3,
            damage_mod=0,
            equip_pts=2,
            min_st=14,
        )


class ExisitingFigureTest(NewUserTest):
    def setUp(self):
        super(ExisitingFigureTest, self).setUp()
        self.figure = Figure.objects.create(
            figure_name='Ragnar',
            strength=12,
            dexterity=12,
            owner=self.user,
        )
        self.figure.items.set([self.short_sword,])
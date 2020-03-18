import pprint
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from game.models import Game, Figure, Item


class GameTests(APITestCase):
    def test_create_game_ok(self):
        player1 = Figure.objects.create()
        player2 = Figure.objects.create()
        data = {"player1": player1.id, "player2": player2.id}
        url = reverse('new-game')
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Game.objects.count(), 1)


class FigureTests(APITestCase):
    def test_create_player(self):
        url = reverse('new-player')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Figure.objects.count(), 1)

    def test_update_attributes(self):
        player = Figure.objects.create()
        compare_dict = {
            "figure_name": 'Ragnar',
            "id":player.id,
            "dexterity":12,
            "equipped_items":[],
            "dmg_penalty": False,
            "hits":12,
            "adjusted_dex":12,
            "movement_allowance":10,
            'prone': False,
            "adjusted_ma":10,
            "strength":12,
            'tmp_dx_mod': 0
        }
        args_dir = {'name': 'Ragnar', 'st': 4, 'dx': 4}
        url = reverse('edit-attributes', args=(player.id, ))
        response = self.client.put(url, data=args_dir)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Figure.objects.count(), 1)
        self.assertDictEqual(response.json(), compare_dict)


class PlayerItemTests(APITestCase):

    def setUp(self):
        self.my_game = Game.objects.create()
        self.player = Figure.objects.create()

    def test_add_weapon(self):
        item = Item.objects.create(
                name='Dagger',
                damage_dice=1,
                damage_mod=-1,
                equip_pts=1,
        )
        url = reverse('add-item', args=(self.player.id, ))
        response = self.client.put(url, data={'item_id': item.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_armour(self):
        item = Item.objects.create(
                name='Leather Armour',
                hit_takes=2,
                adj_ma=8,
                dx_adj=2
        )
        url = reverse('add-item', args=(self.player.id, ))
        response = self.client.put(url, data={'item_id': item.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_shield(self):
        item_one = Item.objects.create(
                name='Dagger',
                damage_dice=1,
                damage_mod=-1,
                equip_pts=1,
        )
        item = Item.objects.create(
                name='Large Shield',
                hit_takes=2,
                equip_pts=1,
                dx_adj=1
        )
        url = reverse('add-item', args=(self.player.id, ))
        response = self.client.put(url, data={'item_id': item.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(url, data={'item_id': item_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PlayerAttackTests(APITestCase):

    def setUp(self):
        weapon = Item.objects.create(
                name='Short Sword',
                damage_dice=2,
                damage_mod=-1,
                equip_pts=1,
        )
        armour = Item.objects.create(
                name='Leather Armour',
                hit_takes=2,
                adj_ma=8,
                dx_adj=2
        )
        shield = Item.objects.create(
                name='Large Shield',
                hit_takes=2,
                adj_ma=8,
                equip_pts=1,
                dx_adj=2
        )
        self.player_one = Figure.objects.create()
        self.player_two = Figure.objects.create()
        ###### set up players #####
        # set up flavius' initial traits
        flavius_args = {'name': 'Flavius', 'st': 3, 'dx': 5}
        url = reverse('edit-attributes', args=(self.player_one.id, ))
        response = self.client.put(url, data=flavius_args)
        # add flavius' Items
        url = reverse('add-item', args=(self.player_one.id, ))
        response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': weapon.id})
        response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': shield.id})
        # self.player_one.items.add(weapon, armour)
        wulf_args = {'name': 'Wulf', 'st': 6, 'dx': 2}
        url = reverse('edit-attributes', args=(self.player_two.id, ))
        response = self.client.put('http://127.0.0.1:8000'+url, data=wulf_args)
        # add wulf's Items
        url = reverse('add-item', args=(self.player_two.id, ))
        response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': weapon.id})
        response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': armour.id})
        self.my_game = Game.objects.create()
        self.my_game.players.add(self.player_one)
        self.my_game.players.add(self.player_two)


    @patch('game.weleem_utils.roll_dice')
    def test_player_attack_hit(self, dice_mock):
        dice_mock.return_value = [2,2,2]
        url = reverse('attack', args=(self.player_one.id, ))
        response = self.client.put(url, data={'attackee': self.player_two.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('game.weleem_utils.roll_dice')
    def test_other_player_attack_hit(self, dice_mock):
        dice_mock.return_value = [2,2,2]
        url = reverse('attack', args=(self.player_two.id, ))
        response = self.client.put(url, data={'attackee': self.player_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('game.weleem_utils.roll_dice')
    def test_other_player_attack_hit_to_prone(self, dice_mock):
        dice_mock.side_effect = [[2,2,2], [3,3,3], [4,4,4], [1,1,1], [4,4,4]]
        orig_adj_dx = self.player_two.adjusted_dex
        url = reverse('attack', args=(self.player_one.id, ))
        response = self.client.put(url, data={'attackee': self.player_two.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        url = reverse('next-turn',args=(self.my_game.id, ))
        response = self.client.put(url)
        url = reverse('attack', args=(self.player_two.id, ))
        response = self.client.put(url, data={'attackee': self.player_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        url = reverse('next-turn',args=(self.my_game.id, ))
        response = self.client.put(url)
        url = reverse('attack', args=(self.player_two.id, ))
        response = self.client.put(url, data={'attackee': self.player_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('game.weleem_utils.roll_dice')
    def test_player_attack_dropped_weapon(self, dice_mock):
        dice_mock.side_effect= [[6,6,5], [1,2,3], [6,]]
        url = reverse('attack', args=(self.player_two.id, ))
        response = self.client.put(url, data={'attackee': self.player_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(url, data={'attackee': self.player_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_player_defend(self):
        url = reverse('defend', args=(self.player_one.id, ))
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_next_turn(self):
        old_turn = self.my_game.current_round
        url = reverse('next-turn', args=(self.my_game.id, ))
        response = self.client.put(url)
        game = Game.objects.get(id=self.my_game.id)
        self.assertEqual(game.current_round, 1)

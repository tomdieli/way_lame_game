import pprint
from unittest.mock import patch
from unittest import main

from django.urls import reverse
from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from game.models import Game, Figure, Item

from .db_setups import NewUserTest, ExisitingFigureTest


class LobbyTests(TestCase):
    def test_go_to_lobby_ok(self):
        user = User.objects.create_user(username='jacob', password='top_secret')
        client = Client()
        client.login(username='jacob', password='top_secret')

        url = reverse('lobby')
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTemplateUsed('game/index_new.html')

    def test_go_to_login(self):
        # user = User.objects.create_user(username='jacob', password='top_secret')
        client = Client()
        #client.login(username='jacob', password='top_secret')

        url = reverse('lobby')
        response = client.get(url, follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTemplateUsed('game/index_new.html')


class CreateFigureTests(NewUserTest):
    def setUp(self):
        super(CreateFigureTests, self).setUp()
        self.data = {
            'figure_name': 'Ragnar',
            'strength': 12,
            'dexterity': 12,
            'owner': self.user,
            'items': [self.short_sword.id,]
        }

    def test_create_player_ok(self):
        url = reverse('new-player')
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(Figure.objects.count(), 1)

    def test_create_player_bad_stats(self):
        url = reverse('new-player')
        self.data['strength'] = 14
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Figure.objects.count(), 0)

    def test_create_player_no_slots(self):
        url = reverse('new-player')
        self.data['items'] = [self.short_sword.id, self.long_sword.id]
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Figure.objects.count(), 0)

    def test_create_player_no_st(self):
        url = reverse('new-player')
        self.data['items'] = [self.long_sword.id]
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Figure.objects.count(), 0)

    def test_create_player_too_many_armour(self):
        url = reverse('new-player')
        self.data['items'] = [self.leather_armor.id, self.chain_armor.id]
        response = self.client.post(url, self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Figure.objects.count(), 0)


class CreateGameTests(NewUserTest):
    def setUp(self):
        super(CreateGameTests, self).setUp()
        
    def test_create_ok(self):
        url = reverse('new-game')
        data = {'create_game': self.user.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(Game.objects.count(), 1)


class EditFigureTests(ExisitingFigureTest):
    def setUp(self):
        super(EditFigureTests, self).setUp()

    def test_delete(self):
        url = reverse('player-delete', args=(self.figure.id, ))
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(Figure.objects.count(), 0)

    def test_update_attributes(self):
        data = {
            'figure_name': 'Ragnar',
            'strength': 14,
            'dexterity': 10,
            'owner': self.user,
            'items': [self.long_sword.id,]
        }
        url = reverse('edit-attributes', args=(self.figure.id, ))
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(Figure.objects.count(), 1)
        

class GamePlayTests(ExisitingFigureTest):
    def setUp(self):
        super(GamePlayTests, self).setUp()
        self.game = Game.objects.create(owner=self.user)

    def test_delete(self):
        url = reverse('game-delete', args=(self.game.id, ))
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(Game.objects.count(), 0)

    def test_join_table(self):
        data = {'players': self.figure.id}
        url = reverse('game-add', args=(self.game.id, ))
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_join_game(self):
        url = reverse('join-game', args=(self.game.id, self.figure.id))
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_play(self):
        data = {'figure': self.figure.id}
        url = reverse('play-game', args=(self.game.id,))
        response = self.client.get(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    
if __name__ == '__main__':
    main()


# class PlayerItemTests(APITestCase):

#     def setUp(self):
#         self.my_game = Game.objects.create()
#         self.player = Figure.objects.create()

#     def test_add_weapon(self):
#         item = Item.objects.create(
#                 name='Dagger',
#                 damage_dice=1,
#                 damage_mod=-1,
#                 equip_pts=1,
#         )
#         url = reverse('add-item', args=(self.player.id, ))
#         response = self.client.put(url, data={'item_id': item.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_add_armour(self):
#         item = Item.objects.create(
#                 name='Leather Armour',
#                 hit_takes=2,
#                 adj_ma=8,
#                 dx_adj=2
#         )
#         url = reverse('add-item', args=(self.player.id, ))
#         response = self.client.put(url, data={'item_id': item.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_add_shield(self):
#         item_one = Item.objects.create(
#                 name='Dagger',
#                 damage_dice=1,
#                 damage_mod=-1,
#                 equip_pts=1,
#         )
#         item = Item.objects.create(
#                 name='Large Shield',
#                 hit_takes=2,
#                 equip_pts=1,
#                 dx_adj=1
#         )
#         url = reverse('add-item', args=(self.player.id, ))
#         response = self.client.put(url, data={'item_id': item.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         response = self.client.put(url, data={'item_id': item_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)


# class PlayerAttackTests(APITestCase):

#     def setUp(self):
#         weapon = Item.objects.create(
#                 name='Short Sword',
#                 damage_dice=2,
#                 damage_mod=-1,
#                 equip_pts=1,
#         )
#         armour = Item.objects.create(
#                 name='Leather Armour',
#                 hit_takes=2,
#                 adj_ma=8,
#                 dx_adj=2
#         )
#         shield = Item.objects.create(
#                 name='Large Shield',
#                 hit_takes=2,
#                 adj_ma=8,
#                 equip_pts=1,
#                 dx_adj=2
#         )
#         self.player_one = Figure.objects.create()
#         self.player_two = Figure.objects.create()
#         ###### set up players #####
#         # set up flavius' initial traits
#         flavius_args = {'name': 'Flavius', 'st': 3, 'dx': 5}
#         url = reverse('edit-attributes', args=(self.player_one.id, ))
#         response = self.client.put(url, data=flavius_args)
#         # add flavius' Items
#         url = reverse('add-item', args=(self.player_one.id, ))
#         response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': weapon.id})
#         response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': shield.id})
#         # self.player_one.items.add(weapon, armour)
#         wulf_args = {'name': 'Wulf', 'st': 6, 'dx': 2}
#         url = reverse('edit-attributes', args=(self.player_two.id, ))
#         response = self.client.put('http://127.0.0.1:8000'+url, data=wulf_args)
#         # add wulf's Items
#         url = reverse('add-item', args=(self.player_two.id, ))
#         response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': weapon.id})
#         response = self.client.put('http://127.0.0.1:8000'+url, data={'item_id': armour.id})
#         self.my_game = Game.objects.create()
#         self.my_game.players.add(self.player_one)
#         self.my_game.players.add(self.player_two)


#     @patch('game.weleem_utils.roll_dice')
#     def test_player_attack_hit(self, dice_mock):
#         dice_mock.return_value = [2,2,2]
#         url = reverse('attack', args=(self.player_one.id, ))
#         response = self.client.put(url, data={'attackee': self.player_two.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     @patch('game.weleem_utils.roll_dice')
#     def test_other_player_attack_hit(self, dice_mock):
#         dice_mock.return_value = [2,2,2]
#         url = reverse('attack', args=(self.player_two.id, ))
#         response = self.client.put(url, data={'attackee': self.player_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     @patch('game.weleem_utils.roll_dice')
#     def test_other_player_attack_hit_to_prone(self, dice_mock):
#         dice_mock.side_effect = [[2,2,2], [3,3,3], [4,4,4], [1,1,1], [4,4,4]]
#         orig_adj_dx = self.player_two.adjusted_dex
#         url = reverse('attack', args=(self.player_one.id, ))
#         response = self.client.put(url, data={'attackee': self.player_two.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         url = reverse('next-turn',args=(self.my_game.id, ))
#         response = self.client.put(url)
#         url = reverse('attack', args=(self.player_two.id, ))
#         response = self.client.put(url, data={'attackee': self.player_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         url = reverse('next-turn',args=(self.my_game.id, ))
#         response = self.client.put(url)
#         url = reverse('attack', args=(self.player_two.id, ))
#         response = self.client.put(url, data={'attackee': self.player_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     @patch('game.weleem_utils.roll_dice')
#     def test_player_attack_dropped_weapon(self, dice_mock):
#         dice_mock.side_effect= [[6,6,5], [1,2,3], [6,]]
#         url = reverse('attack', args=(self.player_two.id, ))
#         response = self.client.put(url, data={'attackee': self.player_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         response = self.client.put(url, data={'attackee': self.player_one.id})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_player_defend(self):
#         url = reverse('defend', args=(self.player_one.id, ))
#         response = self.client.put(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_next_turn(self):
#         old_turn = self.my_game.current_round
#         url = reverse('next-turn', args=(self.my_game.id, ))
#         response = self.client.put(url)
#         game = Game.objects.get(id=self.my_game.id)
#         self.assertEqual(game.current_round, 1)

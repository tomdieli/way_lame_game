from unittest import main

from django.urls import reverse
from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework import status

from game.models import Game, Figure

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
        client = Client()
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

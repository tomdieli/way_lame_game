import json
import pytest

from asgiref.sync import sync_to_async, async_to_sync

from django.conf import settings
from django.db import transaction
# from django.conf.urls import url
from django.urls import re_path
from django.contrib.auth.models import User

from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from channels.routing import URLRouter

from game.models import Game
from game.consumers import LobbyConsumer, GameConsumer, GamesConsumer
from game.managers import GameManager

@pytest.fixture(scope='function', autouse=True)
def create_user():
    with transaction.atomic():
        User.objects.all().delete()
        user = User.objects.create_user(username='popo', password='top_secret')
    return user


@pytest.fixture(scope='function', autouse=True)
def create_game():
    with transaction.atomic():
        Game.objects.all().delete()
        user = User.objects.create_user(username='popo', password='top_secret')
        game = Game.objects.create(owner=user)
    return game



@pytest.mark.parametrize("test_message,expected_response",[
    ({"action": "join-lobby", "user_name": "popo"},
        {"info_txt": "popo has joined the lobby!"}),
    ({"action": "new-game", "user_name": "popo"},
        {"info_txt": "popo has created game 1.",
        "game_id": 1}),
    # ({"action": "delete-game", "user_name": "popo", "game_id": 1},
    #     {"info_txt": "popo has deleted game 1.",
    #     "game_id": 1})
])

@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_lobby_consumer(test_message, expected_response):
    communicator = WebsocketCommunicator(GamesConsumer.as_asgi(), "GET", "/ws/game/lobby")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(test_message))
    response = await communicator.receive_from()
    response_dict = json.loads(response)
    print(f'response: {response_dict}')
    test_message.update(expected_response)
    assert response_dict == {"message": test_message}
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_game_consumer_join(create_game):
    test_message = {"action": "join-game", "figure_name": "popo"}
    # Use in-memory channel layers for testing.
    settings.CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }
    gc = GamesConsumer.as_asgi()
    man = GameManager(f'room_{create_game.id}')
    print(dir(gc))
    gc.consumer_class.active_games.append(man)
    application = URLRouter([
        re_path(r'ws/game/(?P<game_id>\d+)/$', ),gc
    ])
    print(f'/ws/game/{create_game.id}/')
    communicator = WebsocketCommunicator(application, f'/ws/game/{create_game.id}/')
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(test_message))
    response = await communicator.receive_from()
    response_dict = json.loads(response)
    # print(response_dict)
    # test_message.update(expected_response)
    # assert response_dict == {"message": test_message}
    await communicator.disconnect()


# @pytest.mark.django_db(transaction=True)
# @pytest.mark.asyncio
# async def test_game_consumer_initiative(mocker):
#     game = create_game()
#     test_message = {"action": "initiative", "name": "popo"}
#     # Use in-memory channel layers for testing.
#     settings.CHANNEL_LAYERS = {
#         'default': {
#             'BACKEND': 'channels.layers.InMemoryChannelLayer',
#         },
#     }
#     application = URLRouter([
#         re_path(r'ws/game/(?P<game_id>\d+)/$', GamesConsumer.as_asgi()),
#     ])
#     communicator = WebsocketCommunicator(application, '/ws/game/2/')
#     connected, subprotocol = await communicator.connect()
#     assert connected
#     my_manager = GameManager()
#     my_manager.game_phase = 'initiative'
#     print(my_manager)
#     await communicator.send_to(text_data=json.dumps(test_message))
#     response = await communicator.receive_from()
#     response_dict = json.loads(response)
#     print(response_dict)
#     # test_message.update(expected_response)
#     # assert response_dict == {"message": test_message}
#     await communicator.disconnect()


# @pytest.mark.django_db(transaction=True)
# @pytest.mark.asyncio
# async def test_game_consumer_movement():
#     # my_consumer = GameConsumer()
#     # my_consumer.game_phase = 'movement'
#     test_message = {"action": "movement", "name": "popo", "adj_dx": 12}
#     # Use in-memory channel layers for testing.
#     settings.CHANNEL_LAYERS = {
#         'default': {
#             'BACKEND': 'channels.layers.InMemoryChannelLayer',
#         },
#     }

#     application = URLRouter([
#         re_path(r'ws/game/(?P<game_id>\d+)/$', GamesConsumer.as_asgi()),
#     ])
#     communicator = WebsocketCommunicator(application, '/ws/game/1/')
#     connected, subprotocol = await communicator.connect()
#     assert connected
#     await communicator.send_to(text_data=json.dumps(test_message))
#     response = await communicator.receive_from()
#     response_dict = json.loads(response)
#     print(response_dict)
#     # test_message.update(expected_response)
#     # assert response_dict == {"message": test_message}
#     await communicator.disconnect()
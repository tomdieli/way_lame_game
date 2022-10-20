import json

import pytest
from channels.testing import WebsocketCommunicator
from game.consumers import LobbyConsumer

# @pytest.mark.django_db()
@pytest.mark.parametrize("test_message,expected_response",[
    ({"action": "join-lobby", "user_name": "popo"},
        {"info_txt": "popo has joined the lobby!"}),
    ({"action": "new-game", "user_name": "nopo"},
        {"info_txt": "nopo has created game 1.",
        "game_id": 1}),
    ({"action": "delete-game", "user_name": "nono", "game_id": 1},
        {"info_txt": "nono has deleted game 1.",
        "game_id": 1})
])
@pytest.mark.asyncio
async def test_my_consumer(test_message, expected_response, mocker):
    create_mock = mocker.patch('game.consumers.create_game')
    create_mock.return_value = 1
    delete_mock = mocker.patch('game.consumers.delete_game')
    # delete_mock.return_value = 'whocares'
    communicator = WebsocketCommunicator(LobbyConsumer.as_asgi(), "GET", "/ws/game/lobby")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(test_message))
    response = await communicator.receive_from()
    response_dict = json.loads(response)
    test_message.update(expected_response)
    assert response_dict == {"message": test_message}
    await communicator.disconnect()
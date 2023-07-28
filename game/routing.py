from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # re_path(r'ws/game/(?P<game_id>\d+)/$', consumers.GameConsumer),
    # re_path(r'ws/game/lobby$', consumers.LobbyConsumer),
    re_path(r'ws/game/lobby$|(?P<game_id>\d+)/$', consumers.GamesConsumer),
]

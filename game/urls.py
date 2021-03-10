from django.urls import path, include

from game import views

urlpatterns = [
    path('', views.lobby, name='lobby'),
    # path('new_game/', views.GameCreate.as_view(), name='new-game'),
    path('new_player/', views.PlayerCreate.as_view(), name='new-player'),
    path('players/', views.PlayerList.as_view(), name='player-list'),
    path('players/<int:pk>/', views.PlayerShow.as_view(), name='player-show'),
    path('players/<int:pk>/delete/', views.PlayerDelete.as_view(), name='player-delete'),
    path('players/<int:pk>/update/', views.PlayerUpdate.as_view(), name='edit-attributes'),
    # path('games/', views.GameList.as_view(), name='game-list'),
    # path('games/<int:pk>/', views.GameShow.as_view(), name='game-show'),
    path('games/<int:pk>/add/', views.GameAdd.as_view(), name='game-add'),
    path('games/<int:game_id>/play/', views.play, name='play-game'),
    path('games/<int:game_id>/join/<int:figure_id>', views.join, name='join-game'),
    # path('games/<int:pk>/edit/', views.GameUpdate.as_view(), name='game-update'),
    path('games/<int:pk>/delete/', views.game_delete, name='game-delete'),
    # path('games/<int:pk>/next_turn/', views.next_turn, name='next-turn'),
]

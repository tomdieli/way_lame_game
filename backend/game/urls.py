from django.contrib import admin
from django.urls import path, include

from game import views

urlpatterns = [
    path('new_game/', views.new_game, name='new-game'),
    path('new_player/', views.new_player, name='new-player'),
    path('games/<game_id>/next_turn/', views.next_turn, name='next-turn'),
    path('items/', views.item_list, name='item-list'),
    path('players/', views.player_list, name='player-list'),
    path('players/<player_id>/', views.player_show, name='player-show'),
    path('players/<player_id>/delete/', views.player_delete, name='player-delete'),
    path('players/<player_id>/edit_attributes/', views.edit_attributes, name='edit-attributes'),
    path('players/<player_id>/add_item/', views.add_item, name='add-item'),
    path('players/<player_id>/attack/', views.attack, name='attack'),
    path('players/<player_id>/defend/', views.defend, name='defend'),
    path('players/<player_id>/get_up/', views.defend, name='get-up'),
    path('new_item', views.new_item, name='new-item'),
]

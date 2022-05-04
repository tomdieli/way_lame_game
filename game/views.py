from django.urls import reverse_lazy
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.views.generic import ListView, DetailView
from django.views.generic.base import RedirectView

from django.views.generic.edit import CreateView, DeleteView, UpdateView, ModelFormMixin
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.template import RequestContext
from django.utils import timezone
from django.forms.widgets import Select

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from game.models import Game, Figure, Item
from game.serializers import GameSerializer, FigureSerializer
from game.serializers import ItemSerializer
from game.forms import FigureForm


@login_required
def lobby(request):
    uid_list = []
    refresh_games = False

    games = Game.objects.all()
    figures = Figure.objects.all()

    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    for session in sessions:
        data = session.get_decoded()
        uid_list.append(data.get('_auth_user_id', None))

    # Query all logged in users based on id list
    users = User.objects.filter(id__in=uid_list)

    context = {
        'users': users,
        'games': games,
        'figures': figures,
        'refresh_games': refresh_games,
    }
    return render(request, 'game/index.html', context)


@login_required
def join(request, game_id, figure_id):
    game = Game.objects.get(id=game_id)
    player1 = Figure.objects.get(id=figure_id)
    players = game.players
    context = {
        'game': GameSerializer(game).data,
        'player1': FigureSerializer(player1).data,
        'players': FigureSerializer(players, many=True).data,
    }
    return render(request, 'game/room.html', context)


@login_required
def play(request, game_id):
    figure_id = request.GET['figure']
    print(figure_id)
    game = Game.objects.get(id=game_id)
    player1 = Figure.objects.get(id=figure_id)
    players = game.players
    context = {
        'game': GameSerializer(game).data,
        'player1': FigureSerializer(player1).data,
        'players': FigureSerializer(players, many=True).data,
    }
    return render(request, 'game/game.html', context)


@login_required
def game_delete(request, pk):
    game = Game.objects.get(id=pk)
    game.delete()
    return redirect('lobby')

# class GameUpdate(LoginRequiredMixin, UpdateView):
#     model = Game
#     fields = ['id', 'current_round', 'players' ]


class GameAdd(LoginRequiredMixin, UpdateView):
    model = Game
    template_name = "game/add_player.html"
    fields = ['players']
    
    def get_form(self, *args, **kwargs):
        form = super(GameAdd, self).get_form(*args, **kwargs)
        form.fields['players'].queryset = Figure.objects.filter(owner=self.request.user)
        return form

    def get_success_url(self, **kwargs):
        player_id = int(self.get_form_kwargs()['data']['players'])
        return reverse_lazy('join-game', kwargs={'game_id': self.object.id, 'figure_id': player_id})

    def form_valid(self, form):
        player = form.cleaned_data['players'][0]
        game = Game.objects.get(pk=self.object.pk)
        game.players.add(player)
        game.save()
        return super(ModelFormMixin, self).form_valid(form)


# class GameList(ListView):
#     model = Game


# class GameShow(DetailView):
#     model = Game
    

class PlayerCreate(LoginRequiredMixin, CreateView):
    model = Figure
    form_class = FigureForm
    success_url = reverse_lazy('lobby')

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)


class PlayerUpdate(LoginRequiredMixin, UpdateView):
    model = Figure
    form_class = FigureForm
    success_url = reverse_lazy('lobby')


class PlayerDelete(LoginRequiredMixin, DeleteView):
    model = Figure
    success_url = reverse_lazy('player-list')


class PlayerList(ListView):
    model = Figure


class PlayerShow(DetailView):
    model = Figure

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

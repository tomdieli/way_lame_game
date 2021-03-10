from django.conf import settings
from django.urls import reverse
from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=30, unique=True)
    damage_dice = models.PositiveIntegerField(default=0)
    damage_mod = models.IntegerField(default=0)
    equip_pts = models.PositiveIntegerField(default=0)
    hit_takes = models.IntegerField(default=0)
    min_st = models.PositiveIntegerField(default=0)
    dx_adj = models.IntegerField(default=0)
    adj_ma = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Figure(models.Model):
    figure_name = models.CharField(max_length=30, unique=True )
    strength = models.IntegerField(default=8)
    dexterity = models.IntegerField(default=8)
    items = models.ManyToManyField(
            Item,
            related_name='player_items',
    )
    movement_allowance = models.IntegerField(default=10)
    experience = models.IntegerField(default=0)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    
    def get_absolute_url(self):
        return reverse('player-show', kwargs={'pk': self.pk})


class Game(models.Model):
    current_round = models.PositiveIntegerField(default=0)
    players = models.ManyToManyField(
            Figure,
            related_name='players_list',
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    def get_absolute_url(self):
        return reverse('game-show', kwargs={'pk': self.pk})

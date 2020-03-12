from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=30, unique=True)
    equipped = models.BooleanField(default=True)
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
    figure_name = models.CharField(max_length=30)
    strength = models.IntegerField(default=8)
    dexterity = models.IntegerField(default=8)
    items = models.ManyToManyField(
            Item,
            related_name='player_items',
    )

    hits = models.IntegerField(default=8)
    adjusted_dex = models.IntegerField(default=8)
    movement_allowance = models.IntegerField(default=10)
    adjusted_ma = models.IntegerField(default=10)
    experience = models.IntegerField(default=0)
    engaged = models.BooleanField(default=True)
    dmg_penalty = models.BooleanField(default=False)
    tmp_dx_mod = models.IntegerField(default=0)
    dodging = models.BooleanField(default=False)
    prone = models.BooleanField(default=False)
    facing = models.CharField(max_length=2, null=True)


class Game(models.Model):
    current_round = models.PositiveIntegerField(default=1)
    players = models.ManyToManyField(
            Figure,
            related_name='players_list',
    )

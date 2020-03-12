from rest_framework import serializers

from .models import Game, Figure, Item


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'name', 'damage_dice', 'damage_mod', 'hit_takes',
                    'min_st','adj_ma', 'dx_adj', 'equip_pts')


class FigureSerializer(serializers.ModelSerializer):

    equipped_items = serializers.SerializerMethodField()

    class Meta:
        model = Figure
        fields = (
                'figure_name',
                'id',
                'strength',
                'dexterity',
                'hits',
                'adjusted_dex',
                'movement_allowance',
                'dmg_penalty',
                'tmp_dx_mod',
                'prone',
                'adjusted_ma',
                'equipped_items'
        )

    def get_equipped_items(self, figure):
        return ItemSerializer(figure.items.all(), many=True).data


class GameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = ('id', 'current_round')


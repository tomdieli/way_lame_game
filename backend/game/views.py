from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from game.models import Game, Figure, Item
from game.serializers import GameSerializer, FigureSerializer
from game.serializers import ItemSerializer

from game.weleem_utils import do_attack


@api_view(['GET',])
def home(request):
    response_dict = {"message": "Welcome to the Weleem Home Page!!!"}
    return Response(response_dict, status=status.HTTP_200_OK)


@api_view(['POST',])
def new_game(request):
    player1 = request.data.get('player1')
    player2 = request.data.get('player2')
    new_game = Game.objects.create()
    new_game.players.add(player1)
    new_game.players.add(player2)
    serializer = GameSerializer(new_game)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def player_list(request):
    players = Figure.objects.all()
    serializer = FigureSerializer(players, many=True)
    return Response(serializer.data, status = status.HTTP_200_OK)


@api_view(['GET'])
def player_show(request, player_id):
    player = Figure.objects.get(id=player_id)
    serializer = FigureSerializer(player)
    return Response(serializer.data, status = status.HTTP_200_OK)


@api_view(['GET'])
def item_list(request):
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data, status = status.HTTP_200_OK)


@api_view(['DELETE'])
def player_delete(request, player_id):
    player = Figure.objects.get(pk=player_id)
    player.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST',])
def new_player(request):
    player = Figure.objects.create()
    serializer = FigureSerializer(player)
    return Response(serializer.data, status = status.HTTP_201_CREATED)


@api_view(['PUT',])
def next_turn(request, game_id):
    current_game = Game.objects.get(id=game_id)
    players = current_game.players.all()
    for player in players:
        if player.tmp_dx_mod:
            player.adjusted_dex += 2
            player.tmp_dx_mod = 0
            player.save()
        if player.dmg_penalty:
            player.adjusted_dex -= 2
            player.tmp_dx_mod = 2
            player.dmg_penalty = False
            player.save()
    current_game.current_round += 1
    current_game.save()
    serializer = GameSerializer(current_game)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT',])
def edit_attributes(request, player_id):
    figure_name = request.data.get('name')
    str_adj = int(request.data.get('st'))
    dex_adj = int(request.data.get('dx'))
    if str_adj + dex_adj != 8:
        return Response(
            "You must allot exactly 8 points to attributes, not %s" % (str_adj + dex_adj),
            status = status.HTTP_400_BAD_REQUEST
        )
    player = Figure.objects.get(id=player_id)
    player.figure_name = figure_name
    player.strength += str_adj
    player.dexterity += dex_adj
    player.hits = player.strength
    player.adjusted_dex = player.dexterity
    player.save()
    serializer = FigureSerializer(player)
    return Response(serializer.data, status = status.HTTP_200_OK)


@api_view(['PUT',])
def add_item(request, player_id):
    item_id = request.data.get('item_id')
    item_obj = Item.objects.get(id=item_id)
    player_obj = Figure.objects.get(id=player_id)
    # TODO: check for adequate slots
    current_slots = player_obj.items.all().exclude(equip_pts=0)
    slot_points = sum(slot.equip_pts for slot in current_slots)
    # print("SLOTS: %s, SLOT POINTS: %s" % (current_slots, slot_points))
    if slot_points + item_obj.equip_pts > 2:
        return Response(
                "Insufficient slots for that Item. player has: %s, required: %s"
                % (2-slot_points, item_obj.equip_pts),
                status = status.HTTP_400_BAD_REQUEST
        )
    if item_obj.damage_dice:
        # TODO: check for min str
        if item_obj.min_st > player_obj.strength:
            return Response(
                    "Insufficient str for that weapon. player: %s, required: %s"
                    % (player_obj.strength, item_obj.min_st),
                    status = status.HTTP_400_BAD_REQUEST
            )
    if item_obj.dx_adj:
        player_obj.adjusted_dex -= item_obj.dx_adj
    if item_obj.adj_ma:
        # TODO: check for 1 armour
        existing_armour = player_obj.items.all().exclude(adj_ma=0)
        if not existing_armour:
            player_obj.adjusted_ma = item_obj.adj_ma
        else:
            return Response(
                    "Cannot add armour: %s, player already has: %s"
                    % (item_obj.name, existing_armour.name),
                    status = status.HTTP_400_BAD_REQUEST
            )
    player_obj.items.add(item_obj)
    player_obj.save()
    serializer = FigureSerializer(player_obj)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST',])
def new_item(request):
    new_item = Item.objects.create()
    serializer = ItemSerializer(new_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT',])
def attack(request, player_id):
    attacker = Figure.objects.get(id=player_id)
    attacker_name = attacker.figure_name
    attackee_id = request.data.get('attackee')
    attackee = Figure.objects.get(id=attackee_id)
    attackee_name = attackee.figure_name
    message = "player %s attacks player %s.\n" % (attacker_name, attackee_name)
    weapons = attacker.items.exclude(damage_dice=0)
    if not weapons:
        weapon = None
        weapon_name = None
    else:
        weapon = weapons[0]
        weapon_name = weapon.name
    if attackee.dodging:
        message += "player %s is dodging. it's a 4-die roll. " % attackee_name
        result = do_attack(attacker.adjusted_dex, weapon_name, disadvantage=True)
        attackee.dodging = False
    else:
        result = do_attack(attacker.adjusted_dex, weapon_name)
    message += "Dice rolls: %s -> %s, Result: %s. " % (result['rolls'], result['roll'], result['status'])
    if result['status'].startswith('Hit'):
        message += "Damage dice rolls: %s -> %s, Result: %s " % (result['damage_rolls'], result['damage'], result['status'])
        damage = result['damage']
        armourshields = attackee.items.exclude(dx_adj=0)
        if armourshields:
            hit_takes = 0
            for armour in armourshields:
                hit_takes = armour.hit_takes
                message += "%s removes %s hits from the damage total of %s. " % (armour, hit_takes, damage)
                damage -= hit_takes
        message += "Total damage to Player %s: %s. " % (attackee_name, damage)
        attackee.hits -= damage
        if damage >= 8:
            message += "Player %s is PRONE due to heavy damage. " % attackee_name
            attackee.prone = True
        elif damage >= 5:
            message += "Player %s has -2 ADJ_DX next turn due to heavy damage. " % attackee_name
            attackee.dmg_penalty = True
    elif 'Weapon' in result['status']:
        if weapon:
            message += "Player %s dropped his weapon. " % attacker_name
            attacker.items.remove(weapon)
            attacker.save()
    attackee.save()
    players = ([attacker, attackee])
    serializer = FigureSerializer(players, many=True)
    result['message'] = message
    attack_data = [result,]
    attack_data.append(serializer.data)
    # print(message)
    return Response(data=attack_data, status=status.HTTP_200_OK)

@api_view(['PUT',])
def defend(request, player_id):
    defender = Figure.objects.get(id=player_id)
    defender.dodging = True
    defender.save()
    serializer = FigureSerializer(defender)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT',])
def get_up(request, player_id):
    prone_one = Figure.objects.get(id=player_id)
    prone_one.prone = False
    prone_one.save()
    return Response("Player % get up from prone position.", status=status.HTTP_200_OK)

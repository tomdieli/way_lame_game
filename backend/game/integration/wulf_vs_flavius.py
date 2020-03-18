from pprint import pprint
import requests

from django.urls import reverse

from game.models import Game, Figure, Item

# create game
my_game = Game.objects.create()


# create or verify existing items. will raise ItegrityError if attrs differ.
# weapons
shortsword = Item.objects.get_or_create(
        name='Short Sword',
        damage_dice=2,
        damage_mod=-1,
        equip_pts=1,
        min_st=11,
)
twohandsword = Item.objects.get_or_create(
        name='Two-Handed Sword',
        damage_dice=3,
        damage_mod=-1,
        equip_pts=2,
        min_st=14,
)
# armour
chainmail = Item.objects.get_or_create(
        name='Chainmail Armour',
        hit_takes=3,
        adj_ma=6,
        dx_adj=4
)
# shield
largeshield = Item.objects.get_or_create(
        name='Large Shield',
        hit_takes=2,
        equip_pts=1,
        dx_adj=1
)


##### create players #####
# create wulf
wulf = Figure.objects.create(figure_name='Wulf')
# create flavius
flavius = Figure.objects.create(figure_name='Flavius')

###### set up players #####
# set up flavius' initial traits
flavius_args = {'name': 'Flavius', 'st': 3, 'dx': 5}
url = reverse('edit-attributes', args=(flavius.id, ))
response = requests.put('http://127.0.0.1:8000'+url, data=flavius_args)
# add flavius' Items
url = reverse('add-item', args=(flavius.id, ))
response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Short Sword'})
response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Chainmail Armour'})
response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Large Shield'})

# set wulf's initial traits
wulf_args = {'name': 'Wulf', 'st': 6, 'dx': 2}
url = reverse('edit-attributes', args=(wulf.id, ))
response = requests.put('http://127.0.0.1:8000'+url, data=wulf_args)
# add wulf's Items
url = reverse('add-item', args=(wulf.id, ))
response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Two-Handed Sword'})
pprint(response.json())

my_game.players.add(wulf)
my_game.players.add(flavius)

##### begin combat #####
wulf_hits = wulf.hits
flavius_hits = flavius.hits
current_round = my_game.current_round

while ((flavius_hits > 0 and wulf_hits > 0) and current_round < 25):
    if flavius.prone:
        url = reverse('get-up', args=(flavius.id, ))
        response = requests.put('http://127.0.0.1:8000'+url)
    elif not flavius.items.exclude(damage_dice=0):
        url = reverse('add-item', args=(flavius.id, ))
        response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Short Sword'})
    else:
        url = reverse('attack', args=(flavius.id, ))
        response = requests.put('http://127.0.0.1:8000'+url, data={'attackee': wulf.id})
    pprint(response.json()[0]['message'])
    flavius_hits = response.json()[1][0]['hits']
    print("Flavius:")
    print("Adjusted DEX: %s" % response.json()[1][0]['adjusted_dex'])
    print("Current HITS: %s" % flavius_hits)
    print("PRONE: %s" % response.json()[1][0]['prone'])

    if wulf.prone:
        url = reverse('get-up', args=(wulf.id, ))
        response = requests.put('http://127.0.0.1:8000'+url)
    elif not wulf.items.exclude(damage_dice=0):
        url = reverse('add-item', args=(wulf.id, ))
        response = requests.put('http://127.0.0.1:8000'+url, data={'name': 'Two-Handed Sword'})
    else:
        url = reverse('attack', args=(wulf.id, ))
        response = requests.put('http://127.0.0.1:8000'+url, data={'attackee': flavius.id})
    pprint(response.json()[0]['message'])
    wulf_hits = response.json()[1][1]['hits']
    print("Wulf:")
    print("Adjusted DEX: %s" % response.json()[1][1]['adjusted_dex'])
    print("Current HITS: %s" % wulf_hits)
    print("PRONE: %s" % response.json()[1][1]['prone'])

    url = reverse('next-turn', args=(my_game.id, ))
    response = requests.put('http://127.0.0.1:8000'+url)
    current_round = response.json()['current_round']
    pprint(response.json())

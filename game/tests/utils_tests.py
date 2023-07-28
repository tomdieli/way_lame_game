import pytest
import random
import pprint

import game.weleem_utils
from game.weleem_utils import attack, roll_dice, roll_init, pre_attack_info,\
  get_hit_takes, attack_results
from game.models import Game, Figure, Item


def test_roll_dice(monkeypatch):
    
  def mock_randrange(*args):
      return 3

  monkeypatch.setattr(random, "randrange", mock_randrange)
  assert roll_dice() == [3]
  assert roll_init() == [3, 3, 3]
  assert roll_dice(0) == []


def test_pre_attack_info():
  dagger = {
    'name':'Dagger',
    'damage_dice':1,
    'damage_mod':-1,
    'equip_pts':1,
    'equipped':True
  }
  assert pre_attack_info(dagger) == {
    'num_dice':3,
    'auto_miss':16,
    'fumble_mod':1,
    'damage_dice':1,
    'damage_mod':-1,
  }
  assert pre_attack_info(dagger, True) == {
    'num_dice':4,
    'auto_miss':20,
    'fumble_mod':2,
    'damage_dice':1,
    'damage_mod':-1,
  }


def test_get_hit_takes():
  leather = {
    'name':'Leather Armour',
    'hit_takes':2,
    'adj_ma':8,
    'dx_adj':2,
    'equipped':True,
  }
  hit_takes, desc = get_hit_takes([leather])
  assert hit_takes == 2
  assert desc == 'Leather Armour, '


@pytest.fixture
def mock_roll_dice(mocker):
  def _mock_roll_dice(*effects):
    effs = list(effects)
    return mocker.patch.object(
      game.weleem_utils,
      'roll_dice',
      side_effect=effs
    )
  return _mock_roll_dice


@pytest.mark.parametrize(
  ("dieroll, expect"),
    [
      (([1,2,3],[3]), {'status': 'Hit', 'rolls': [1, 2, 3], 'roll': 6, 'damage_rolls': [3], 'damage': 2}),
      (([1,1,2],[3]), {'status': 'Hit-DoubleDamage', 'rolls': [1, 1, 2], 'roll': 4, 'damage_rolls': [3], 'damage': 4}),
      (([1,1,1],[3]), {'status': 'Hit-TripleDamage', 'rolls': [1, 1, 1], 'roll': 3, 'damage_rolls': [3], 'damage': 6}),
      (([4,4,6],), {'status': 'Miss', 'rolls': [4,4,6], 'roll': 14, 'damage_rolls': [], 'damage': 0}),
      (([6,6,5],), {'status': 'Miss-DroppedWeapon', 'rolls': [6,6,5], 'roll': 17, 'damage_rolls': [], 'damage': 0}),
    ]
)
def test_attack_results_dice(mock_roll_dice, dieroll, expect):
  attack_info = {
    'num_dice':3,
    'auto_miss':16,
    'fumble_mod':1,
    'damage_dice':1,
    'damage_mod':-1,
    'hit_takes':2,
    'desc':'Leather Armour, ',
    'attacker_dx':10,
  }
  mock_roll_dice(*dieroll)
  assert attack_results(attack_info) == expect


@pytest.fixture
def mock_get_hit_takes(mocker):
  def _mock_get_hit_takes():
    return mocker.patch.object(
      game.weleem_utils,
      'get_hit_takes'
    )
  return _mock_get_hit_takes


@pytest.fixture
def mock_pre_attack_info(mocker):
  def _mock_pre_attack_info():
    return mocker.patch.object(
      game.weleem_utils,
      'pre_attack_info'
    )
  return _mock_pre_attack_info


@pytest.fixture
def mock_attack_results(mocker):
  def _mock_attack_results(result):
    return mocker.patch.object(
      game.weleem_utils,
      'attack_results',
      return_value=result
    )
  return _mock_attack_results


@pytest.mark.parametrize(
  ("attack_results, expect"),
    [
      ({'status': 'Hit', 'rolls': [1, 2, 3], 'roll': 6, 'damage_rolls': [3], 'damage': 2}, {'expected':'expected'}),
    ]
)
def test_attack(mock_pre_attack_info, mock_get_hit_takes, mock_attack_results, attack_results, expect):
# {'status': 'Miss-DroppedWeapon', 'rolls': [6,6,5], 'roll': 17, 'damage_rolls': [], 'damage': 0}),
  dagger = {
    'name':'Dagger',
    'damage_dice':1,
    'damage_mod':-1,
    'equip_pts':1,
    'equipped':True
  }

  leather = {
    'name':'Leather Armour',
    'hit_takes':2,
    'adj_ma':8,
    'dx_adj':2,
    'equipped':True,
  }
  
  attacker = {
    'figure_name': 'Wulf',
    'adj_dx': 8,
    'penalties': []
  }

  attackee = {
    'figure_name': 'Ragnar',
    'dodging': False,
    'hits': 12,
    'penalties': [],
    'equipped_items': [leather,]

  }
  mock_attack_results(attack_results)
  pprint.pprint(attack(attacker=attacker, attackee=attackee, weapon=dagger))
  assert attack(attacker=attacker, attackee=attackee, weapon=dagger)
    

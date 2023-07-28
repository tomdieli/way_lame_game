from channels.layers import get_channel_layer

from game.weleem_utils import roll_init, attack


class GameManager:
    """ 
    Tracks the game state
    as well as the player turn order and phases.

    The message data received will be relevant based on 1 to 2 primary factors:
        -The game phase for a given turn.
        -Any phase-specific data( if appropriate )

    The game phases defined are:
        - 'pre-game' ( This occurs only once in the game lifetime. The rest are every turn.)
        - initiative
        - movement
        - action

    The player turn order is also tracked here. The end of all players turn in a
    given game phase drives the transition to the next phase for all players. The 
    following are always included and sent back to the players to update their state:
        - game-phase
        - game-round
        - next-player 
    """
    def __init__(self, room_name) -> None:
      self.room_name = room_name
      self.master_list = []
      self.current_order = []
      self.init_rolls = {}
      self.passing = []
      self.game_phase = 'pre-game'
      self.round = 0
      self.next_player = None

    def connect(self):
       layer = get_channel_layer()
       print(layer)

    def do_command(self, command):
      result = {}
      figure_name = command['figure_name']
      def get_figure(name):
          pass
      figure = get_figure(figure_name)
        
      # TODO: we can define figure name here instead of every sub-block
      if self.game_phase == 'pre-game':
        # Adds players to the master_list, and thus to the game
        #
        # TODO: This is where the figure's data should be loaded,
        #       as oppsed to sending everything from the client.
        #
        if command["action"] == "join-game":
            command["info_txt"] = "%s has joined the game!" % (figure_name)
            # TODO: get figure. not the responsibility of the client.
            self.master_list.append(figure) 
      elif self.game_phase == 'initiative':
        # A convoluded process which to determine player initiative for a given turn
        # not a lot of data to work with. 'name'(the figure name rolling) and 'roll'
        # as generated for this figure. The showdown funtion is for figures with the
        # same dex.
        if command["action"] == "initiative":
          # extract this
          def showdown(roll_data):
            ordered = []
            for roll in self.init_rolls:
                if len(roll_data[roll] == 1):
                    ordered = roll_data[roll] + ordered
                else:
                    sub_list = {}
                    for member in roll_data[roll]:
                        roll = roll_init()
                        if roll in sub_list:
                            sub_list.append(member)
                        else:
                            sub_list[roll] = [member]
                    ordered = showdown(sub_list[roll]) + ordered
            return ordered
          roll = roll_init()
          # add to hash
          if roll in self.init_rolls:
              self.init_rolls[roll].append(figure_name)
          else:
              self.init_rolls[roll] = [figure_name]
          result['info_txt'] = "%s rolled a %s" % (figure_name, roll)
        elif command["action"] == "pass":
            # There should always be an out
            self.passing.append(figure_name)
            result['info_txt'] = "%s takes no actions." % figure_name
            
        total_rolls = len({x for v in self.init_rolls.values() for x in v})

        # TODO: We can define figure once instead if every action.

        if total_rolls + self.passing == len(self.master_list):
            self.current_order = showdown(self.init_rolls.copy())
            self.current_player = self.current_order.pop()
            self.game_phase = 'movement'
            self.init_rolls = {}
            self.passing = []
        elif self.game_phase == 'movement':
            # handles player movement, as well as transitioning to the action phase.
            # if no next player, phase = action, do action initiative.
            # uses current_order to determine phase change.
            #
            # TODO: below needs adx
            adx = figure    # figure's adx
            # add to hash
            if adx in self.init_rolls:
                self.init_rolls[adx].append(figure_name)
            else:
                self.init_rolls[adx] = [figure_name]
            if len(self.current_order == 0):
                self.current_order = showdown(self.init_rolls.copy())
                self.current_player = self.current_order.pop()
                self.game_phase = 'action'
        elif self.game_phase == 'action':
            # phase using 'current_order'.
            if command["action"] == "attack":
                # attackee = command["data"]["attackee"]
                weapon = figure["weapon"]
                attack_result = attack(figure_name, command["attackee"], weapon)
                result["info_txt"] = attack_result["message"]
                result["damage"] = attack_result["damage"]
            elif command["action"] == "get_up":
                figure.penalties.remove('prone')
                result["info_txt"] = "%s has has gotten up!" % figure_name
            elif command["action"] == "dodge":
                figure['dodging'] = True
                result['info_txt'] = "%s is dodging." % figure_name
            # tack on the game data
            if len(self.current_order == 0):
                self.round += 1
                self.game_phase = 'initiative'
        result['game-phase'] = self.game_phase
        result['game-round'] = self.round
        result['next-player'] = self.next_player




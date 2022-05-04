import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .weleem_utils import attack, create_game, delete_game, roll_init

class LobbyConsumer(WebsocketConsumer):
    def connect(self):
        print("JOINING Lobby, CHANNEL %s" % self.channel_name)
        async_to_sync(self.channel_layer.group_add)(
            'Lobby',
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            'Lobby',
            self.channel_name
        )

    def receive(self, text_data):
        message = json.loads(text_data)
        action = message['action']
        print('message: %s' % message)    
        if action == "join-lobby":
            user = message['user_name']
            message["info_txt"] = "%s has joined the lobby!" % (user)
        elif action == "new-game":
            user = message['user_name']
            game_id = create_game(user)
            message["info_txt"] = "%s has created game %s." % (user, game_id)
            message['game_id'] = game_id
        elif action == "delete-game":
            user = message['user_name']
            game_id = message['game_id']
            print("Deleting game %s" % game_id)
            result_info = delete_game(game_id)
            message["info_txt"] = "%s has deleted game %s.\n%s" % (user, game_id, result_info)
            message['game_id'] = game_id
        
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            'Lobby',
            {
                'type': 'lobby_message',
                'message': message
            }
        )

    def lobby_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))


class GameConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.master_list = []
        self.current_order = []
        self.init_rolls = {}
        self.passing = []
        self.game_phase = 'pre-game'
        self.round = 0
        self.next_player = None
        print("game consumer initialized")

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'game_%s' % self.room_name
        # Join room group
        print("JOINING %s, CHANNEL %s" % (self.room_group_name, self.channel_name))
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        print("game consumer connected")

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        print("game consumer disconnected")

    def receive(self, text_data):
        # todo: extract!!!!
        message = json.loads(text_data)
        action = message['action']
        print(message)
        if self.game_phase == 'pre-game':
            if action == "join-game":
                figure = message['figure_name']
                message["info_txt"] = "%s has joined the game!" % (figure)
                self.master_list.append(figure)
        elif self.game_phase == 'initiative':
            if action == "initiative":
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

                name = message['name']
                roll = roll_init()
                message['roll'] = roll
                # add to hash
                if roll in self.init_rolls:
                    self.init_rolls[roll].append(name)
                else:
                    self.init_rolls[roll] = [name]
                message['info_txt'] = "%s rolled a %s" % (name, roll)
            elif action == "pass":
                figure_name = message['passer']
                self.passing.append(figure_name)
                message['info_txt'] = "%s takes no actions." % figure_name
            total_rolls = len({x for v in self.init_rolls.values() for x in v})
            if total_rolls + self.passing == len(self.master_list):
                self.current_order = showdown(self.init_rolls.copy())
                self.current_player = self.current_order.pop()
                self.game_phase = 'movement'
                self.init_rolls = {}
                self.passing = []
        elif self.game_phase == 'movement':
            # if no next player, phase = action, do action initiative.
            name = message['name']
            adx = message['adj_dx']
            # add to hash
            if adx in self.init_rolls:
                self.init_rolls[adx].append(name)
            else:
                self.init_rolls[adx] = [name]
            if len(self.current_order == 0):
                self.current_order = showdown(self.init_rolls.copy())
                self.current_player = self.current_order.pop()
                self.game_phase = 'action'
        elif self.game_phase == 'action':
            if action == "attack":
                print(message)
                attacker = message["attacker"]
                attackee = message["attackee"]
                weapon = message["weapon"]
                attack_result = attack(attacker, attackee, weapon)
                message["info_txt"] = attack_result["message"]
                message["damage"] = attack_result["damage"]
            elif action == "get_up":
                figure = message['prone_one']
                figure.penalties.remove('prone')
                message["info_txt"] = "%s has has gotten up!" % (figure['figure_name'])
            elif action == "dodge":
                figure = message['dodger']
                figure['dodging'] = True
                message['info_txt'] = "%s is dodging." % figure['figure_name']
            # tack on the game data
            if len(self.current_order == 0):
                self.round += 1
                self.game_phase = 'initiative'
        message['game-phase'] = self.game_phase
        message['game-round'] = self.round
        message['next-player'] = self.next_player
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # todo: change name
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))

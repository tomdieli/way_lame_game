import React, {Component} from 'react';
import axios from 'axios';

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.props.gameID,
            player1: null,
            player2: null,
            turn: 1,
            dialog: 'Game Has Begun!\n',
            fetching: false
        }
    }

    fetchPlayer = (playerID) =>{
        var d_item = ''
        if (this.props.props.player1 === playerID) {
            d_item = 'player1'
        } else {
            d_item = 'player2'
        }
        this.setState({fetching: true});
        axios.get('http://127.0.0.1:8000/arena/players/' + playerID + '/')
            .then(res => {
                this.setState({
                            fetching: false,
                            [d_item]: res.data
                });
            });
    }

    componentDidMount() {
        this.fetchPlayer(this.props.props.player1);
        this.fetchPlayer(this.props.props.player2);
    }

    attack = (player) => {
        let attacker = null;
        let data = {};
        if (player === this.state.player1.id) {
            attacker = this.state.player1.id;
            data = {'attackee': this.state.player2.id}
        } else {
            attacker = this.state.player2.id;
            data = {'attackee': this.state.player1.id}
        }
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/players/' + attacker + '/attack/', data)
          .then(res => {
            const dialog = this.state.dialog + res.data[0].message + '\n';
            this.setState({
              fetching: false,
              dialog: dialog
            });
          });
    }

    render() {
        if (this.state.fetching === true || this.state.player1 === null || this.state.player2 === null) {
            return <div>Waiting...</div>
        } else {
            return (
                <div>
                    <h1>Welcome to Game {this.state.id}!!!</h1>
                    <div align="left">
                        <Player player={this.state.player1} attack={this.attack} />
                        <Player player={this.state.player2} attack={this.attack} />
                    </div>
                    <textarea readOnly={true} value={this.state.dialog} />
                </div>
            )
        }
    }
}

function Player(props) {

    function getPlayerItems(player) {
        const itemList = player.equipped_items.map(item => {
            return <div key={item.id}>{item.name}</div>
        });
        return itemList;
    }

    function getPlayerOptions(player, attack) {
        return <button type="submit" onClick={() => {attack(player.id)}}>Attack</button>;
    }

    if(props.player === null) {
        return <div>Fetching...</div>
    } else {
        const player = props.player
        const itemsList = getPlayerItems(player);
        const buttonList = getPlayerOptions(player, props.attack);
        return (
            <div className="player" key={player.id}>
                <div>Name: {player.figure_name}</div>
                <div>ST: {player.strength}</div>
                <div>DX: {player.dexterity} ({player.adjusted_dex})</div>
                <div>MA: {player.movement_allowance} ({player.adjusted_ma})</div>
                <div>Items:</div>
                <div>{itemsList}</div>
                <div>{buttonList}</div>
            </div>
        );
    }
}



export default Game
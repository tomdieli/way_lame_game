import React, {Component} from 'react';
import axios from 'axios';
import './App.css';

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.gameID,
            player1: null,
            player2: null,
            turn: 1,
            dialog: 'Game Has Begun!\n',
            fetching: false
        };
    }

    fetchPlayer = (playerID) => {
        let d_item = ''
        if (this.props.player1 === playerID) {
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
        this.fetchPlayer(this.props.player1);
        this.fetchPlayer(this.props.player2);
    }

    dodge = (dodger) => {
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/players/' + dodger + '/defend/')
          .then(res => {
            this.setState({
                fetching: false
            });
          });
    }

    getUp = (proneOne) => {
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/players/' + proneOne + '/get_up/')
          .then(res => {
            this.setState({
                fetching: false
            });
          });
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
            const p1 = res.data[1].findIndex((player) => player.id === this.state.player1.id)
            const p2 = res.data[1].findIndex((player) => player.id === this.state.player2.id)
            const dialog = this.state.dialog + res.data[0].message + '\n';
            this.setState({
                player1: res.data[1][p1],
                player2: res.data[1][p2],
                fetching: false,
                dialog: dialog
            });
          });
    }

    nextTurn = () => {
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/games/' + this.state.id + '/next_turn/')
          .then(res => {
            console.log(res.data);
            const p1 = res.data.data[1].findIndex((player) => player.id === this.state.player1.id)
            const p2 = res.data.data[1].findIndex((player) => player.id === this.state.player2.id)
            this.setState({
                player1: res.data.data[1][p1],
                player2: res.data.data[1][p2],
                fetching: false,
                turn: res.data.data[0].current_round
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
                    <h3>Round {this.state.turn}</h3>
                    <div className="playArea">
                        <Player player={this.state.player1} attack={this.attack} getUp={this.getUp} dodge={this.dodge} />
                        <textarea readOnly={true} value={this.state.dialog} rows="10" cols="80"/>
                        <Player player={this.state.player2} attack={this.attack} getUp={this.getUp} dodge={this.dodge} />
                    </div>
                    <button onClick={this.nextTurn}>Next Turn</button>
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

    function getPlayerOptions(props) {
        return (
            <div>
            <button type="submit" disabled={props.player.prone} onClick={() => {props.attack(props.player.id)}}>Attack</button>
            <button type="submit" disabled={!props.player.prone} onClick={() => {props.getUp(props.player.id)}}>Get Up</button>
            <button type="submit" disabled={props.player.prone} onClick={() => {props.dodge(props.player.id)}}>Dodge</button>
            </div>
            )
    }

    if(props.player === null) {
        return <div>Fetching...</div>
    } else {
        const buttonList = getPlayerOptions(props);
        const itemsList = getPlayerItems(props.player);
        const player = props.player;
        return (
            <div className="player" key={player.id}>
                <div>Name: {player.figure_name}</div>
                <div>ST: {player.strength}</div>
                <div>DX: {player.dexterity} ({player.adjusted_dex})</div>
                <div>MA: {player.movement_allowance} ({player.adjusted_ma})</div>
                <div>HITS: {player.hits} </div>
                <div>Items:</div>
                <div>{itemsList}</div>
                <div>{buttonList}</div>
            </div>
        );
    }
}

export default Game
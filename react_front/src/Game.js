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
            turn: 0,
            turnOrder: [],
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
            let turnOrder = this.state.turnOrder;
            turnOrder.shift();
            this.setState({
                fetching: false,
                turnOrder: turnOrder
            });
          });
    }

    getUp = (proneOne) => {
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/players/' + proneOne + '/get_up/')
          .then(res => {
            let turnOrder = this.state.turnOrder;
            turnOrder.shift()
            this.setState({
                fetching: false,
                turnOrder: turnOrder
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
            let turnOrder = this.state.turnOrder
            turnOrder.shift()
            this.setState({
                player1: res.data[1][p1],
                player2: res.data[1][p2],
                fetching: false,
                dialog: dialog,
                turnOrder: turnOrder
            });
          });
    }

    nextTurn = () => {
        this.setState({fetching: true});
        axios.put('http://127.0.0.1:8000/arena/games/' + this.state.id + '/next_turn/')
          .then(res => {
            const p1 = res.data.data[1].findIndex((player) => player.id === this.state.player1.id)
            const p2 = res.data.data[1].findIndex((player) => player.id === this.state.player2.id)
            let turnOrder = []
            if(p1.adjusted_dex > p2.adjusted_dex) {
                turnOrder = [res.data.data[1][p1].id, res.data.data[1][p2].id]
            } else {
                turnOrder = [res.data.data[1][p2].id, res.data.data[1][p1].id]
            }
            this.setState({
                player1: res.data.data[1][p1],
                player2: res.data.data[1][p2],
                fetching: false,
                turn: res.data.data[0].current_round,
                turnOrder: turnOrder
            });
            if(p1.hits < 1){
                
            }
          });
    }

    render() {
        if (this.state.fetching === true || this.state.player1 === null || this.state.player2 === null) {
            return <div>Waiting...</div>
        } else if(this.state.turnOrder.length === 0){
            this.nextTurn()
            return null
        } else {
            return (
                <div>
                    <h1>Welcome to Game {this.state.id}!!!</h1>
                    <h3>Round {this.state.turn}</h3>
                    <div className="playArea">
                        <Player 
                            player={this.state.player1}
                            attack={this.attack}
                            getUp={this.getUp}
                            dodge={this.dodge}
                            isTurn={this.state.player1.id === this.state.turnOrder[0]}
                        />
                        <textarea readOnly={true} value={this.state.dialog} rows="10" cols="80"/>
                        <Player
                            player={this.state.player2}
                            attack={this.attack}
                            getUp={this.getUp}
                            dodge={this.dodge}
                            isTurn={this.state.player2.id === this.state.turnOrder[0]}
                        />
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
        if(props.isTurn) {
            return (
                <div>
                <button type="submit" disabled={props.player.prone} onClick={() => {props.attack(props.player.id)}}>Attack</button>
                <button type="submit" disabled={!props.player.prone} onClick={() => {props.getUp(props.player.id)}}>Get Up</button>
                <button type="submit" disabled={props.player.prone} onClick={() => {props.dodge(props.player.id)}}>Dodge</button>
                </div>
                );
        } else {
            return <div>Waiting...</div>
        }
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
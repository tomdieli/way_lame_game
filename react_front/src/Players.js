import React, {Component} from 'react';
import axios from 'axios';

import AddItem from './Item';

class Players extends Component {
    constructor(props){
        super(props);
        this.state = {
            players: [],
            fetching: false
        }
    }

    fetchPlayers = () =>{
        this.setState({fetching: true});
        axios.get('http://127.0.0.1:8000/arena/players/')
            .then(res => {
                this.setState({
                            players: [...res.data],
                            fetching: false
                })
            })
    }

    deletePlayer(playerID) {
        this.setState({fetching: true});
        axios.delete(`http://127.0.0.1:8000/arena/players/${playerID}/delete/`)
            .then(res => {
                this.fetchPlayers();
                this.setState({fetching: false});
            })
    }

    componentDidMount = () => {
        this.fetchPlayers();
    }

    childDidUpdate = (player) => {
        const playerIndex = this.state.players.findIndex((obj => obj.id === player.id));
        let new_players = this.state.players;
        new_players[playerIndex] = player;
        this.setState({
            players: new_players
        });
    }

    getPlayerItems(player){
        const itemList = player.equipped_items.map(item => {
            return <div key={item.id}>{item.name}</div>
        })
        return itemList;
    }

    showPlayers(){
        const players = this.state.players;
        const showPlayers = players.map((player) => {
            const itemsList = this.getPlayerItems(player);
            return (
                <div className="player" key={player.id}>
                    <div>Name: {player.figure_name}</div>
                    <div>ST: {player.strength}</div>
                    <div>DX: {player.dexterity} ({player.adjusted_dex})</div>
                    <div>MA: {player.movement_allowance} ({player.adjusted_ma})</div>
                    <div>Items:</div>
                    <div>{itemsList}</div>
                    <button onClick={() => {this.deletePlayer(player.id)}}>Delete Player</button>
                    <AddItem player={player} updateParent={this.childDidUpdate} />
                </div>
            );
        })
        return showPlayers;
    }

    render() {
        if (this.state.fetching === false) {
            const playerList = this.showPlayers();
            return (
                <div>
                    {playerList}
                </div>
        )} else {
            return <div>Fetching...</div>
        }
    }
    
}


export default Players
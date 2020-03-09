import React, { Component } from 'react';
import axios from 'axios';

import Game from './Game';

export default class NewGame extends Component{
    constructor(props) {
      super(props);
      this.state = {
        players: [],
        player1: null,
        player2: null,
        fetching: false,
        gameID: null
      }
    }

    componentDidMount = () => {
      this.fetchPlayers();
    }

    fetchPlayers(){
      this.setState({fetching: true});
      axios.get('http://127.0.0.1:8000/arena/players/')
          .then(res => {
              this.setState({
                          players: [...res.data],
                          fetching: false
              });
          })
    }

    startGame = () => {
      const player1 = this.state.players.find(x => x.id === this.state.player1);
      const player2 = this.state.players.find(x => x.id === this.state.player2);
      const data = {'player1': player1, 'player2': player2};
      this.setState({fetching: true});
      axios.post('http://127.0.0.1:8000/arena/new_game/', data)
          .then(res => {
            this.setState({
              fetching: false,
              gameID: res.data.id
            });
          });
    }

    handleSubmit = (e) => {
      e.preventDefault();
      this.startGame();
    }

    handleChangeP1 = (e) => {
      e.preventDefault();
      this.setState({player1: e.target.selectedOptions[0].value})
    }

    handleChangeP2 = (e) => {
      e.preventDefault();
      this.setState({player2: e.target.selectedOptions[0].value})
    }

    render() {
      if (this.state.gameID !== null) {
        return (
          <div>
            <Game props={this.state} />
          </div>
        )
      }
      if (this.state.fetching === false && this.state.players !== []) {
          return (
            <div>
            <form onSubmit={this.handleSubmit}>
                <PlayerChoice players={this.state.players} handleChange={this.handleChangeP1} />
                VS
                <PlayerChoice players={this.state.players} handleChange={this.handleChangeP2} />
                <button type="submit">Start Game</button>
            </form>
            </div>
          );
      } else {
          return <div>Fetching...</div>
      }
  }
}

function PlayerChoice(props){
  const players = props.players.map(player => {
        return (
          <option key={player.id} value={player.id}>
                {player.figure_name}
          </option>
        );
  });
  if(players) {
    return (
        <select name="players" defaultValue="" onChange={props.handleChange}>
          <option value="" disabled hidden>Please Choose...</option>  
          {players}
        </select>
    );
    } else {
        return <div>No Players Available</div>;
    }
}
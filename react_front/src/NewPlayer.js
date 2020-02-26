import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios'

class NewPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            player: null,
            name: null,
            st_adj: 0,
            dx_adj: 0,
            redirect: null,
            fetching: false
        }
    }
    componentDidMount = () => {
        this.setState({fetching: true})
        axios.post(`http://127.0.0.1:8000/arena/new_player/`)
          .then(response => {
            this.setState({
                player: response.data,
                fetching: false
            })
          })
          .catch(function (error) {
            console.log(error);
          });

    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const my_data = {
            'name': this.state.name,
            'st': this.state.st_adj,
            'dx': this.state.dx_adj
        };
        this.setState({fetching: true})
        axios.put(`http://127.0.0.1:8000/arena/players/${this.state.player.id}/edit_attributes/`, my_data)
          .then(response => {
            this.setState({
                player: response.data,
                fetching: false
            })
          });
        this.setState({ redirect: "/"});
    }

    render() {
        if (this.state.fetching === true || this.state.player === null) {
            return <div>Waiting...</div>
        } else if (this.state.redirect !== null) {
            return <Redirect to={this.state.redirect} />
        } else {
            return (
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" onChange={this.handleChange}></input>
                        <br />
                        <label htmlFor="st">ST: {this.state.player.strength} + </label>
                        <input type="text" id="st_adj" onChange={this.handleChange}></input>
                        <label htmlFor="st"> = {+this.state.player.strength + +this.state.st_adj}</label>
                        <br />
                        <label htmlFor="dx">DX: {this.state.player.dexterity} + </label>
                        <input type="text" id="dx_adj" onChange={this.handleChange}></input>
                        <label htmlFor="dx"> = {+this.state.player.dexterity + +this.state.dx_adj}</label>
                        <br />
                        <button>Submit</button>
                    </form>
                </div>
            )
        }
    }
}

export default NewPlayer
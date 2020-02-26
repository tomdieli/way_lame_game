import React, { Component } from 'react';
//import {Redirect} from 'react-router-dom';
import axios from 'axios';

class AddItem extends Component{
    constructor(props) {
      super(props);
      this.state = {
        player: props.playerID,
        items: [],
        itemSelection: null,
        fetching: false,
        isOpen: false
      }
    }

    // componentDidMount(){
    //     if(this.state.isOpen){
    //         this.fetchItems();
    //     }
    // }

    fetchItems() {
        this.setState({fetching: true});
        axios.get('http://127.0.0.1:8000/arena/items/')
            .then(res => {
                this.setState({
                            items: [...res.data],
                            fetching: false
                })
            })
    }
    

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
        const my_data = {
            'item_id': this.state.itemSelection,
        };
        this.setState({fetching: true})
        axios.put(`http://127.0.0.1:8000/arena/players/${this.state.player}/add_item/`, my_data)
          .then(response => {
            this.setState({
                player: response.data.id,
                fetching: false
            })
          });
        this.props.updateParent(this.state);
    }

    handleChange = (e) => {
        console.log(e.target);
        this.setState({
             itemSelection: e.target.value
        });
    }

    addItem = () => {
        this.setState({isOpen: true});
        this.fetchItems();
    }

    render() {
        
        if(this.state.fetching){
            return <div>Waiting</div>
        } else if (this.state.isOpen === false) {
            return <button onClick={this.addItem}>AddItem</button>
        } else {
            return (
                <div>
                <form onSubmit={this.handleSubmit}>
                    <Weapon items={this.state.items} handleChange={this.handleChange} />
                    <br />
                    <Shield items ={this.state.items} handleChange={this.handleChange} />
                    <br />
                    <Armour items ={this.state.items} handleChange={this.handleChange} />
                    <br />
                    <button>Submit</button>
                </form>
                </div>
            );
        }
    }
}

function Shield(props) {
    console.log(props);
    const shields = props.items.map(item => {
        if(item.damage_dice === 0 && item.adj_ma === 0) {
            return (
                <option key={item.id} value={item.id}>
                {item.name}: HIT TAKES:{item.hit_takes}, DX Adj: {item.dx_adj}
                </option>
            );
        } else {
            return null;
        }
    })
    if(shields) {
    return (
        <select name="shields" onChange={props.handleChange}>
            {shields}
        </select>
    );
    } else {
        return <div>No Sheilds Available</div>;
    }
}


function Armour(props) {
    const armours = props.items.map(item => {
        if(item.damage_dice === 0 && item.adj_ma !== 0) {
            return (
                <option key={item.id} value={item.id}>
                {item.name}: {item.hit_takes}, DX Adj: {item.dx_adj}, MA Adj: {item.adj_ma}
                </option>
            );
        } else {
            return null;
        }
    })
    if(armours) {
    return (
        <select name="armours" onChange={props.handleChange}>
            {armours}
        </select>
    );
    } else {
        return <div>No Armor Available</div>;
    }
}

function Weapon(props) {
    const weapons = props.items.map(item => {
        if(item.damage_dice !== 0) {
            return (
                <option key={item.id} value={item.id}>
                {item.name}: DMG DICE: {item.damage_dice}, DMG Adj: {item.damage_mod}, MIN STR: {item.min_st}
                </option>
            );
        } else {
            return null;
        }
    })
    if(weapons) {
    return (
        <select name="weapons" onChange={props.handleChange}>
            {weapons}
        </select>
    );
    } else {
        return <div>No weapons Available</div>;
    }
}

export default AddItem
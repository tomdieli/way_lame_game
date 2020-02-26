import './App.css';

import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Players from './Players';
import NewPlayer from './NewPlayer';
import NewGame from './NewGame';

export default function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/new_player">New Player</Link>
          </li>
          <li>
            <Link to="/new_game">New Game</Link>
          </li>
        </ul>
        
        <Switch>
          <Route exact path='/'>
            <Players />
          </Route>
          <Route path="/new_game">
            <NewGame />
          </Route>
          <Route path="/new_player">
            <NewPlayer />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
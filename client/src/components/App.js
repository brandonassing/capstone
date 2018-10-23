import React, { Component } from 'react';
import logo from '../logo.svg';
import './App.css';
import { Route, Link } from 'react-router-dom';

import Home from './Home';
import About from './About';

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </header>

        <main>
          <Route exact path="/" component={Home} />
          <Route exact path="/about" component={About} />
        </main>
      </div>
    );
  }
}

export default App;

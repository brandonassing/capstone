import React, { Component } from 'react';
import './App.scss';
import { Route } from 'react-router-dom';

import Login from './Login';
import Home from './Home';

class App extends Component {
  render() {
    return (
      <div>
        <Route exact path="/login" component={Login} />
        <Route exact path="/" component={Home} />
      </div>
    );
  }
}
export default App;

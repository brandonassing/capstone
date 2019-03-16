import React, { Component } from 'react';
import './App.scss';
import { Route, Redirect } from 'react-router-dom';

import Login from './Login';
import Home from './Home';
// import { connect } from 'react-redux';

class App extends Component {
  render() {
    return (
      <div>
        <Route exact path="/login" component={Login} />
        {/* <Route exact path="/" component={Home} /> */}
        <Route exact path="/" render={props => (
          localStorage.getItem('user') ?
            <Home />
            :
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )} />
      </div>
    );
  }
}

export default App;
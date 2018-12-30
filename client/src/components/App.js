import React, { Component } from 'react';
import './App.css';
import { Route } from 'react-router-dom';

import { connect } from 'react-redux';

import Login from './Login';
import Home from './Home';

// const mapStateToProps = state => {
//   return {
//     // show: state.videoReducer.data.show
//   };
// };
//
// const mapDispatchToProps = dispatch => {
//   return {
//     // changeVid: vidData => dispatch(changeVid(vidData))
//   };
// };

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
// export default connect(mapStateToProps, mapDispatchToProps)(App);

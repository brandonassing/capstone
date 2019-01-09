import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Nav.scss';

import moment from 'moment';
import { connect } from 'react-redux';
import { storeChurns } from '../actions/churnList';
class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    }
    this.getStats = this.getStats.bind(this);
  }

  getStats() {
    fetch('/clients/churn')
      .then(res => res.json())
      .then(resJson => {
        let churns = [];
        let timestamps = [];
        let probabilities = [];
        for (let i = 0; i < resJson.message.length; i++) {
          churns = [...churns, ...resJson.message[i].churnProbabilities];
        }
        churns.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < churns.length; i++) {
          timestamps.push(churns[i].timestamp);
          probabilities.push(churns[i].probability);
        }
        this.props.storeChurns({
          churns: churns,
          timestamps: timestamps,
          probabilities: probabilities
        });
      });
  }

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({
        user: users[0]
      }));
  }
  render() {
    return (
      <div id="navbar-body" className="row">
        <div id="nav-group" className="col">
          <div id="logo">
          </div>
          <ul className="nav nav-pills" id="navTabs" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#stats" role="tab" aria-controls="stats" aria-selected="true" onClick={this.getStats}>Statistics</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#clients" role="tab" aria-controls="clients" aria-selected="false">Clients</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#admin-dashboard" role="tab" aria-controls="admin-dashboard" aria-selected="false">Admin</a>
            </li>

          </ul>
        </div>
        <div id="profile-group" className="col">
          <h2 id="user-name">{this.state.user.name}</h2>
          <Link to="/login"><button type="button" className="btn btn-primary">Logout</button></Link>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeChurns: churnData => dispatch(storeChurns(churnData)),
  };
};

export default connect(null, mapDispatchToProps)(Nav);

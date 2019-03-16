import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Nav.scss';

import moment from 'moment';
import { connect } from 'react-redux';
import { storeMetrics } from '../actions/metricList';

import { authHeader } from '../_helpers/auth';

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    }
    this.getStats = this.getStats.bind(this);
  }

  getStats() {
    fetch('/clients/calls', {
      method: 'GET',
      headers: authHeader()
    })
      .then(res => res.json())
      .then(resJson => {
        let calls = [];
        let timestamps = [];
        let probabilities = [];
        let estimateValues = [];
        for (let i = 0; i < resJson.message.length; i++) {
          calls = [...calls, ...resJson.message[i].calls];
        }
        calls.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < calls.length; i++) {
          timestamps.push(calls[i].timestamp);
          probabilities.push(Math.round(calls[i].opportunityProbability * 100));
          estimateValues.push(calls[i].estimateValue);

        }
        this.props.storeMetrics({
          calls: calls,
          timestamps: timestamps,
          probabilities: probabilities,
          estimateValues: estimateValues
        });
      });
  }

  componentDidMount() {
    this.setState({
      user: this.props.user
    })
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
              <a className="nav-link" data-toggle="tab" href="#clients" role="tab" aria-controls="clients" aria-selected="false">Prospects</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#active-clients" role="tab" aria-controls="active-clients" aria-selected="false">Active</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#completed-clients" role="tab" aria-controls="completed-clients" aria-selected="false">Completed</a>
            </li>
            {/* <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#admin-dashboard" role="tab" aria-controls="admin-dashboard" aria-selected="false">Admin</a>
            </li> */}

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
    storeMetrics: data => dispatch(storeMetrics(data)),
  };
};

const mapStateToProps = state => {
  return {
    user: state.authenticationReducer.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
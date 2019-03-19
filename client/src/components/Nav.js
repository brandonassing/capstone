import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Nav.scss';

import { connect } from 'react-redux';
import { storeMetrics, removeMetrics } from '../_actions/metricList';
import { removeAllClients } from '../_actions/clientList';
import { removeUsers } from '../_actions/user';

const logo = require('../assets/Logo.png');

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    }
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
          <div className="nav-logo">
            <img src={logo} alt="logo" />
          </div>
          <ul className="nav nav-pills" id="navTabs" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#stats" role="tab" aria-controls="stats" aria-selected="true">Statistics</a>
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
          <Link to="/login"><button type="button" className="btn btn-primary" onClick={() => {
            this.props.removeMetrics();
            this.props.removeAllClients();
            this.props.removeUsers();
          }}>Logout</button></Link>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeMetrics: data => dispatch(storeMetrics(data)),
    removeMetrics: () => dispatch(removeMetrics()),
    removeAllClients: () => dispatch(removeAllClients()),
    removeUsers: () => dispatch(removeUsers())
  };
};

const mapStateToProps = state => {
  return {
    user: state.authenticationReducer.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Nav);

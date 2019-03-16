import React, { Component } from 'react';
import './Home.scss';

import Nav from './Nav';
import ClientProfile from './ClientProfile';
import ActiveClients from './ActiveClients';
import CompletedClients from './CompletedClients';
import Statistics from './Statistics';
import AdminDashboard from './AdminDashboard';

import { userActions } from '../_actions/user';
import { connect } from 'react-redux';

class Home extends Component {
  componentDidMount() {
    this.props.getAll();
  }
  
  render() {
    return (
      <div id="home-body">
        <div id="header">
          <Nav />
        </div>
        <div className="tab-content shadow" id="nav-tab-content">
          <div className="tab-pane fade show active" id="stats" role="tabpanel" aria-labelledby="stats-tab">
            <Statistics />
          </div>
          <div className="tab-pane fade" id="clients" role="tabpanel" aria-labelledby="client-tab">
            <ClientProfile />
          </div>
          <div className="tab-pane fade" id="active-clients" role="tabpanel" aria-labelledby="active-client-tab">
            <ActiveClients />
          </div>
          <div className="tab-pane fade" id="completed-clients" role="tabpanel" aria-labelledby="completed-client-tab">
            <CompletedClients />
          </div>
          <div className="tab-pane fade" id="admin-dashboard" role="tabpanel" aria-labelledby="admin-tab">
            <AdminDashboard />
          </div>
        </div>

      </div>
    );
  }
}
const mapDispatchToProps = dispatch => {
  return {
    getAll: () => dispatch(userActions.getAll())
  };
};

const mapStateToProps = state => {
  // const { userReducer, authenticationReducer } = state;
  // const { user } = authenticationReducer;
  // return {
  //   user,
  //   userReducer
  // };
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home)
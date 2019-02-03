import React, { Component } from 'react';
import './Home.scss';

import Nav from './Nav';
import ClientProfile from './ClientProfile';
import Statistics from './Statistics';
import AdminDashboard from './AdminDashboard';


class Home extends Component {

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
          <div className="tab-pane fade" id="admin-dashboard" role="tabpanel" aria-labelledby="admin-tab">
            <AdminDashboard />
          </div>
        </div>

      </div>
    );
  }
}

export default Home;
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Nav.scss';

class Nav extends Component {
  render() {
    return (
      <div id="navbar-body" className="row">
        <div id="nav-group" className="col">
          <div id="logo">

          </div>
          <ul className="nav nav-pills" id="navTabs" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#stats" role="tab" aria-controls="stats" aria-selected="true">Statistics</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#clients" role="tab" aria-controls="clients" aria-selected="false">Clients</a>
            </li>
          </ul>
        </div>
        <div id="profile-group" className="col">
          <Link to="/login">Logout</Link>
        </div>
      </div>
    );
  }
}

export default Nav;

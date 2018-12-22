import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Nav.scss';

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    }
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
              <a className="nav-link active" data-toggle="tab" href="#stats" role="tab" aria-controls="stats" aria-selected="true">Statistics</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#clients" role="tab" aria-controls="clients" aria-selected="false">Clients</a>
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

export default Nav;

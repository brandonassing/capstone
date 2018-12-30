import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    }
  }

  authenticate = (e) => {
    e.preventDefault();
  }

  render() {
    return (
      <div id="login-body">
        <div id="login-nav">
          <div id="login-logo">
          </div>
          <div>
            <h1>CHURNalytics</h1>
          </div>
        </div>
        <div id="login-form-wrarpper">
          <div id="login-form">
            <form onSubmit={this.authenticate}>
              <div className="form-group">
                <label htmlFor="email-login-input">Email address</label>
                <input className="form-control" id="email-login-input" aria-describedby="emailHelp" placeholder="Enter email" value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }}/>
                <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
              </div>
              <div className="form-group">
                <label htmlFor="password-login-input">Password</label>
                <input type="password" className="form-control" id="password-login-input" placeholder="Password" value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }}/>
              </div>
              <button type="submit" className="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
        <br />
        <br />
        <br />
        <Link to="/"><button type="button" className="btn btn-primary">Instant Login (dev only)</button></Link>

      </div>
    );
  }
}

export default Login;

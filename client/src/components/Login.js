import React, { Component } from 'react';
import './Login.scss';
import { connect } from 'react-redux';
import { userActions } from '../_actions/user';

const logo = require('../assets/Logo.png');
class Login extends Component {
  constructor(props) {
    super(props);

    // reset login status
    this.props.logout();

    this.state = {
      username: "",
      password: "",
      submitted: false
    }
  }

  authenticate = (e) => {
    e.preventDefault();
    this.setState({ submitted: true });
    if (this.state.username && this.state.password) {
      this.props.login(this.state.username, this.state.password);
    }
  }

  render() {
    return (
      <div id="login-body">
        <div id="login-nav">
          <div className="nav-logo">
            <img src={logo} alt="logo" />
          </div>
          <div>
            <h1>LEADsense</h1>
          </div>
        </div>
        <div id="login-form-wrarpper">
          <div id="login-form">
            <form onSubmit={this.authenticate}>
              <div className="form-group">
                <label htmlFor="email-login-input">Username</label>
                <input className="form-control" id="email-login-input" aria-describedby="emailHelp" placeholder="Enter username" value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }} />
              </div>
              <div className="form-group">
                <label htmlFor="password-login-input">Password</label>
                <input type="password" className="form-control" id="password-login-input" placeholder="Enter password" value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }} />
              </div>
              <div id="invalid-login" hidden={!this.props.loginFail}>
                <p className="form-text">Invalid username or password</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={!this.state.username && !this.state.password}>Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { loggingIn, loginFail } = state.authenticationReducer;
  return {
    loggingIn,
    loginFail
  };
}


const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(userActions.logout()),
    login: (username, password) => dispatch(userActions.login(username, password))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login)

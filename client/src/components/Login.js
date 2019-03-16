import React, { Component } from 'react';
import './Login.scss';
import { connect } from 'react-redux';
import { userActions } from '../actions/user';

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
          <div id="login-logo">
          </div>
          <div>
            <h1>LEADsense</h1>
          </div>
        </div>
        <div id="login-form-wrarpper">
          <div id="login-form">
            <form onSubmit={this.authenticate}>
              <div className="form-group">
                <label htmlFor="email-login-input">Email address</label>
                <input className="form-control" id="email-login-input" aria-describedby="emailHelp" placeholder="Enter email" value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }} />
                <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
              </div>
              <div className="form-group">
                <label htmlFor="password-login-input">Password</label>
                <input type="password" className="form-control" id="password-login-input" placeholder="Password" value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }} />
              </div>
              <button type="submit" className="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { loggingIn } = state.authenticationReducer;
  return {
    loggingIn
  };
}


const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(userActions.logout()),
    login: (username, password) => dispatch(userActions.login(username, password))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login)
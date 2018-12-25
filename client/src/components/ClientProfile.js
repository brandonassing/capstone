import React, { Component } from 'react';
import './ClientProfile.scss';
import { storeClients } from '../actions/clientList';

import { connect } from 'react-redux';


class ClientProfile extends Component {

  componentDidMount() {
    fetch('/clients')
      .then(res => res.json())
      .then(clients => this.props.storeClients(clients));

  }
  render() {
    return (
      <div>
      clients
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeClients: clientData => dispatch(storeClients(clientData)),
  };
};

const mapStateToProps = state => {
  return {
    clientProfiles: state.clientReducer.clients
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientProfile)

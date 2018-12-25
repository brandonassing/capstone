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
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone number</th>
              <th scope="col"># plans</th>
              <th scope="col">Latest churn</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.clientProfiles.map((client) => {
                return(
                  <tr key={client.clientId}>
                    <th scope="row">{client.clientId}</th>
                    <td>{client.firstName} {client.lastName}</td>
                    <td>{client.email}</td>
                    <td>{client.phoneNumber}</td>
                    <td>{client.planDetails.length}</td>
                    <td>TODO</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
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

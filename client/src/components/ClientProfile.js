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
        <div id="clients-header">
          <h2>Client profiles</h2>
          <input type="email" className="form-control" id="client-search" placeholder="Search" />
        </div>
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
                let mostRecent = 0;
                let mostRecentIndex = 0;
                for (let i = 0; i < client.churnProbabilities.length; i++) {
                  if(client.churnProbabilities[i].timestamp > mostRecent) {
                    mostRecent = client.churnProbabilities[i].timestamp;
                    mostRecentIndex = i;
                  }
                }
                return(
                  <tr key={client.clientId}>
                    <th scope="row">{client.clientId}</th>
                    <td>{client.firstName} {client.lastName}</td>
                    <td>{client.email}</td>
                    <td>{client.phoneNumber}</td>
                    <td>{client.planDetails.length}</td>
                    <td>{client.churnProbabilities[mostRecentIndex].probability}</td>
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

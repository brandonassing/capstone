import React, { Component } from 'react';
import './ClientProfile.scss';
import { storeClients, refreshClients } from '../actions/clientList';

import { connect } from 'react-redux';


class ClientProfile extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.state = {
      totalPages: 0,
      pageNo: 1,
      size: 10
    }
  }

  componentDidMount() {
    fetch('/clients/profiles?pageNo=' + this.state.pageNo + '&size=' + this.state.size)
      .then(res => res.json())
      .then(resJson => {
        this.props.refreshClients(resJson.message);
        this.setState({
          totalPages: resJson.pages
        })
      });
  }

  loadMore() {
    this.setState({
      pageNo: this.state.pageNo + 1
    }, () => {
      fetch('/clients/profiles?pageNo=' + this.state.pageNo + '&size=' + this.state.size)
        .then(res => res.json())
        .then(resJson => {
          this.props.storeClients(resJson.message);
          this.setState({
            totalPages: resJson.pages
          });
        });
    });
  }

  render() {
    return (
      <div>
        <div id="clients-header">
          <h2>Client profiles</h2>
          <input type="email" className="form-control" id="client-search" placeholder="Search" />
        </div>
        <table id="client-profile-table" className="table table-hover">
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
                let churnClass = "";

                for (let i = 0; i < client.churnProbabilities.length; i++) {
                  if(client.churnProbabilities[i].timestamp > mostRecent) {
                    mostRecent = client.churnProbabilities[i].timestamp;
                    mostRecentIndex = i;
                  }
                }
                if (client.churnProbabilities[mostRecentIndex].probability >= 0 && client.churnProbabilities[mostRecentIndex].probability < 40) {
                  churnClass = "good";
                }
                else if (client.churnProbabilities[mostRecentIndex].probability >= 40 && client.churnProbabilities[mostRecentIndex].probability < 75) {
                  churnClass = "med";
                }
                else if (client.churnProbabilities[mostRecentIndex].probability >= 75 && client.churnProbabilities[mostRecentIndex].probability <= 100) {
                  churnClass = "bad";
                }
                return(
                  <tr key={client.clientId}>
                    <td scope="row"><p>{client.clientId}</p></td>
                    <td><p>{client.firstName} {client.lastName}</p></td>
                    <td><p>{client.email}</p></td>
                    <td><p>{client.phoneNumber}</p></td>
                    <td><p>{client.planDetails.length}</p></td>
                    <td className="churn-prob"><p className={churnClass}>{client.churnProbabilities[mostRecentIndex].probability}</p></td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <button type="button" className="btn btn-primary" onClick={this.loadMore} disabled={this.state.pageNo < this.state.totalPages ? false : true}>View more</button>

      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeClients: clientData => dispatch(storeClients(clientData)),
    refreshClients: clientData => dispatch(refreshClients(clientData))
  };
};

const mapStateToProps = state => {
  return {
    clientProfiles: state.clientReducer.clients
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientProfile)

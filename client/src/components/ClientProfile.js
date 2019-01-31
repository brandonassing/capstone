import React, { Component } from 'react';
import './ClientProfile.scss';
import { storeClients, refreshClients } from '../actions/clientList';
import moment from 'moment';
import ReactTable from "react-table";
import 'react-table/react-table.css'

import { connect } from 'react-redux';


class ClientProfile extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.search = this.search.bind(this);
    this.state = {
      totalPages: 0,
      pageNo: 1,
      size: 10,
      searchKey: ""
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

  search() {

  }

  render() {
    const data = this.props.clientProfiles;
    const columns = [{
      Header: 'Id',
      accessor: 'clientId' // String-based value accessors!
    }, {
      Header: 'Name',
      accessor: 'firstName'
    }, {
      Header: 'Email',
      accessor: 'email'
    }, {
      Header: 'Phone number',
      accessor: 'phoneNumber'
    }];

    return (
      <div id="clients-body">
        <div id="clients-header">
          <h2>Client profiles</h2>
          <input type="email" className="form-control" id="client-search" placeholder="Search" value={this.state.searchKey} onChange={(e) => this.setState({ searchKey: e.target.value })} />
        </div>
        <ReactTable
          data={data}
          columns={columns}
          showPagination={false}
          minRows={10}
        />

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
                  if (moment(client.churnProbabilities[i].timestamp).isAfter(mostRecent)) {
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
                return (
                  <tr key={client.clientId}>
                    <td><p>{client.clientId}</p></td>
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
        <div className="btn-container">
          <button id="load-more" type="button" className="btn btn-primary" onClick={this.loadMore} disabled={this.state.pageNo < this.state.totalPages ? false : true}>View more</button>
        </div>
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

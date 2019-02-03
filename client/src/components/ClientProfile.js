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
    this.getData = this.getData.bind(this);
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
    }, () => this.getData(false));
  }

  search(e) {
    if (e.key === 'Enter') {
      this.setState({
        totalPages: 0,
        pageNo: 1,
        size: 10
      }, () => this.getData(true));
    }
  }

  getData(refresh) {
    fetch('/clients/profiles' + (this.state.searchKey === "" ? '?' : '/search?searchKey=' + this.state.searchKey + '&') + '&pageNo=' + this.state.pageNo + '&size=' + this.state.size)
      .then(res => res.json())
      .then(resJson => {
        // call redux refresh vs store
        refresh ? this.props.refreshClients(resJson.message) : this.props.storeClients(resJson.message);
        this.setState({
          totalPages: resJson.pages
        });
      });
  }

  render() {
    const data = this.props.clientProfiles;

    const columns = [{
      Header: () => <p>Id</p>,
      accessor: 'clientId',
      Cell: col => <p>{col.value}</p>,
      minWidth: 100
    }, {
      Header: () => <p>Name</p>,
      id: 'name',
      accessor: d => `${d.firstName} ${d.lastName}`,
      Cell: col => <p>{col.value}</p>,
      minWidth: 200
    }, {
      Header: () => <p>Email</p>,
      accessor: 'email',
      Cell: col => <p>{col.value}</p>,
      minWidth: 250
    }, {
      Header: () => <p>Phone Number</p>,
      id: "phoneNumber",
      accessor: d => {
        let num = d.phoneNumber;
        let stringNum = "(" + num.slice(0, 3) + ")" + " " + num.slice(3, 6) + "-" + num.slice(6);
        return stringNum
      },
      Cell: col => <p>{col.value}</p>,
      minWidth: 150
    }, {
      Header: () => <p># plans</p>,
      id: 'plans',
      accessor: d => d.planDetails.length,
      Cell: col => <p>{col.value}</p>,
      minWidth: 80
    }, {
      Header: () => <p>Churn</p>,
      id: 'churn',
      accessor: d => {
        let mostRecent = 0;
        let mostRecentIndex = 0;

        for (let i = 0; i < d.churnProbabilities.length; i++) {
          if (moment(d.churnProbabilities[i].timestamp).isAfter(mostRecent)) {
            mostRecent = d.churnProbabilities[i].timestamp;
            mostRecentIndex = i;
          }
        }
        return d.churnProbabilities[mostRecentIndex].probability;
      },
      Cell: col => {
        let churnClass = "";
        if (col.value >= 0 && col.value < 40) {
          churnClass = "good";
        }
        else if (col.value >= 40 && col.value < 75) {
          churnClass = "med";
        }
        else if (col.value >= 75 && col.value <= 100) {
          churnClass = "bad";
        }
        return (<p className={churnClass}>{col.value}</p>);
      },
      className: 'churn-prob',
      minWidth: 100,
      resizable: false
    }];

    return (
      <div id="clients-body">
        <div id="clients-header">
          <h2>Client profiles</h2>
          <input type="email" className="form-control" id="client-search" placeholder="Search" value={this.state.searchKey} onChange={(e) => this.setState({ searchKey: e.target.value })} onKeyPress={this.search} />
        </div>
        <ReactTable
          data={data}
          columns={columns}
          showPagination={false}
          minRows={10}
          getTdProps={() => ({
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }
          })}
        />
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

import React, { Component } from 'react';
import './ClientProfile.scss';
import { storeClients, refreshClients, updateClient } from '../actions/clientList';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import moment from 'moment';
import { Modal } from 'react-bootstrap';

import { connect } from 'react-redux';


class ClientProfile extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.search = this.search.bind(this);
    this.getData = this.getData.bind(this);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      totalPages: 0,
      pageNo: 1,
      size: 10,
      searchKey: "",
      showModal: false,
      activeClient: {}
    }
  }
  handleClose() {
    this.setState({ showModal: false, activeClient: {} });
  }

  handleShow(client) {
    this.setState({ showModal: true, activeClient: client });
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
      Header: () => <p className="center">Visited</p>,
      accessor: 'visited',
      Cell: (col) => {
        return (
          <input
            type="checkbox"
            className="checkbox"
            checked={col.value}
            onChange={() => {
              this.setState({
                showModal: false,
                activeClient: {}
              }, () => {
                fetch('/clients/profiles/' + col.original._id, {
                  method: 'PUT',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    visited: !col.value
                  })
                })
                  .then(res => res.json())
                  .then(resJson => {
                    this.props.updateClient(resJson.message);
                  });
              });
            }}
          />
        );
      },
      minWidth: 75
    },
    {
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
      Header: () => <p># calls</p>,
      id: 'calls',
      accessor: d => d.calls.length,
      Cell: col => <p>{col.value}</p>,
      minWidth: 80
    }, {
      Header: () => <p>Value</p>,
      id: 'value',
      accessor: d => {
        let highest = 0;

        for (let i = 0; i < d.calls.length; i++) {
          if (d.calls[i].dollarValue > highest) {
            highest = d.calls[i].dollarValue;
          }
        }
        return highest;
      },
      Cell: col => {
        let tierClass = "";
        if (col.value >= 0 && col.value < 1000) {
          tierClass = "low";
        }
        else if (col.value >= 1000 && col.value < 20000) {
          tierClass = "med";
        }
        else if (col.value >= 20000) {
          tierClass = "high";
        }
        return (<p className={tierClass}>${col.value}</p>);
      },
      className: 'value-metric',
      minWidth: 150,
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
          getTrProps={(state, rowInfo) => {
            return {
              onClick: (e) => {
                this.handleShow(rowInfo.original)
              }
            }
          }}
        />
        <Modal show={this.state.showModal} onHide={this.handleClose} centered={true}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.activeClient.firstName} {this.state.activeClient.lastName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              !!this.state.activeClient.calls ?
                this.state.activeClient.calls.map((item) => {
                  // TODO error: duplicate keys. Maybe add key for each call
                  return (
                  <div key={item.timestamp}>
                    <span>{moment(item.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</span>
                    <span> - ${item.dollarValue}</span>
                  </div>);
                })
                :
                ""
            }
          </Modal.Body>
          <Modal.Footer>
            <button id="modal-close" type="button" className="btn btn-primary" onClick={this.handleClose}>Close</button>
          </Modal.Footer>
        </Modal>
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
    refreshClients: clientData => dispatch(refreshClients(clientData)),
    updateClient: client => dispatch(updateClient(client))
  };
};

const mapStateToProps = state => {
  return {
    clientProfiles: state.clientReducer.clients
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientProfile)

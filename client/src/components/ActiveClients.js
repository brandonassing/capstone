import React, { Component } from 'react';
import './ActiveClients.scss';
import { storeClientsActive, refreshClientsActive, updateClientActive, updateClientAll } from '../_actions/clientList';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import moment from 'moment';
import { Modal, Dropdown, DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux';
import { authHeader } from '../_helpers/auth';
import { handleError } from '../_helpers/errors';


class ActiveClients extends Component {
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
    fetch('/clients/profiles?pageNo=' + this.state.pageNo + '&size=' + this.state.size + '&callStatus=active', {
      method: 'GET',
      headers: authHeader()
    })
      .then(res => handleError(res))
      .then(res => res.json())
      .then(resJson => {
        this.props.refreshClients(resJson.message);
        this.setState({
          totalPages: resJson.pages
        })
      })
      .catch(err => {
        console.log(err)
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
    fetch('/clients/profiles' + (this.state.searchKey === "" ? '?' : '/search?searchKey=' + this.state.searchKey + '&') + '&pageNo=' + this.state.pageNo + '&size=' + this.state.size + '&callStatus=active', {
      method: 'GET',
      headers: authHeader()
    })
      .then(res => handleError(res))
      .then(res => res.json())
      .then(resJson => {
        // call redux refresh vs store
        refresh ? this.props.refreshClients(resJson.message) : this.props.storeClients(resJson.message);
        this.setState({
          totalPages: resJson.pages
        });
      })
      .catch(err => {
        console.log(err)
      });
  }

  setWorker = (worker, call_id) => {
    let calls = this.state.activeClient.calls;

    for (let i = 0; i < calls.length; i++) {
      if (calls[i]._id === call_id) {
        calls[i].status = worker === "" ? "inactive" : "active";
        calls[i].worker = worker;
      }
    }

    let inProspects = false;
    let inActive = false;

    for (let i = 0; i < calls.length; i++) {
      if (calls[i].status === "inactive") {
        inProspects = true;
      }
      if (calls[i].status === "active") {
        inActive = true;
      }
    };

    fetch('/clients/profiles/' + this.state.activeClient._id, {
      method: 'PUT',
      headers: {
        ...{
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, ...authHeader()
      },
      body: JSON.stringify({
        calls: calls,
      })
    })
      .then(res => handleError(res))
      .then(res => res.json())
      .then(resJson => {
        // this.getData(true)
        this.props.updateClientAll({ client: resJson.message, inProspects: inProspects, inActive: inActive });
      })
      .catch(err => {
        console.log(err)
      });
  };

  dateSort = (a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  }

  render() {
    const data = this.props.clientProfiles;
    const columns = [{
      Header: () => <p>Name</p>,
      id: 'name',
      accessor: d => `${d.firstName} ${d.lastName}`,
      Cell: col => <p>{col.value}</p>,
      minWidth: 100
    }, {
      Header: () => <p>Address</p>,
      id: 'address',
      accessor: d => `${d.address}`,
      Cell: col => <p>{col.value}</p>,
      minWidth: 300
    }, {
      Header: () => <p>Phone number</p>,
      id: "phoneNumber",
      accessor: d => {
        let num = d.phoneNumber;
        let stringNum = "(" + num.slice(0, 3) + ") " + num.slice(3, 6) + "-" + num.slice(6);
        return stringNum
      },
      Cell: col => <p>{col.value}</p>,
      minWidth: 120
    }, {
      Header: () => <p># calls</p>,
      id: 'calls',
      accessor: d => d.calls.length,
      Cell: col => <p>{col.value}</p>,
      minWidth: 50
    }, {
      Header: () => <p>Max value estimate</p>,
      id: 'value',
      accessor: d => {
        let max = 0;

        for (let i = 0; i < d.calls.length; i++) {
          if (d.calls[i].status === "active") {
            if (d.calls[i].estimateValue > max) {
              max = d.calls[i].estimateValue;
            }
          }
        }
        return max;
      },
      Cell: col => {
        let tierClass = "";
        if (col.value === 1) {
          tierClass = "low";
        }
        else if (col.value === 2) {
          tierClass = "med";
        }
        else if (col.value === 3) {
          tierClass = "high";
        }
        return (<p className={tierClass}>{col.value === 1 ? "Low" : col.value === 2 ? "Med" : "High"}</p>);
      },
      className: 'value-metric',
      minWidth: 100,
      resizable: false
    }];

    return (
      <div id="active-body">
        <div id="active-header">
          <h2>Active clients</h2>
          <input className="form-control" id="active-search" placeholder="Search" value={this.state.searchKey} onChange={(e) => this.setState({ searchKey: e.target.value })} onKeyPress={this.search} />
        </div>
        <ReactTable
          pageSize={this.props.clientProfiles.length}
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
            <Modal.Title>
              <h2>{this.state.activeClient.firstName} {this.state.activeClient.lastName}</h2>
              <h3>{this.state.activeClient.address}</h3>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              !!this.state.activeClient.calls ?
                this.state.activeClient.calls.sort(this.dateSort).map((item, index) => {
                  return (
                    <div key={item._id}>
                      <div className="selection-content">
                        <div className="call-details">
                          <p>Call time: {moment(item.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</p>
                          <p>Status: {item.status}</p>
                          {
                            item.status === "completed" ?
                              <p>Invoice total: <strong>${(Math.round(item.invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2)}</strong></p>
                              :
                              <div>
                                <p>Invoice probability: <strong>{Math.round(item.opportunityProbability * 100)}%</strong></p>
                                <p>Value estimate: <strong className={item.estimateValue === 1 ? "low" : item.estimateValue === 2 ? "med" : "high"}>{item.estimateValue === 1 ? "Low" : item.estimateValue === 2 ? "Med" : "High"}</strong></p>
                              </div>
                          }
                        </div>
                        {item.status !== "completed" ?
                          <div className="worker-dropdown">
                            <DropdownButton id="dropdown-basic-button" title={item.worker !== "" ? item.worker : "Dispatch worker"}>
                              <Dropdown.Item value="" onClick={(e) => { this.setWorker("", item._id) }}><strong>Set inactive</strong></Dropdown.Item>
                              <Dropdown.Item value="GLYN" onClick={(e) => { this.setWorker("GLYN", item._id) }}>GLYN</Dropdown.Item>
                              <Dropdown.Item value="MIKEY" onClick={(e) => { this.setWorker("MIKEY", item._id) }}>MIKEY</Dropdown.Item>
                              <Dropdown.Item value="JOHN" onClick={(e) => { this.setWorker("JOHN", item._id) }}>JOHN</Dropdown.Item>
                              <Dropdown.Item value="RYANC" onClick={(e) => { this.setWorker("RYANC", item._id) }}>RYANC</Dropdown.Item>
                              <Dropdown.Item value="CHRLES" onClick={(e) => { this.setWorker("CHRLES", item._id) }}>CHRLES</Dropdown.Item>
                              <Dropdown.Item value="TONY" onClick={(e) => { this.setWorker("TONY", item._id) }}>TONY</Dropdown.Item>
                              <Dropdown.Item value="JIML" onClick={(e) => { this.setWorker("JIML", item._id) }}>JIML</Dropdown.Item>
                              <Dropdown.Item value="MIKEJ" onClick={(e) => { this.setWorker("MIKEJ", item._id) }}>MIKEJ</Dropdown.Item>
                              <Dropdown.Item value="SHARBL" onClick={(e) => { this.setWorker("SHARBL", item._id) }}>SHARBL</Dropdown.Item>
                              <Dropdown.Item value="DARREN" onClick={(e) => { this.setWorker("DARREN", item._id) }}>DARREN</Dropdown.Item>
                            </DropdownButton>
                          </div>
                          :
                          ""}
                      </div>
                      {index < this.state.activeClient.calls.length - 1 ? <hr /> : ""}
                    </div>
                  );
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
    storeClients: clientData => dispatch(storeClientsActive(clientData)),
    refreshClients: clientData => dispatch(refreshClientsActive(clientData)),
    updateClient: client => dispatch(updateClientActive(client)),
    updateClientAll: clientData => dispatch(updateClientAll(clientData))
  };
};

const mapStateToProps = state => {
  return {
    clientProfiles: state.clientReducer.clientsActive
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveClients)

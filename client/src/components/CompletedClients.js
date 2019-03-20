import React, { Component } from 'react';
import './CompletedClients.scss';
import { storeClientsCompleted, refreshClientsCompleted, updateClientCompleted } from '../_actions/clientList';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import moment from 'moment';
import { Modal } from 'react-bootstrap';

import { connect } from 'react-redux';
import { authHeader } from '../_helpers/auth';
import { handleError } from '../_helpers/errors';


class CompletedClients extends Component {
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
    fetch('/clients/profiles?pageNo=' + this.state.pageNo + '&size=' + this.state.size + '&callStatus=completed', {
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

  refresh = () => {
    this.setState({
      totalPages: 0,
      pageNo: 1,
      size: 10
    }, () => this.getData(true));
  }

  getData(refresh) {
    fetch('/clients/profiles' + (this.state.searchKey === "" ? '?' : '/search?searchKey=' + this.state.searchKey + '&') + '&pageNo=' + this.state.pageNo + '&size=' + this.state.size + '&callStatus=completed', {
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

  dateSort = (a, b) => {
    if (a.timestamp && b.timestamp) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    else if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
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
      Header: () => <p>Total invoice</p>,
      id: 'invoice',
      accessor: d => {
        let totalInvoice = 0;

        for (let i = 0; i < d.calls.length; i++) {
          for (let j = 0; j < d.calls[i].invoice.length; j++) {
            totalInvoice += d.calls[i].invoice[j].amountAfterDiscount;
          }
        }
        return totalInvoice;
      },
      Cell: col => {
        let tierClass = "";
        if (col.value >= 0 && col.value < 1000) {
          tierClass = "low";
        }
        else if (col.value >= 1000 && col.value < 5000) {
          tierClass = "med";
        }
        else if (col.value >= 5000) {
          tierClass = "high";
        }
        return (<p className={tierClass}>${(Math.round(col.value * 100) / 100).toFixed(2)}</p>);
      },
      className: 'value-metric',
      minWidth: 100,
      resizable: false
    }];

    return (
      <div id="completed-body">
        <div id="completed-header">
          <h2>Client invoices</h2>
          <div className="table-header">
            <div className="btn-container">
              <button type="button" className="btn btn-light" onClick={this.refresh}>Refresh</button>
            </div>
            <input className="form-control" id="completed-search" placeholder="Search" value={this.state.searchKey} onChange={(e) => this.setState({ searchKey: e.target.value })} onKeyPress={this.search} />
          </div>
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
        <Modal show={this.state.showModal} onHide={this.handleClose} centered={true} size={'lg'}>
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
                      <p>Call time: {moment(item.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</p>
                      {item.status === "active" ? <p>Dispatched: {item.worker}</p> : ""}
                      <p>Status: {item.status}</p>
                      {
                        item.status === "completed" ?
                          ""
                          // <p>Invoice total: <strong>${(Math.round(item.invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2)}</strong></p>
                          :
                          <div>
                            <p>Invoice probability: <strong>{Math.round(item.opportunityProbability * 100)}%</strong></p>
                            <p>Value estimate: <strong className={item.estimateValue === 1 ? "low" : item.estimateValue === 2 ? "med" : "high"}>{item.estimateValue === 1 ? "Low" : item.estimateValue === 2 ? "Med" : "High"}</strong></p>
                          </div>
                      }
                      {item.status === "completed" ?
                        !!item.invoice ?
                          <div className="invoice-field">
                            <h3>Invoice</h3>
                            {
                              item.invoice.sort(this.dateSort).map((inv, invIndex) => {
                                return (
                                  <div key={inv._id}>
                                    <p>{moment(inv.date).format('MMMM Do YYYY')}{inv.tech !== "" ? ", technician: " : ""}<strong>{inv.tech}</strong></p>
                                    <p>{inv.quantity} - {inv.itemCode}: {inv.description}</p>
                                    {inv.discount !== 0 ? <p>Discount: ${(Math.round(inv.discount * 100) / 100).toFixed(2)}</p> : ""}
                                    <p className="price">Subtotal: <strong>{inv.amountAfterDiscount < 0 ? "-" : ""}${(Math.round(Math.abs(inv.amountAfterDiscount) * 100) / 100).toFixed(2)}</strong></p>
                                    {invIndex < item.invoice.length ? <hr /> : ""}
                                  </div>
                                )
                              })
                            }
                            <p className="price"><strong>Total: $</strong>
                              <strong>
                                {
                                  (Math.round(item.invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2)
                                }
                              </strong>
                            </p>
                          </div>
                          :
                          ""
                        :
                        ""
                      }
                      {index < this.state.activeClient.calls.length - 1 ? <hr /> : ""}
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
    storeClients: clientData => dispatch(storeClientsCompleted(clientData)),
    refreshClients: clientData => dispatch(refreshClientsCompleted(clientData)),
    updateClient: client => dispatch(updateClientCompleted(client))
  };
};

const mapStateToProps = state => {
  return {
    clientProfiles: state.clientReducer.clientsCompleted
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CompletedClients)

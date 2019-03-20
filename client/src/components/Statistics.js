import React, { Component } from 'react';
import './Statistics.scss';
import { Line, Pie } from 'react-chartjs-2';
import moment from 'moment';
import { connect } from 'react-redux';
import { storeMetrics } from '../_actions/metricList';

import { authHeader } from '../_helpers/auth';
import { handleError } from '../_helpers/errors';

import { Dropdown, DropdownButton } from 'react-bootstrap';


class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      monthScope: 6,
      isLoading: true
    }

    this.getDonutData = this.getDonutData.bind(this);
  }

  componentDidMount() {
    this.getCallData();
  }

  getCallData = () => {
    fetch('/clients/calls', {
      method: 'GET',
      headers: authHeader()
    })
      .then(res => handleError(res))
      .then(res => res.json())
      .then(resJson => {
        let calls = [];
        let timestamps = [];
        let probabilities = [];
        let estimateValues = [];
        let invoices = [];
        let callsMonthScope = [];

        for (let i = 0; i < resJson.message.length; i++) {
          calls = [...calls, ...resJson.message[i].calls];
        }
        calls.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < calls.length; i++) {
          if (moment().diff(moment(calls[i].timestamp.slice(0, 10)), 'months') <= this.state.monthScope) {
            callsMonthScope.push(calls[i]);
            timestamps.push(calls[i].timestamp.slice(0, 10));
            probabilities.push(Math.round(calls[i].opportunityProbability * 100));
            estimateValues.push(calls[i].estimateValue);
            let invoiceTotal = calls[i].invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0);
            invoices.push(invoiceTotal);
          }
        }

        let timesObject = {};

        // NOTE: used metricAvg as generic array. Change invoice to other array to graph different data
        for (let i = 0; i < timestamps.length; i++) {
          if (!timesObject.hasOwnProperty(timestamps[i])) {
            timesObject[timestamps[i]] = [invoices[i]];
          }
          else {
            timesObject[timestamps[i]] = [...timesObject[timestamps[i]], invoices[i]]
          }
        }

        for (let prop in timesObject) {
          let sum = 0;
          for (let i = 0; i < timesObject[prop].length; i++) {
            sum += timesObject[prop][i];
          }
          let avg = sum / timesObject[prop].length;
          timesObject[prop] = avg;
        }

        timestamps = Object.keys(timesObject);
        let metricAvg = timestamps.map((item) => {
          return parseInt((Math.round(timesObject[item] * 100) / 100).toFixed(2));
        });

        this.props.storeMetrics({
          calls: callsMonthScope,
          timestamps: timestamps,
          metricAvg: metricAvg,
          probabilities: probabilities,
          estimateValues: estimateValues,
          invoices: invoices
        });
        this.setState({ isLoading: false });
      })
      .catch(err => {
        console.log(err)
      });
  }

  getDonutData() {
    let low = 0;
    let med = 0;
    let high = 0;
    this.props.invoices.forEach((e) => {
      if (e >= 0 && e < 1000) {
        low++;
      }
      else if (e >= 1000 && e < 5000) {
        med++;
      }
      else if (e >= 5000) {
        high++;
      }
    });
    return [high, med, low];
  }

  getWorkersInfo = () => {
    let workersArr = [{ name: "TOTAL", total: 0 }];
    for (let i = 0; i < this.props.calls.length; i++) {
      for (let j = 0; j < this.props.calls[i].invoice.length; j++) {
        if (!!this.props.calls[i].invoice[j].tech) {
          if (!workersArr.filter(item => item.name === this.props.calls[i].invoice[j].tech).length > 0) {
            workersArr = [...workersArr, { name: this.props.calls[i].invoice[j].tech, total: 0 }];
          }
          workersArr.find(item => item.name === this.props.calls[i].invoice[j].tech).total += this.props.calls[i].invoice[j].amountAfterDiscount;
          workersArr.find(item => item.name === "TOTAL").total += this.props.calls[i].invoice[j].amountAfterDiscount;
        }
      }
    }
    return workersArr;
  };

  render() {
    let lineData = {
      labels: this.props.timestamps,
      datasets: [{
        fill: true,
        backgroundColor: "rgba(68, 185, 186, 0.3)",
        label: "Daily total ($)",
        borderColor: '#51C4C6',
        data: this.props.metricAvg,
        borderCapStyle: "round",
        borderJoinStyle: "round",
      }]
    };
    let lineOptions = {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            tooltipFormat: 'DD/MM/YY'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Revenue ($)'
          }
        }]
      },
      elements: {
        line: {
          tension: 0.2, // disables bezier curves
        }
      },
      legend: {
        display: false
      }
    };

    let donutData = {
      datasets: [{
        data: this.getDonutData(),
        backgroundColor: ["#E62325", "#00A78F", "#8EE9D4"],
        hoverBackgroundColor: ["#D90001", "#55AE9E", "#90DFDA"]
      }],
      labels: ["$5000+", "$1000 - $5000", "$0 - $1000"]
    };
    let donutOptions = {
      cutoutPercentage: 50,
      animation: {
        animateRotate: true
      },
      legend: {
        position: "right"
      }
    };

    let workersArr = this.getWorkersInfo();
    workersArr.sort((a, b) => {
      return b.total - a.total;
    });

    let topTechs;
    if (!!workersArr && workersArr.length > 3) {
      topTechs = (
        <div>
          <div className="top-worker">
            <p><strong>1. {workersArr[1].name}</strong></p>
            <p>${(Math.round(workersArr[1].total * 100) / 100).toFixed(2)}</p>
            <p className="value-percent">~{Math.round(workersArr[1].total / workersArr[0].total * 100)}% of total service revenue</p>
          </div>
          <div className="top-worker">
            <p><strong>2. {workersArr[2].name}</strong></p>
            <p>${(Math.round(workersArr[2].total * 100) / 100).toFixed(2)}</p>
            <p className="value-percent">~{Math.round(workersArr[2].total / workersArr[0].total * 100)}% of total service revenue</p>
          </div>
          <div className="top-worker">
            <p><strong>3. {workersArr[3].name}</strong></p>
            <p>${(Math.round(workersArr[3].total * 100) / 100).toFixed(2)}</p>
            <p className="value-percent">~{Math.round(workersArr[3].total / workersArr[0].total * 100)}% of total service revenue</p>
          </div>
        </div>
      );
    }

    let valueEstimates;
    if (this.props.estimateValues.length > 0) {
      let valuesObj = {
        total: 0,
        high: 0,
        med: 0,
        low: 0
      };
      this.props.estimateValues.forEach((val) => {
        if (val === 1) {
          valuesObj.low++;
          valuesObj.total++;
        } else if (val === 2) {
          valuesObj.med++;
          valuesObj.total++;
        } else if (val === 3) {
          valuesObj.high++;
          valuesObj.total++;
        }
      });
      valueEstimates = (
        <div>
          <div className="value-estimate">
            <p className="high"><strong>High</strong></p>
            <p><strong>{valuesObj.high}</strong> high value prospects</p>
            <p className="value-percent">~{Math.round(valuesObj.high / valuesObj.total * 100)}% of all prospects</p>
          </div>
          <div className="value-estimate">
            <p className="med"><strong>Medium</strong></p>
            <p><strong>{valuesObj.med}</strong> medium value prospects</p>
            <p className="value-percent">~{Math.round(valuesObj.med / valuesObj.total * 100)}% of all prospects</p>
          </div>
          <div className="value-estimate">
            <p className="low"><strong>Low</strong></p>
            <p><strong>{valuesObj.low}</strong> low value prospects</p>
            <p className="value-percent">~{Math.round(valuesObj.low / valuesObj.total * 100)}% of all prospects</p>
          </div>
        </div>
      );
    }

    return (
      <div id="stats-body">
        <div id="stats-header">
          <h2>Client statistics <span>(last {this.state.monthScope} months)</span></h2>
          <div className="months-dropdown">
            <DropdownButton id="dropdown-basic-button" title={"Last " + this.state.monthScope + " months"}>
              <Dropdown.Item value={3} onClick={() => { this.setState({ monthScope: 3, isLoading: true }, this.getCallData) }}>3 months</Dropdown.Item>
              <Dropdown.Item value={6} onClick={() => { this.setState({ monthScope: 6, isLoading: true }, this.getCallData) }}>6 months</Dropdown.Item>
              <Dropdown.Item value={12} onClick={() => { this.setState({ monthScope: 12, isLoading: true }, this.getCallData) }}>12 months</Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
        {
          this.state.isLoading ?
            <div className="text-center">
              <div className="spinner-grow text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div className="spinner-grow text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div className="spinner-grow text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            :
            <div id="stats-content">
              <div id="line-graph">
                <h3>Daily service revenue</h3>
                <Line data={lineData} options={lineOptions} height={100} />
              </div>
              <div id="lower-group">
                <div id="donut-graph">
                  <h3>Revenue range distribution</h3>
                  <Pie data={donutData} options={donutOptions} />
                </div>
                <div id="leaderboard-group">
                  <div className="leaderboard-section">
                    <h3>Top technicians</h3>
                    <div className="leaderboard">
                      {topTechs}
                    </div>
                  </div>
                  <div className="leaderboard-section">
                    <h3>Value estimates</h3>
                    <div className="leaderboard">
                      {valueEstimates}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        }
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeMetrics: data => dispatch(storeMetrics(data)),
  };
};

const mapStateToProps = state => {
  return {
    calls: state.metricReducer.calls,
    timestamps: state.metricReducer.timestamps,
    metricAvg: state.metricReducer.metricAvg,
    probabilities: state.metricReducer.probabilities,
    estimateValues: state.metricReducer.estimateValues,
    invoices: state.metricReducer.invoices
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Statistics)

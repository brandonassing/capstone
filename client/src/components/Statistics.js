import React, { Component } from 'react';
import './Statistics.scss';
import { Line, Pie } from 'react-chartjs-2';
import moment from 'moment';
import { connect } from 'react-redux';
import { storeMetrics } from '../_actions/metricList';

import { authHeader } from '../_helpers/auth';
import { handleError } from '../_helpers/errors';

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metricWeek: 0,
      metricMonth: 0,
      metricYear: 0
    }

    this.getDonutData = this.getDonutData.bind(this);
  }

  componentDidMount() {
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

        for (let i = 0; i < resJson.message.length; i++) {
          calls = [...calls, ...resJson.message[i].calls];
        }
        calls.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < calls.length; i++) {
          // NOTE: controls graph scope
          if (moment().diff(moment(calls[i].timestamp.slice(0, 10)), 'months') <= 6) {
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
          calls: calls,
          timestamps: timestamps,
          metricAvg: metricAvg,
          probabilities: probabilities,
          estimateValues: estimateValues,
          invoices: invoices
        });
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

  render() {
    let lineData = {
      labels: this.props.timestamps,
      datasets: [{
        fill: false,
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
            labelString: 'Invoice total ($)'
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

    let totalMetricWeek = 0, weekDenom = 0;
    let totalMetricMonth = 0, monthDenom = 0;
    let totalMetricYear = 0, yearDenom = 0;
    // TODO
    for (let i = 0; i < this.props.calls.length; i++) {
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'week')) {
        totalMetricWeek += parseInt((Math.round(this.props.calls[i].invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2));

        weekDenom++;
      }
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'month')) {
        totalMetricMonth += parseInt((Math.round(this.props.calls[i].invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2));
        monthDenom++;
      }
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'year')) {
        totalMetricYear += parseInt((Math.round(this.props.calls[i].invoice.reduce((total, inv) => total + inv.amountAfterDiscount, 0) * 100) / 100).toFixed(2));
        yearDenom++;
      }
    }
    let weekJSX;
    if (weekDenom > 0) {
      weekJSX = <p>{totalMetricWeek / weekDenom}</p>
    }
    else {
      weekJSX = <p>No data</p>
    }

    let monthJSX;
    if (monthDenom > 0) {
      monthJSX = <p>{totalMetricMonth / monthDenom}</p>
    }
    else {
      monthJSX = <p>No data</p>
    }

    let yearJSX;
    if (yearDenom > 0) {
      yearJSX = <p>{totalMetricYear / yearDenom}</p>
    }
    else {
      yearJSX = <p>No data</p>
    }

    return (
      <div id="stats-body">
        <div id="stats-header">
          <h2>Client statistics <span>(last 6 months)</span></h2>
        </div>
        {
          this.props.metricAvg.length === 0 ?
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
                <h3>Daily invoice totals</h3>
                <Line data={lineData} options={lineOptions} height={100} />
              </div>
              <div id="lower-group">
                <div id="donut-graph">
                  <h3>Clients' invoice totals distribution</h3>
                  <Pie data={donutData} options={donutOptions} />
                </div>
                <div id="avg-group">
                  <h3>Clients' invoice totals averages</h3>
                  <div id="avg-cards">
                    <div className="avg">
                      <h4>This week</h4>
                      {weekJSX}
                    </div>
                    <div className="avg">
                      <h4>This month</h4>
                      {monthJSX}
                    </div>
                    <div className="avg">
                      <h4>This year</h4>
                      {yearJSX}
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

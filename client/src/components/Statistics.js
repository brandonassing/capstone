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
        for (let i = 0; i < resJson.message.length; i++) {
          calls = [...calls, ...resJson.message[i].calls];
        }
        calls.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < calls.length; i++) {
          timestamps.push(calls[i].timestamp);
          probabilities.push(Math.round(calls[i].opportunityProbability * 100));
          estimateValues.push(calls[i].estimateValue);
        }
        this.props.storeMetrics({
          calls: calls,
          timestamps: timestamps,
          probabilities: probabilities,
          estimateValues: estimateValues
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
    this.props.estimateValues.forEach((e) => {
      if (e === 1) {
        low++;
      }
      else if (e === 2) {
        med++;
      }
      else if (e === 3) {
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
        label: "Call value",
        borderColor: '#51C4C6',
        data: this.props.probabilities,
        borderCapStyle: "round",
        borderJoinStyle: "round",
      }]
    };
    let lineOptions = {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
              'millisecond': 'MMM',
              'second': 'MMM',
              'minute': 'MMM',
              'hour': 'MMM',
              'day': 'MMM',
              'week': 'MMM',
              'month': 'MMM',
              'quarter': 'MMM',
              'year': 'MMM',
            },
            tooltipFormat: 'DD/MM/YY'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Probability (%)'
          }
        }]
      },
      elements: {
        line: {
          tension: 0.05, // disables bezier curves
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
      labels: ["High", "Med", "Low"]
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

    for (let i = 0; i < this.props.calls.length; i++) {
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'week')) {
        totalMetricWeek += this.props.calls[i].opportunityProbability;
        weekDenom++;
      }
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'month')) {
        totalMetricMonth += this.props.calls[i].opportunityProbability;
        monthDenom++;
      }
      if (moment(this.props.calls[i].timestamp).isSame(new Date(), 'year')) {
        totalMetricYear += this.props.calls[i].opportunityProbability;
        yearDenom++;
      }
    }

    let weekJSX;
    if (weekDenom !== 0) {
      weekJSX = <p>{totalMetricWeek / weekDenom}</p>
    }
    else {
      weekJSX = <p>No data</p>
    }

    let monthJSX;
    if (monthDenom !== 0) {
      monthJSX = <p>{totalMetricMonth / monthDenom}</p>
    }
    else {
      monthJSX = <p>No data</p>
    }

    let yearJSX;
    if (yearDenom !== 0) {
      yearJSX = <p>{totalMetricYear / yearDenom}</p>
    }
    else {
      yearJSX = <p>No data</p>
    }

    return (
      <div id="stats-body">
        <div id="stats-header">
          <h2>Call statistics</h2>
        </div>
        <div id="stats-content">
          <div id="line-graph">
            <h3>Clients' invoice probability over time</h3>
            <Line data={lineData} options={lineOptions} height={100} />
          </div>
          <div id="lower-group">
            <div id="donut-graph">
              <h3>Clients' value estimate distribution</h3>
              <Pie data={donutData} options={donutOptions} />
            </div>
            <div id="avg-group">
              <h3>Clients' value averages</h3>
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
    probabilities: state.metricReducer.probabilities,
    estimateValues: state.metricReducer.estimateValues
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Statistics)

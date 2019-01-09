import React, { Component } from 'react';
import './Statistics.scss';
import { Line, Pie } from 'react-chartjs-2';
import moment from 'moment';
import { connect } from 'react-redux';
import { storeChurns } from '../actions/churnList';

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      churnWeek: 0,
      churnMonth: 0,
      churnYear: 0
    }

    this.getDonutData = this.getDonutData.bind(this);
  }

  componentDidMount() {
    fetch('/clients/churn')
      .then(res => res.json())
      .then(resJson => {
        let churns = [];
        let timestamps = [];
        let probabilities = [];
        for (let i = 0; i < resJson.message.length; i++) {
          churns = [...churns, ...resJson.message[i].churnProbabilities];
        }
        churns.sort((a, b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0));

        for (let i = 0; i < churns.length; i++) {
          timestamps.push(churns[i].timestamp);
          probabilities.push(churns[i].probability);
        }
        console.log(churns);
        this.props.storeChurns({
          churns: churns,
          timestamps: timestamps,
          probabilities: probabilities
        });
      });
  }

  getDonutData() {
    let good = 0;
    let med = 0;
    let bad = 0;

    this.props.probabilities.forEach((e) => {
      if (e >= 0 && e < 40) {
        good++;
      }
      else if (e >= 40 && e < 75) {
        med++;
      }
      else if (e >= 75 && e < 100) {
        bad++;
      }
    });

    return [good, med, bad];
  }

  render() {
    let lineData = {
      labels: this.props.timestamps,
      datasets: [{
        fill: false,
        label: "Churn probability",
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
        backgroundColor: ["#00A78F", "#8EE9D4", "#E62325"],
        hoverBackgroundColor: ["#55AE9E", "#90DFDA", "#D90001"]
      }],
      labels: ["Low", "Med", "High"]
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

    let totalChurnWeek = 0, weekDenom = 0;
    let totalChurnMonth = 0, monthDenom = 0;
    let totalChurnYear = 0, yearDenom = 0;

    for (let i = 0; i < this.props.churns.length; i++) {
      if (moment(this.props.churns[i].timestamp).isSame(new Date(), 'week')) {
        totalChurnWeek += this.props.churns[i].probability;
        weekDenom++;
      }
      if (moment(this.props.churns[i].timestamp).isSame(new Date(), 'month')) {
        totalChurnMonth += this.props.churns[i].probability;
        monthDenom++;
      }
      if (moment(this.props.churns[i].timestamp).isSame(new Date(), 'year')) {
        totalChurnYear += this.props.churns[i].probability;
        yearDenom++;
      }
    }

    let weekJSX;
    if (weekDenom !== 0) {
      weekJSX = <p>{totalChurnWeek / weekDenom}</p>
    }
    else {
      weekJSX = <p>No data</p>
    }

    let monthJSX;
    if (monthDenom !== 0) {
      monthJSX = <p>{totalChurnMonth / monthDenom}</p>
    }
    else {
      monthJSX = <p>No data</p>
    }

    let yearJSX;
    if (yearDenom !== 0) {
      yearJSX = <p>{totalChurnYear / yearDenom}</p>
    }
    else {
      yearJSX = <p>No data</p>
    }

    return (
      <div id="stats-body">
        <div id="stats-header">
          <h2>Churn statistics</h2>
        </div>
        <div id="stats-content">
          <div id="line-graph">
            <h3>Clients' churn over time</h3>
            <Line data={lineData} options={lineOptions} height={100} />
          </div>
          <div id="lower-group">
            <div id="donut-graph">
              <h3>Clients' churn distribution</h3>
              <Pie data={donutData} options={donutOptions} />
            </div>
            <div id="avg-group">
              <h3>Clients' churn averages</h3>
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
    storeChurns: churnData => dispatch(storeChurns(churnData)),
  };
};

const mapStateToProps = state => {
  return {
    churns: state.churnReducer.churns,
    timestamps: state.churnReducer.timestamps,
    probabilities: state.churnReducer.probabilities
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Statistics)

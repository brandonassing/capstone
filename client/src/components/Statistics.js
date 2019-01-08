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

    let churnWeek = 0;
    let churnMonth = 0;
    let churnYear = 0;

    // churnWeek = this.props.churns.reduce((acc, churn) => {
    //   if (churn.timestamp == ) {
    //     return 
    //   }
    // });

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
                  <p>{churnWeek}</p>
                </div>
                <div className="avg">
                  <h4>This month</h4>
                  <p>{churnMonth}</p>
                </div>
                <div className="avg">
                  <h4>This year</h4>
                  <p>{churnYear}</p>
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

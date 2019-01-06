import React, { Component } from 'react';
import './Statistics.scss';
import { Line } from 'react-chartjs-2';
import moment from 'moment';


class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      churns: [],
      timestamps: [],
      probabilities: []
    }
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
        churns.sort((a,b) => (moment(a.timestamp).isAfter(b.timestamp)) ? 1 : ((moment(b.timestamp).isAfter(a.timestamp)) ? -1 : 0)); 

        for (let i = 0; i < churns.length; i++) {
          timestamps.push(churns[i].timestamp);
          probabilities.push(churns[i].probability);
        }
        this.setState({
          churns: churns,
          timestamps: timestamps,
          probabilities: probabilities
        });
      });
  }
  render() {
    var data = {
      labels: this.state.timestamps,
      datasets: [{
        fill: false,
        label: "Churn probability",
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: this.state.probabilities,
      }]
    }
    var graphOptions = {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
              'millisecond': 'MMM DD',
              'second': 'MMM DD',
              'minute': 'MMM DD',
              'hour': 'MMM DD',
              'day': 'MMM DD',
              'week': 'MMM DD',
              'month': 'MMM DD',
              'quarter': 'MMM DD',
              'year': 'MMM DD',
            },
            tooltipFormat: 'DD/MM/YY'
          }
        }],
      },
      elements: {
        line: {
            tension: 0, // disables bezier curves
        }
      }
    };
    return (
      <div>
        <div id="line-graph">
          < Line
            data={data}
            height={300}
            width={700}
            options={graphOptions}
          />
        </div>
      </div>
    );
  }
}

export default Statistics;


// const mapDispatchToProps = dispatch => {
//   return {
//     storeClients: clientData => dispatch(storeClients(clientData)),
//     refreshClients: clientData => dispatch(refreshClients(clientData))
//   };
// };

// const mapStateToProps = state => {
//   return {
//     clientProfiles: state.clientReducer.clients
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Statistics)

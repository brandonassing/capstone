import React, { Component } from 'react';
import './Statistics.scss';
import { Line } from 'react-chartjs-2';

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      churn: []
    }
  }
  componentDidMount() {
    fetch('/clients/churn')
      .then(res => res.json())
      .then(resJson => {
        let churns = [];
        for (let i = 0; i < resJson.message.length; i++) {
          churns = [...churns, ...resJson.message[i].churnProbabilities];
        }
        this.setState({
          churn: churns
        });
      });
  }
  render() {
    var data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [{
        label: "My First dataset",
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45],
      }]
    }
    return (
      <div>
        <div id="line-graph">
          < Line
            data={data}
            height={500}
            width={700}
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

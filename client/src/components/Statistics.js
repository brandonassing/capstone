import React, { Component } from 'react';
import './Statistics.scss';
import { Line } from 'react-chartjs-2';


class Statistics extends Component {
  render() {
    var data= {
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

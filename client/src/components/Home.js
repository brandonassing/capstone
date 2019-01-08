import React, { Component } from 'react';
import './Home.scss';

import Nav from './Nav';
import ClientProfile from './ClientProfile';
import Statistics from './Statistics';
import AdminDashboard from './AdminDashboard';


class Home extends Component {

  render() {
    return (
      <div id="home-body">
        <div id="header">
          <Nav />
        </div>
        <div className="tab-content shadow" id="nav-tab-content">
          <div className="tab-pane fade show active" id="stats" role="tabpanel" aria-labelledby="stats-tab">
            <Statistics />
          </div>
          <div className="tab-pane fade" id="clients" role="tabpanel" aria-labelledby="client-tab">
            <ClientProfile />
          </div>
          <div className="tab-pane fade" id="admin-dashboard" role="tabpanel" aria-labelledby="admin-tab">
            <AdminDashboard />
          </div>
        </div>

      </div>
    );
  }
}

export default Home;




// import React from 'react';
// import { push } from 'connected-react-router';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import {
//   increment,
//   incrementAsync,
//   decrement,
//   decrementAsync
// } from '../reducers/counter';
//
// const Home = props => (
//   <div>
//     <h1>Home</h1>
//     <p>Count: {props.count}</p>
//
//     <p>
//       <button onClick={props.increment}>Increment</button>
//       <button onClick={props.incrementAsync} disabled={props.isIncrementing}>Increment Async</button>
//     </p>
//
//     <p>
//       <button onClick={props.decrement}>Decrementing</button>
//       <button onClick={props.decrementAsync} disabled={props.isDecrementing}>Decrement Async</button>
//     </p>
//
//     <p><button onClick={() => props.changePage()}>Go to about page via redux</button></p>
//   </div>
// );
//
// const mapStateToProps = ({ counter }) => ({
//   count: counter.count,
//   isIncrementing: counter.isIncrementing,
//   isDecrementing: counter.isDecrementing
// });
//
// const mapDispatchToProps = dispatch => bindActionCreators({
//   increment,
//   incrementAsync,
//   decrement,
//   decrementAsync,
//   changePage: () => push('/about-us')
// }, dispatch);
//
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(Home);

import { combineReducers } from 'redux';
import { clientReducer } from './clientList';
import { metricReducer } from './metricList';
export default combineReducers({
  clientReducer: clientReducer,
  metricReducer: metricReducer
});

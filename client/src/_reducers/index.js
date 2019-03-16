import { combineReducers } from 'redux';
import { clientReducer } from './clientList';
import { metricReducer } from './metricList';
import { authenticationReducer } from './authentication';
import { userReducer } from './users';

export default combineReducers({
  clientReducer: clientReducer,
  metricReducer: metricReducer,
  authenticationReducer: authenticationReducer,
  userReducer: userReducer
});

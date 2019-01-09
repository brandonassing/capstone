import { combineReducers } from 'redux';
import { clientReducer } from './clientList';
import { churnReducer } from './churnList';
export default combineReducers({
  clientReducer: clientReducer,
  churnReducer: churnReducer
});

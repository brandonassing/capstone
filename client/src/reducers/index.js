import { combineReducers } from 'redux';
import { clientReducer } from './clientList';
export default combineReducers({
  clientReducer: clientReducer
});

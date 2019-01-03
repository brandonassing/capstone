import { STORE_CLIENTS, REFRESH_CLIENTS } from '../actions/clientList';
const initialStateClientReducer = {
  clients: []
};
export const clientReducer = (state = initialStateClientReducer, action) => {
  switch(action.type){
    case STORE_CLIENTS:
      return {
        ...state,
        clients: [...state.clients, ...action.data]
      };
    case REFRESH_CLIENTS:
      return {
        clients: action.data
      }
    default: return state;
  }
}

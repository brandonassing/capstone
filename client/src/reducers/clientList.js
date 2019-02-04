import { STORE_CLIENTS, REFRESH_CLIENTS, UPDATE_CLIENT } from '../actions/clientList';
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
    case UPDATE_CLIENT:
      let index = state.clients.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        clients: [...state.clients.slice(0, index), action.data, ...state.clients.slice(index + 1)]
      }
    default: return state;
  }
}

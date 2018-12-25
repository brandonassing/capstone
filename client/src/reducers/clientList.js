import { storeClients, STORE_CLIENTS } from '../actions/clientList';
const initialStateClientReducer = {
  clients: []
};
export const clientReducer = (state = initialStateClientReducer, action) => {
  switch(action.type){
    case STORE_CLIENTS:
      return {
        ...state,
        clients: action.data
      };
    default: return state;
  }
}

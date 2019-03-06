import { STORE_CLIENTS, REFRESH_CLIENTS, UPDATE_CLIENT, STORE_CLIENTS_ACTIVE, REFRESH_CLIENTS_ACTIVE, UPDATE_CLIENT_ACTIVE } from '../actions/clientList';
const initialStateClientReducer = {
  clients: [],
  clientsActive: []
};
export const clientReducer = (state = initialStateClientReducer, action) => {
  switch (action.type) {
    case STORE_CLIENTS:
      return {
        ...state,
        clients: [...state.clients, ...action.data]
      };
    case REFRESH_CLIENTS:
      return {
        ...state,
        clients: action.data
      }
    case UPDATE_CLIENT:
      let index = state.clients.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clients: [...state.clients.slice(0, index), action.data, ...state.clients.slice(index + 1)]
      }
    case STORE_CLIENTS_ACTIVE:
      return {
        ...state,
        clientsActive: [...state.clientsActive, ...action.data]
      };
    case REFRESH_CLIENTS_ACTIVE:
      return {
        ...state,
        clientsActive: action.data
      }
    case UPDATE_CLIENT_ACTIVE:
      let indexActive = state.clientsActive.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clientsActive: [...state.clientsActive.slice(0, indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)]
      }
    default: return state;
  }
}

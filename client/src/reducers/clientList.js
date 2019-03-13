import { STORE_CLIENTS, REFRESH_CLIENTS, UPDATE_CLIENT, STORE_CLIENTS_ACTIVE, REFRESH_CLIENTS_ACTIVE, UPDATE_CLIENT_ACTIVE, STORE_CLIENTS_COMPLETED, REFRESH_CLIENTS_COMPLETED, UPDATE_CLIENT_COMPLETED, UPDATE_CLIENT_ALL } from '../actions/clientList';
const initialStateClientReducer = {
  clients: [],
  clientsActive: [],
  clientsCompleted: []
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

    case STORE_CLIENTS_COMPLETED:
      return {
        ...state,
        clientsCompleted: [...state.clientsCompleted, ...action.data]
      };
    case REFRESH_CLIENTS_COMPLETED:
      return {
        ...state,
        clientsCompleted: action.data
      }
    case UPDATE_CLIENT_COMPLETED:
      let indexCompleted = state.clientsCompleted.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clientsCompleted: [...state.clientsCompleted.slice(0, indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
      }
    case UPDATE_CLIENT_ALL:
      index = state.clients.findIndex(item => {
        return item._id === action.data._id;
      });
      indexActive = state.clientsActive.findIndex(item => {
        return item._id === action.data._id;
      });
      indexCompleted = state.clientsCompleted.findIndex(item => {
        return item._id === action.data._id;
      });

      // TODO bug: completed is getting entries that it shouldn't (ie set to inactive; shows up in completed)
      if (action.inProspects && action.inActive) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index === -1 ? 0 : index), action.data, ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive === -1 ? 0 : indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: [...state.clientsCompleted.slice(0, indexCompleted === -1 ? 0 : indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      else if (action.inProspects) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index === -1 ? 0 : index), action.data, ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive), ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: [...state.clientsCompleted.slice(0, indexCompleted === -1 ? 0 : indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      else if (action.inActive) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index), ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive === -1 ? 0 : indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: [...state.clientsCompleted.slice(0, indexCompleted === -1 ? 0 : indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      // should not be reached
      else {
        return state;
      }
    default: return state;
  }
};

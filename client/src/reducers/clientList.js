import { clientConsts } from '../constants/clientConstants';

const initialStateClientReducer = {
  clients: [],
  clientsActive: [],
  clientsCompleted: []
};
export const clientReducer = (state = initialStateClientReducer, action) => {
  switch (action.type) {
    case clientConsts.STORE_CLIENTS:
      return {
        ...state,
        clients: [...state.clients, ...action.data]
      };
    case clientConsts.REFRESH_CLIENTS:
      return {
        ...state,
        clients: action.data
      }
    case clientConsts.UPDATE_CLIENT:
      let index = state.clients.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clients: [...state.clients.slice(0, index), action.data, ...state.clients.slice(index + 1)]
      }

    case clientConsts.STORE_CLIENTS_ACTIVE:
      return {
        ...state,
        clientsActive: [...state.clientsActive, ...action.data]
      };
    case clientConsts.REFRESH_CLIENTS_ACTIVE:
      return {
        ...state,
        clientsActive: action.data
      }
    case clientConsts.UPDATE_CLIENT_ACTIVE:
      let indexActive = state.clientsActive.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clientsActive: [...state.clientsActive.slice(0, indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)]
      }

    case clientConsts.STORE_CLIENTS_COMPLETED:
      return {
        ...state,
        clientsCompleted: [...state.clientsCompleted, ...action.data]
      };
    case clientConsts.REFRESH_CLIENTS_COMPLETED:
      return {
        ...state,
        clientsCompleted: action.data
      }
    case clientConsts.UPDATE_CLIENT_COMPLETED:
      let indexCompleted = state.clientsCompleted.findIndex(item => {
        return item._id === action.data._id;
      });
      return {
        ...state,
        clientsCompleted: [...state.clientsCompleted.slice(0, indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
      }
    case clientConsts.UPDATE_CLIENT_ALL:
      index = state.clients.findIndex(item => {
        return item._id === action.data._id;
      });
      indexActive = state.clientsActive.findIndex(item => {
        return item._id === action.data._id;
      });
      indexCompleted = state.clientsCompleted.findIndex(item => {
        return item._id === action.data._id;
      });

      let oldCompleted = state.clientsCompleted;
      if (action.inProspects && action.inActive) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index === -1 ? 0 : index), action.data, ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive === -1 ? 0 : indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: indexCompleted === -1 ? oldCompleted : [...state.clientsCompleted.slice(0, indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      else if (action.inProspects) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index === -1 ? 0 : index), action.data, ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive), ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: indexCompleted === -1 ? oldCompleted : [...state.clientsCompleted.slice(0, indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      else if (action.inActive) {
        return {
          ...state,
          clients: [...state.clients.slice(0, index), ...state.clients.slice(index + 1)],
          clientsActive: [...state.clientsActive.slice(0, indexActive === -1 ? 0 : indexActive), action.data, ...state.clientsActive.slice(indexActive + 1)],
          clientsCompleted: indexCompleted === -1 ? oldCompleted : [...state.clientsCompleted.slice(0, indexCompleted), action.data, ...state.clientsCompleted.slice(indexCompleted + 1)]
        }
      }
      // should not be reached
      else {
        return state;
      }
    default: return state;
  }
};

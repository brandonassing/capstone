import { clientConsts } from '../_constants/clientConstants';


export const storeClients = clientData => ({
  type: clientConsts.STORE_CLIENTS,
  data: clientData
});

export const refreshClients = clientData => ({
  type: clientConsts.REFRESH_CLIENTS,
  data: clientData
});

export const updateClient = client => ({
  type: clientConsts.UPDATE_CLIENT,
  data: client
})

export const storeClientsActive = clientData => ({
  type: clientConsts.STORE_CLIENTS_ACTIVE,
  data: clientData
});

export const refreshClientsActive = clientData => ({
  type: clientConsts.REFRESH_CLIENTS_ACTIVE,
  data: clientData
});

export const updateClientActive = client => ({
  type: clientConsts.UPDATE_CLIENT_ACTIVE,
  data: client
})

export const storeClientsCompleted = clientData => ({
  type: clientConsts.STORE_CLIENTS_COMPLETED,
  data: clientData
});

export const refreshClientsCompleted = clientData => ({
  type: clientConsts.REFRESH_CLIENTS_COMPLETED,
  data: clientData
});

export const updateClientCompleted = client => ({
  type: clientConsts.UPDATE_CLIENT_COMPLETED,
  data: client
})

export const updateClientAll = clientData => ({
  type: clientConsts.UPDATE_CLIENT_ALL,
  data: clientData.client,
  inProspects: clientData.inProspects,
  inActive: clientData.inActive
})

export const removeAllClients = () => ({
  type: clientConsts.REMOVE_ALL_CLIENTS
})
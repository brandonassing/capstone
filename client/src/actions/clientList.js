export const STORE_CLIENTS = "STORE_CLIENTS";
export const REFRESH_CLIENTS = "REFRESH_CLIENTS";
export const UPDATE_CLIENT = "UPDATE_CLIENT";
export const STORE_CLIENTS_ACTIVE = "STORE_CLIENTS_ACTIVE";
export const REFRESH_CLIENTS_ACTIVE = "REFRESH_CLIENTS_ACTIVE";
export const UPDATE_CLIENT_ACTIVE = "UPDATE_CLIENT_ACTIVE";

export const storeClients = clientData => ({
  type: STORE_CLIENTS,
  data: clientData
});

export const refreshClients = clientData => ({
  type: REFRESH_CLIENTS,
  data: clientData
});

export const updateClient = client => ({
  type: UPDATE_CLIENT,
  data: client
})

export const storeClientsActive = clientData => ({
  type: STORE_CLIENTS_ACTIVE,
  data: clientData
});

export const refreshClientsActive = clientData => ({
  type: REFRESH_CLIENTS_ACTIVE,
  data: clientData
});

export const updateClientActive = client => ({
  type: UPDATE_CLIENT_ACTIVE,
  data: client
})
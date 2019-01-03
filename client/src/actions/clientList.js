export const STORE_CLIENTS = "STORE_CLIENTS";
export const REFRESH_CLIENTS = "REFRESH_CLIENTS";

export const storeClients = clientData => ({
  type: STORE_CLIENTS,
  data: clientData
});

export const refreshClients = clientData => ({
  type: REFRESH_CLIENTS,
  data: clientData
});

export const STORE_METRICS = "STORE_METRICS";
export const REMOVE_METRICS = "REMOVE_METRICS";

export const storeMetrics = data => ({
    type: STORE_METRICS,
    data: data
  });

  export const removeMetrics = () => ({
    type: REMOVE_METRICS
  });
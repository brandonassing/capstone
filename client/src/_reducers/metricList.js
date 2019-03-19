import { STORE_METRICS, REMOVE_METRICS } from '../_actions/metricList';
const initialStateMetricReducer = {
  probabilities: [],
  estimateValues: [],
  timestamps: [],
  metricAvg: [],
  invoices: [],
  calls: [],
  metricWeek: 0,
  metricMonth: 0,
  metricYear: 0
};
export const metricReducer = (state = initialStateMetricReducer, action) => {
  switch (action.type) {
    case REMOVE_METRICS:
      return {
        probabilities: [],
        estimateValues: [],
        timestamps: [],
        metricAvg: [],
        invoices: [],
        calls: [],
        metricWeek: 0,
        metricMonth: 0,
        metricYear: 0
      }
    case STORE_METRICS:
      return {
        ...state,
        estimateValues: action.data.estimateValues,
        probabilities: action.data.probabilities,
        timestamps: action.data.timestamps,
        metricAvg: action.data.metricAvg,
        invoices: action.data.invoices,
        calls: action.data.calls
      };
    default: return state;
  }
}

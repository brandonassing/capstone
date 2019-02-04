import { STORE_METRICS } from '../actions/metricList';
const initialStateMetricReducer = {
    metrics: [],
    timestamps: [],
    calls: [],
    metricWeek: 0,
    metricMonth: 0,
    metricYear: 0
};
export const metricReducer = (state = initialStateMetricReducer, action) => {
  switch(action.type){
    case STORE_METRICS:
      return {
        ...state,
        metrics: action.data.metrics,
        timestamps: action.data.timestamps,
        calls: action.data.calls
      };
    default: return state;
  }
}

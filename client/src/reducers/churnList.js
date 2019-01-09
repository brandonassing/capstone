import { STORE_CHURNS } from '../actions/churnList';
const initialStateChurnReducer = {
    churns: [],
    timestamps: [],
    probabilities: [],
    churnWeek: 0,
    churnMonth: 0,
    churnYear: 0
};
export const churnReducer = (state = initialStateChurnReducer, action) => {
  switch(action.type){
    case STORE_CHURNS:
      return {
        ...state,
        churns: action.data.churns,
        timestamps: action.data.timestamps,
        probabilities: action.data.probabilities
      };
    default: return state;
  }
}

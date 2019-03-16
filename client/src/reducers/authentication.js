import { userConstants } from '../_constants/userConstants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {};

export function authenticationReducer(state = initialState, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loggingIn: true,
        logInFail: false,
        user: action.user
      };
    case userConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        logInFail: false,
        user: action.user
      };
    case userConstants.LOGIN_FAILURE:
      return {
        loginFail: true
      };
    case userConstants.LOGOUT:
      return {};
    default:
      return state
  }
}
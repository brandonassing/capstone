import { userConstants } from '../_constants/userConstants';
import { userService } from '../_services/user';
// import { alertActions } from './';
// import { history } from '../helpers/history';
import { history } from '../store'


export const userActions = {
    login,
    logout,
    getAll
};

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    // dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

// TODO may not even need getAll bc may not need to get and store all users
function getAll() {
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                res => {
                    dispatch(success(res.message))
                },
                error => {
                    console.log(error)
                    dispatch(failure(error.message))
                }
            );
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}

export const removeUsers = () => ({
    type: userConstants.REMOVE
});
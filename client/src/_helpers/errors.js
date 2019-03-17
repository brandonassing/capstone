// import { userActions } from '../_actions/user';
// import store from '../store';
export const handleError = (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('user');
            window.location.reload(true);
        }
        throw Error(response.statusText);
    }
    return response;
};
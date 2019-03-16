import { authHeader } from '../_helpers/auth';

export const userService = {
    login,
    logout,
    getAll
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch('/users/auth', requestOptions)
        .then(handleResponse)
        .then(res => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(res.message));

            return res.message;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch('/users', requestOptions).then(handleResponse);
}

// TODO : right now code just sends reqs without having a handleResponse (ie: in Nav, Statistics, etc). Response should be handled like this function
function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            // TODO not sure if error code being sent back so may have to handle status lines differently 
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                window.location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
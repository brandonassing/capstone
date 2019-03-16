const config = require('../_helpers/config.json');
const jwt = require('jsonwebtoken');
var User = require('../models/user');


// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'test', email: 'test@test.com', password: 'test', name: 'Brandon Assing' }];

module.exports = {
    authenticate,
    getAll
};

function authenticate({ username, password }) {
    User.findOne({ username: username, password: password }, function (err, user) {
        if (err) {
            response = {
                "error": true,
                "message": "Invalid username and password"
            };
        } else {
            const token = jwt.sign({ sub: user.id }, config.secret);
            const { password, ...userWithoutPassword } = user;
            response = {
                "error": false,
                "message": {
                    ...userWithoutPassword,
                    token
                }
            };
            
            return response;
        }
    });
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

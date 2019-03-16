var express = require('express');
var router = express.Router();
var User = require('../models/user');
const config = require('../_helpers/config.json');
const jwt = require('jsonwebtoken');

// const userService = require('./user-service');

/* GET users listing. */
router.get('/', function (req, res, next) {
  // userService.getAll()
  //   .then(users => res.json(users))
  //   .catch(err => next(err));
  User.find().select('-password').exec(function (err, data) {
    if (err) {
      response = {
        "error": true,
        "message": "Error getting users"
      };
    } else {
      response = {
        "error": false,
        "message": data
      };

    }
    res.json(response);
  });
});

router.post('/auth', function (req, res, next) {
  // userService.authenticate(req.body)
  //   .then(user => user.message ? res.json(user.message) : res.status(400).json({ message: 'Username or password is incorrect' }))
  //   .catch(err => next(err));
  User.findOne(req.body).select('-password').exec(function (err, user) {
    if (err) {
      response = {
        "error": true,
        "message": "Invalid username and password"
      };
    } else {
      const token = jwt.sign({ sub: user._id }, config.secret);
      response = {
        "error": false,
        "message": {
          ...user._doc,
          ...{token: token}
        }
      };

    }
    res.json(response);
  });
});

module.exports = router;

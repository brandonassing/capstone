var express = require('express');
var router = express.Router();
var User = require('../models/user');
const config = require('../_helpers/config.json');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

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

// // TODO comment out after use to prevent user from accessing
// router.post('/create', function (req, res, next) {
//   bcrypt.hash(req.body.password, 10, function (err, hash) {
//     var newUser = req.body;
//     newUser.password = hash;
//     User.create(newUser, function (err, user) {
//       if (err) {
//         response = {
//           "error": true,
//           "message": err
//         };
//         res.json(response);
//       };
//       res.json(user);
//     });
//   });

// });

router.post('/auth', function (req, res, next) {
  // userService.authenticate(req.body)
  //   .then(user => user.message ? res.json(user.message) : res.status(400).json({ message: 'Username or password is incorrect' }))
  //   .catch(err => next(err));
  User.findOne({ username: req.body.username}).exec(function (err, user) {
    if (err) {
      response = {
        "error": true,
        "message": err
      };
      res.json(response);
    }
    if (!user) {
      res.status(400).json({ message: 'User does not exist' });
    }
    else {
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result == true) {
          const token = jwt.sign({ sub: user._id }, config.secret, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
          });
          const { password, ...passwordless } = user._doc;
          response = {
            "error": false,
            "message": {
              ...passwordless,
              ...{ token: token }
            }
          };
          res.json(response);
        } else {
          res.status(400).json({ message: 'Username and password invalid' });
        }
      });
    }
  });
});

module.exports = router;

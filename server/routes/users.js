var express = require('express');
var router = express.Router();
const userService = require('./user-service');


/* GET users listing. */
router.get('/', function (req, res, next) {
  // res.json(
  //   [{
  //     email: "assing.brandon@gmail.com",
  //     name: "Brandon Assing",
  //     role: "Manager"
  //   },
  //   {
  //     email: "flash-gordo@flash.ca",
  //     name: "Flash Gordon",
  //     role: "Operator"
  //   }
  //   ]
  // );
  userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
});

router.post('/auth', function (req, res, next) {
  userService.authenticate(req.body)
    .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
    .catch(err => next(err));
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(
    [{
        email: "assing.brandon@gmail.com",
        name: "Brandon Assing",
        role: "Manager"
      },
      {
        email: "flash-gordo@flash.ca",
        name: "Flash Gordon",
        role: "Operator"
      }
    ]
  );
});

module.exports = router;

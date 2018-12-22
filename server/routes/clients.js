var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json([{
    clientId: "000000",
    firstName: "Bobby",
    lastName: "Newport",
    email: "b_newport@gmail.com",
    phoneNumber: "6478849394",
    churnProbabilities: [{
      probability: 45.2,
      timestamp: 32043
    }],
    planDetails: [{
      rpuMonthly: 50.40,
      dataPlan: 3.5,
      timestamp: 34543
    }]
  }]);
});

module.exports = router;

var express = require('express');
var router = express.Router();
var clients = require('../devSamples/clients').clients;


router.get('/', function(req, res, next) {
  res.json(clients);
});

module.exports = router;

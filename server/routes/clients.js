var express = require('express');
var router = express.Router();
// var clients = require('../devSamples/clients').clients;
var Client = require('../models/client');

router.get('/', function(req, res, next) {
    res.json({
        message: 'welcome to our clients api!'
    });
});

router.route('/profiles')
.get(function (req, res) {
    Client.find().sort("-_id").exec(function (err, client) {
        if (err) {
          return res.send(err);
        }
        res.json(client);
    });
});


module.exports = router;

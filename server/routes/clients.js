var express = require('express');
var router = express.Router();
// var clients = require('../devSamples/clients').clients;
var Client = require('../models/client');

router.get('/', function (req, res, next) {
  res.json({
    message: 'welcome to our clients api!'
  });
});

router.route('/profiles').get(function (req, res) {
  var pageNo = parseInt(req.query.pageNo);
  var size = parseInt(req.query.size);
  var query = {};
  if (pageNo < 0 || pageNo === 0) {
    response = {
      "error": true,
      "message": "invalid page number, should start with 1"
    };
    return res.json(response);
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  // Find some documents
  Client.estimatedDocumentCount({}, function (err, totalCount) {
    if (err) {
      response = {
        "error": true,
        "message": "Error fetching data"
      };
    }
    Client.find({}, {}, query, function (err, data) {
      // Mongo command to fetch all data from collection.
      if (err) {
        response = {
          "error": true,
          "message": "Error fetching data"
        };
      } else {
        var totalPages = Math.ceil(totalCount / size);
        response = {
          "error": false,
          "message": data,
          "pages": totalPages
        };
      }
      res.json(response);
    });
  });
});

router.route('/churn').get(function (req, res) {
  Client.find()
    .select('churnProbabilities')
    .exec(function (err, data) {
      if (err) {
        response = {
          "error": true,
          "message": "Error fetching data"
        };
      }
      else {
        response = {
          "error": false,
          "message": data
        }
      }
      res.json(response);
    }); 
});

module.exports = router;

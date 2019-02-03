var express = require('express');
var router = express.Router();
//var Client = require('../models/client');
var Client = require('../models/client-lead-profiles');

router.get('/', function (req, res, next) {
  res.json({
    message: 'welcome to our clients api!'
  });
});

// Uses custom pagination setup. In future use mongoose-paginate
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

router.route('/profiles/search').get(function (req, res) {
  var pageNo = parseInt(req.query.pageNo);
  var size = parseInt(req.query.size);
  var searchKey = req.query.searchKey;
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

  Client.paginate({ $text: { $search: searchKey, $caseSensitive: false } }, { page: pageNo, limit: size }, function (err, data) {
    if (err) {
      response = {
        "error": true,
        "message": "Error fetching data"
      };
    } else {
      response = {
        "error": false,
        "message": data.docs,
        "pages": data.pages
      };
    }
    res.json(response);
  });
});

router.route('/calls').get(function (req, res) {
  Client.find()
    .select('calls')
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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClientSchema = new Schema({
  clientId: String,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  churnProbabilities: [{
    probability: Number,
    timestamp: Number
  }],
  planDetails: [{
    rpuMonthly: Number,
    dataPlan: Number,
    timestamp: Number
  }]
});

module.exports = mongoose.model('Client', ClientSchema);

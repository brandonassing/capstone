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
    timestamp: Date
  }],
  planDetails: [{
    rpuMonthly: Number,
    dataPlan: Number,
    timestamp: Date
  }]
});

module.exports = mongoose.model('Client', ClientSchema);

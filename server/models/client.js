var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

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

ClientSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phoneNumber: 'text' });
ClientSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Client', ClientSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var ClientSchema = new Schema({
  clientId: String,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  adderss: String,
  calls: [{
    worker: String,
    estimateValue: Number,
    opportunityProbability: Number,
    timestamp: Date,
    status: String,
    invoice: [{
      date: Date,
      quantity: Number,
      itemCode: String,
      description: String,
      discount: Number,
      amountAfterDiscount: Number,
      tech: String
    }]
  }]
});

ClientSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phoneNumber: 'text' });
ClientSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Client', ClientSchema);

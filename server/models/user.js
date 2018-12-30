var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO link to mongodb
var UserSchema = new Schema({
  {
    email: String,
    name: String,
    role: String
});

module.exports = mongoose.model('User', UserSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  
    email: String,
    name: String,
    role: String,
    password: String
});

module.exports = mongoose.model('User', UserSchema);

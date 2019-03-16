var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
    email: String,
    name: String,
    role: String,
    username: String,
    password: String
});

// // TODO move hashing and comparing from routes to here
// UserSchema.pre('save', function (next) {
//     var user = this;
//     if (!user.isModified('password')) {
//         return next();
//     }
//     bcrypt.genSalt(10, function (err, salt) {
//         bcrypt.hash(user.password, salt, function (err, hash) {
//             user.password = hash;
//             next();
//         });
//     });
// });

// UserSchema.methods.comparePassword = function (password, done) {
//     console.log("IN METHOD")
//     bcrypt.compare(password, this.password, function (err, isMatch) {
//         done(err, isMatch);
//     });
// };


module.exports = mongoose.model('User', UserSchema);

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/clients');

const mongoose = require('mongoose');

var app = express();

// Login config
const cors = require('cors');
const jwt = require('./_helpers/jwt');
// TODO error handling not working. Not going through error-handler.js
const errorHandler = require('./_helpers/error-handler');

app.use(cors());
app.use(jwt());
// app.use(errorHandler);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://main:se4450@main-ia8yw.mongodb.net/test?retryWrites=true" || "mongodb://localhost:27017/post", {dbName: "Main", useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/clients', clientsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

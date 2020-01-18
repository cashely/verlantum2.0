var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
const passport = require('passport');
var router = require('./router.js');

var app = express();
const session = require('./session')
const db = require('./db.config.js')

require('./passport/index').init(passport)

const {responseMiddleware} = require('./functions/helper');
app.use(responseMiddleware);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true)
  },
  credentials: true,
  optionsSuccessStatus: 200
}))
app.use(logger('dev'));
app.use(bodyParser.json({
   verify: function (req, res, buf, encoding) {
       req.rawBody = buf;
   }
}));
app.use(bodyParser.urlencoded({
   extended: true,
   verify: function (req, res, buf, encoding) {
       req.rawBody = buf;
   }
}));
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/upload')))
app.use(session());
app.use(passport.initialize());
app.use(passport.session());
router(app);
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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
app.listen(6010);
module.exports = app;

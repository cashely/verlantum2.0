var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
require("body-parser-xml")(bodyParser);
const passport = require('passport');
var router = require('./router.js');

const auth = require('./middleware/auth');

var autoRouter = require('./autoRoute');

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
app.use(bodyParser.xml({
  limit: "1MB",   // Reject payload bigger than 1 MB
  xmlParseOptions: {
    normalize: true,     // Trim whitespace inside text nodes
    normalizeTags: true, // Transform tags to lowercase
    explicitArray: false // Only put nodes in array if >1
  },
  verify: function(req, res, buf, encoding) {
    if(buf && buf.length) {
      // Store the raw XML
      req.rawBody = buf.toString(encoding || "utf8");
    }
  }
}));
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
app.use(auth);
router(app);
autoRouter(app);


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
app.listen(5010);
module.exports = app;

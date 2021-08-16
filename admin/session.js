const session = require('express-session');
const MongoStore = require('connect-mongo');
module.exports = function() {
  return session({
    secret: 'xiaoxunrencai.com',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      expires: 1000 * 60 * 60
    },
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/verlantum',
    }),
  })
}
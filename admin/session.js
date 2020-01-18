const session = require('express-session');
module.exports = function() {
  return session({
    secret: 'xiaoxunrencai.com',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      expires: 1000 * 60 * 60
    }
  })
}
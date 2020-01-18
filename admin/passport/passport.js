const localStrategy = require('passport-local').Strategy;
const models = require('../model.js');
const authenticationMiddleware = require('./passportMiddleware');
const passport = require('passport');

module.exports = () => {
  passport.serializeUser(function (user, cb) {
    cb(null, {uid: user._id, role: user.role})
  })

  passport.deserializeUser(function (user, cb) {
    // console.log(id)
    cb(null, user)
    // models.users.findById(id).then(user => {
    //   cb(null, user);
    // }).catch(err => {
    //   cb(err, null);
    // })
  })
  passport.use(new localStrategy({usernameField: 'acount', passwordField: 'password'}, (username, password, done) => {
    console.log('进入')
    models.users.findOne({acount: username}, (err, user) => {
      if(err) {return done(err)}
      if(!user) {
        return done(null, false, { message: '用户不存在'})
      }

      if(user.password !== password) {
        return done(null, false, { message: '密码不正确'})
      }
      console.log(user)
      return done(null, user);
    })
  }));
}

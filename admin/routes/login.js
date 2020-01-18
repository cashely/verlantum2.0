const models = require('../model.js');
const {response} = require('../functions/helper.js');
module.exports = {
  in(req, res, next) {
    const {uname, pwd} = req.body;
    if(uname === 'root' && pwd === 'root') {
      req.session.uid = 'root';
      response(200, 'ok', res)
    }else if(uname === 'root') {
      response(200, 'password error', res);
    }else {
      models.user.findOne({
        $or: [
          {uname: uname},
          {email: uname}
        ]
      }).select('uname email password')
      .then(user => {
        if(user) {
          if(user.password === pwd) {
            response(200, 'password error', res)
          }else {
            req.session.uid = user._id;
            response(200, 'ok', res)
          }
        }else {
          response(200, 'no user', res)
        }
      })
    }
  },
  user(req, res, next) {
  },
  requestLogin(req, res, next) {
    if(req.session.uid) {
      next()
    }else {
      response(200, 'required login', res);
    }
  }
}
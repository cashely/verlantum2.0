const models = require('./model.js');
const passport = require('passport');
const {getSha1} = require('./functions/helper');

const fs = require('fs');
const path = require('path');
const routesPath = path.resolve(__dirname, './routes/');
let routes = {}
let routeFiles = fs.readdirSync(routesPath);
routeFiles.map(file => {
  routes[file.split('.')[0]] = require(path.resolve(routesPath,file));
})

const {requestLogin} = require('./routes/login');
const authenticationMiddleware = require('./passport/passportMiddleware');

module.exports = (app) => {
  app
  .get('/', authenticationMiddleware(), (req, res) => {
    // console.log(passport.authenticate(), req.logout, req.logOut)
    console.log(req.response)
    res.json({test: req.isAuthenticated(), uid: req.user, session: req.session, password: getSha1('root')})
  })
  .post('/login', (req, res, next) => {
    // console.log(req.query.acount, req.query.password)
    const {acount, password} = req.body;
    if(acount && password) {
      req.body = {
        acount,
        password: getSha1(password)
      }
      passport.authenticate('local', (a, b, c) => {
        if(b) {
          req.logIn(b, (err) => {
            if(!err) {
              req.response(200, b)
            }else {
              req.response(200, "写入session失败" , 1)
            }
          })
        } else {
          req.response(200, c.message, 1)
        }
      })(req, res, next)
    }else {
      res.send('error')
    }
  })
  .post('/user', routes.user.add)
  .get('/users', routes.user.list)
  .get('/users/total', routes.user.total)
  .delete('/user/:id', routes.user.delete)
  .get('/user/:id', routes.user.detail)
  .put('/user/:id', routes.user.update)
  .get('/me', routes.user.me)

  .post('/agent', authenticationMiddleware(), routes.agent.add)
  .get('/agents', routes.agent.list)
  .get('/agents/total', authenticationMiddleware(), routes.agent.total)
  .delete('/agent/:id', authenticationMiddleware(), routes.agent.delete)
  .get('/agent/:id', authenticationMiddleware(), routes.agent.detail)
  .put('/agent/:id', authenticationMiddleware(), routes.agent.update)
  .post('/take/:id', routes.agent.take)

  .get('/orders',authenticationMiddleware(), routes.order.list)
  .get('/order/:id', routes.order.detail)
  .get('/orders/total', routes.order.total)
  .post('/order', routes.order.add)
  .put('/pay/:id', routes.order.pay)
  .delete('/order/:id', authenticationMiddleware(), routes.order.delete)

  .get('/excel/:filename', routes.order.excel)


  .get('/units', routes.other.units)


  .post('/upload', routes.upload)


  // .get('/qrCode', routes.other.qrCode)
  // .get('/qrRedirect', routes.other.qrRedirect)

  .post('/logout', (req, res) => {
    req.logOut();
    req.response(200, 'ok');
  })

  .get('/qrcode', routes.agent.qrcode)
  .get('/qrRedirect', routes.agent.qrRedirect)
  .get('/alipay', routes.agent.alipay)
  .get('/wxpay', routes.agent.wxpay)
  .use('/auth/alipaycallback', routes.agent.alipaycallback)
  .use('/auth/wxpaycallback', routes.agent.wxpaycallback)
}

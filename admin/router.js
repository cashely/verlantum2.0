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

  .post('/fruit', authenticationMiddleware(), routes.fruit.add)
  .get('/fruits', routes.fruit.list)
  .get('/fruits/total', authenticationMiddleware(), routes.fruit.total)
  .delete('/fruit/:id', authenticationMiddleware(), routes.fruit.delete)
  .get('/fruit/:id', authenticationMiddleware(), routes.fruit.detail)
  .put('/fruit/:id', authenticationMiddleware(), routes.fruit.update)

  .post('/pusher', authenticationMiddleware(), routes.pusher.add)
  .get('/pushers', authenticationMiddleware(), routes.pusher.list)
  .get('/pushers/total', authenticationMiddleware(), routes.pusher.total)
  .delete('/pusher/:id', authenticationMiddleware(), routes.pusher.delete)
  .get('/pusher/:id', authenticationMiddleware(), routes.pusher.detail)
  .put('/pusher/:id', authenticationMiddleware(), routes.pusher.update)

  .post('/puller', authenticationMiddleware(), routes.puller.add)
  .get('/pullers', authenticationMiddleware(), routes.puller.list)
  .get('/pullers/total', authenticationMiddleware(), routes.puller.total)
  .delete('/puller/:id', authenticationMiddleware(), routes.puller.delete)
  .get('/puller/:id', authenticationMiddleware(), routes.puller.detail)
  .put('/puller/:id', authenticationMiddleware(), routes.puller.update)

  .post('/outer', authenticationMiddleware(), routes.outer.add)
  .get('/outers', routes.outer.list)
  .get('/outers/total', authenticationMiddleware(), routes.outer.total)
  .delete('/outer/:id', authenticationMiddleware(), routes.outer.delete)
  .get('/outer/today', routes.outer.today)
  .get('/outer/yesterday', routes.outer.yesterday)
  .get('/outer/:id', authenticationMiddleware(), routes.outer.detail)
  .put('/outer/:id', authenticationMiddleware(), routes.outer.update)

  .post('/inner', authenticationMiddleware(), routes.inner.add)
  .get('/inners', routes.inner.list)
  .get('/inners/total', authenticationMiddleware(), routes.inner.total)
  .delete('/inner/:id', authenticationMiddleware(), routes.inner.delete)
  .get('/inner/:id', authenticationMiddleware(), routes.inner.detail)
  .put('/inner/:id', authenticationMiddleware(), routes.inner.update)


  .post('/costCategory', authenticationMiddleware(), routes.costCategory.add)
  .get('/costCategorys', routes.costCategory.list)
  .get('/costCategorys/total', authenticationMiddleware(), routes.costCategory.total)
  .delete('/costCategory/:id', authenticationMiddleware(), routes.costCategory.delete)
  .get('/costCategory/:id', authenticationMiddleware(), routes.costCategory.detail)
  .put('/costCategory/:id', authenticationMiddleware(), routes.costCategory.update)

  .post('/costDetail', routes.costDetail.add)
  .get('/costDetails', routes.costDetail.list)
  .get('/costDetails/total', authenticationMiddleware(), routes.costDetail.total)
  .delete('/costDetail/:id', authenticationMiddleware(), routes.costDetail.delete)
  .get('/costDetail/:id', authenticationMiddleware(), routes.costDetail.detail)
  .put('/costDetail/:id', authenticationMiddleware(), routes.costDetail.update)

  .get('/count/:fruit', authenticationMiddleware(), routes.count.detail)

  .get('/orders', routes.order.list)
  .get('/orders/total', routes.order.total)

  .get('/excel/:filename', routes.order.excel)


  .get('/units', routes.other.units)


  .post('/upload', routes.upload)


  .get('/qrCode', routes.other.qrCode)
  .get('/qrRedirect', routes.other.qrRedirect)

  .post('/logout', (req, res) => {
    req.logOut();
    req.response(200, 'ok');
  })
}

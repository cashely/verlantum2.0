const models = require('../model')
module.exports = (req, res, next) => {
  const { path, method, user } =req;
  if (method === 'GET' || path === '/login' || path === '/logout' || (path === '/order' && method === 'POST') || (/(\/auth)|(\/form)|(\/order)|(\/zhongqiu)/.test(path) && method === 'POST')) {
    next()
  } else {
    if(!user) {
      return req.response(200, '未登录', 2)
    } else {
      if(user.role === 3) {
        next()
      }else {
        const { role } = user;
        const conditions = {
          role
        }
        models.auths.find(conditions).then(auths => {
          console.log(auths)
          if(auths.some(auth => new RegExp(auth.path).test(path) && method.toLowerCase() === auth.method.toLowerCase())) {
            next()
          }else {
            req.response(200, '无权限', 1)
          }
        })
      }
    }
  }
}

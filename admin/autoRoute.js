const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const files = fs.readdirSync(path.resolve(__dirname, './autoRoutes'));

const routes = {};
files.map(file => {
  routes[file.split('.')[0]] = require(path.resolve(__dirname, 'autoRoutes', file))
})

module.exports = (app) => {
  _.keys(routes).map(key => {
    routes[key].map(({uri, method, callback}) => {
      console.log('装载自动路由', path.join(key, uri))
      app[method](path.join('/', key, uri), callback)
    })
  });

  app.get('/apis', (req, res) => {
    req.response(200, _.keys(routes).map(key => {
      return routes[key].map(({uri, method, callback, mark}) => ({uri: path.join('/', key, uri), method, mark}))
    }).reduce((a, b) => a.concat(b), []))
  })
}

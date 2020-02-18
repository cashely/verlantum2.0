const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const files = fs.readdirSync(path.resolve(__dirname));

const routes = {};
files.map(file => {
  routes[file.split('.')[0]] = require(path.resolve(__dirname, file))
})


module.exports = [
  {
    uri: '/list',
    method: 'get',
    callback: (req, res) => {
      res.response(200, _.keys(routes).map(key => {
        console.log(routes[key])
        routes[key].map(({uri, method, callback}) => ({uri, method}))
      }))
    }
  },
  {
    uri: '/total',
    method: 'get',
    callback: (req, res) => {
      res.send(200)
    }
  }
]

console.log(routes, '----')

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const files = fs.readdirSync(path.resolve(__dirname));

const routes = {};
files.map(file => {
  routes[file.split('.')[0]] = file
  return null;
})

function requireFile(file) {
  return require(path.resolve(__dirname, file))
}



module.exports = [
  {
    uri: '/list',
    method: 'get',
    callback: (req, res) => {
      console.log(res.response)
      req.response(200, _.keys(routes).map(key => {
        const file = requireFile(routes[key])
        return file.map(({uri, method, callback}) => ({uri, method}))
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

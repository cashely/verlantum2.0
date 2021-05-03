const path = require('path');
const fs = require('fs');
const _ = require('lodash');


module.exports = [
  {
    uri: '/wx',
    method: 'get',
    callback: (req, res) => {
      res.render('test');
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
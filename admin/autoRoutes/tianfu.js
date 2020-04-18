const models = require('../model.js');
module.exports = [
  {
    uri: '/create',
    method: 'get',
    mark: 'MIT基因分析与潜能优势',
    callback: (req, res) => {
      res.render('tianfu', { price: 4999, good: 'MIT基因分析与潜能优势'})
    }
  }
]

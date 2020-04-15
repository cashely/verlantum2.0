const models = require('../model.js');
module.exports = [
  {
    uri: '/create',
    method: 'get',
    mark: '冠状病毒抵抗能力检测表单页面',
    callback: (req, res) => {
      res.render('xinguan', { price: 399, good: '冠状病毒抵抗能力评估'})
    }
  }
]

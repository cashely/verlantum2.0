const models = require('../model.js');
module.exports = [
  {
    uri: '/sended',
    method: 'put',
    mark: '发货',
    callback: (req, res) => {
      const { id } = req.body;
      models.orders.updateOne({_id: id}, {sended: 1})
      .then(() => {
        req.response(200, 'ok')
      })
      .catch(err => {
        req.response(500, err)
      })
    }
  }
]

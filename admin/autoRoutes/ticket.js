/**
 * 发票
 */
 const models = require('../model.js');
 module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '查询发票列表',
    callback: (req, res) => {
      const conditions = { ...req.query };
      models.tickets.find(conditions).sort({ _id: -1 }).then(tickets => {
        req.response(200, tickets)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
 ];
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
      const { page = 1, pageSize = 20, ...conditions } = req.query;
      models.tickets.find(conditions).populate({ path: 'orderId', populate: { path: 'goodNumber' }}).sort({ _id: -1 }).skip((page - 1) * pageSize).limit(+pageSize).then(tickets => {
        req.response(200, tickets)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/apply/:orderId',
    method: 'get',
    callback(req, res) {
      const { orderId } = req.params;
      res.render('ticket', { orderId })
    }
  },
  {
    uri: '/list/count',
    method: 'get',
    mark: '统计发票数量',
    callback: (req, res) => {
      const conditions = { ...req.query };
      models.tickets.count(conditions).then(count => {
        req.response(200, count)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:_id',
    method: 'put',
    mark: '修改发票信息',
    async callback(req, res) {
      const { _id } = req.params;
      const params = req.body;
      try {
        await models.tickets.findOneAndUpdate({ _id }, params)
        req.response(200, 'ok')
      } catch (e) {
        req.response(500, e);
      }

    }
  }
 ];

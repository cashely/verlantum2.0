const models = require('../model.js');
module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '退款申请列表',
    callback: (req, res) => {
      const { page = 1, pageSize = 20 } = req.query;
      models.refunds.find().sort({ _id: -1 }).limit(+pageSize).skip((page - 1) * pageSize)
      .populate('orderId')
      .populate('goodNumber')
      .then(refunds => {
        req.response(200, refunds);
      })
      .catch(err => {
        console.log(err);
        req.response(500, err);
      })
    }
  },
  {
    uri: '/create',
    method: 'post',
    mark: '申请退款',
    async callback(req, res) {
      const { orderId } = req.body;

      const orderInfo = await models.orders.findOne({ _id: orderId });

      if (orderInfo.refund === 1) {
        res.response(200, {
          msg: '已申请退款，请耐心等待',
        }, 1);
        return;
      }
      if (!orderInfo.transactionId) {
        res.response(200, {
          msg: '2022年12月11日前的订单不支持退款',
        }, 1);
        return;
      }
      await models.orders.updateOne({ _id: orderId }, { refund: 1 });
      const { goodNumber } = orderInfo;
      try {
        await new models.refunds({
          orderId,
          goodNumber,
        }).save();
        req.response(200, '申请成功');
      } catch (err) {
        console.log(err, '申请退款失败');
        req.response(200, {
          msg: '申请失败',
        }, 1);
      }
    }
  },
  {
    uri: '/:id',
    method: 'put',
    mark: '修改退款信息',
    callback: (req, res) => {
      const { id } = req.params;
      const conditions = req.body;
      models.refunds.updateOne({ _id: id }, conditions)
      .then(() => {
        req.response(200, '退款成功')
      })
      .catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/count',
    method: 'get',
    mark: '退款申请Total',
    callback: (req, res) => {
      models.refunds.countDocuments()
      .then(refundCount => {
        req.response(200, refundCount)
      })
      .catch(err => {
        req.response(500, err)
      })
    }
  },
]

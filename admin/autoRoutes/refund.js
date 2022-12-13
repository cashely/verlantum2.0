const models = require('../model.js');
const moment = require('moment');
const excel = require('../functions/excel');

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
        req.response(200, {
          msg: '已申请退款，请耐心等待',
        }, 1);
        return;
      }
      if (!orderInfo.transactionId) {
        req.response(200, {
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
  {
    uri: '/excel/:filename',
    method: 'get',
    mark: '导出开票列表',
    excel(req, res) {
     let { date = [] } = req.query;
     if (typeof date === 'string') {
       date = JSON.parse(date);
     }

     let formatDate = date.map(item => {
       return moment(item).format();
     });
     let conditions = {};

     if(formatDate[0]) {
       conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
       if(formatDate[1]) {
         conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
       }
     }

     models.refunds.find(conditions).populate({ path: 'orderId', populate: { path: 'goodNumber' }}).sort({_id: -1}).then(tickets => {

       const data = [['商品名称', '订单编号', '交易号', '订单时间', '发货状态', '付款状态', '联系人', '联系方式', '是否处理成功', '申请时间']].concat(orders.map(order => ([
         tickets.orderId && tickets.orderId.goodNumber.title,
         tickets.orderId._id,
         tickets.orderId.orderNo,
         tickets.orderId.createdAt && moment(tickets.orderId.createdAt),
         tickets.orderId.sended === 1 ? '已发货' : '未发货',
         tickets.orderId.hasPayed === 1 ? '已付款' : '未付款',
         tickets.orderId.username,
         tickets.orderId.phone,
         tickets.success === 1 ? '是' : '否',
         moment(tickets.createdAt).format('YYYY-MM-DD HH:mm:ss'),
       ])))
       const downloadPath = excel(data, req);
       res.download(downloadPath);
     }).catch(err => {
       req.response(500, err);
     })
   },
]

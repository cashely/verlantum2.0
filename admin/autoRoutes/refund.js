const models = require('../model.js');
const moment = require('moment');
const excel = require('../functions/excel');

module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '退款申请列表',
    callback: (req, res) => {
      const { page = 1, pageSize = 20, date = [] } = req.query;
      let formatDate = date.map(item => {
        return moment(JSON.parse(item)).format();
      });
      let conditions = {};
      if(formatDate[0]) {
        conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
        if(formatDate[1]) {
          conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
        }
      }
      models.refunds.find(conditions).sort({ _id: -1 }).limit(+pageSize).skip((page - 1) * pageSize)
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
      const { success, isGet } = req.body;
      const conditions = req.body;
      models.refunds.findOneAndUpdate({ _id: id }, conditions)
      .then(async (refundInfo) => {
        // 如果操作退款成功, 更新订单退款信息
        if (+success === 1) {
          const { orderId, goodNumber } = refundInfo;
          const orderInfo = await models.orders.findOneAndUpdate({ _id: orderId }, { refund: 3 });
          // 需要同步更新库存
          const goodInfo = await models.goods.findOne({ _id: goodNumber });
          await models.goods.updateOne({ _id: goodNumber }, { $set: { stock: goodInfo.stock + orderInfo.count } });
        }
        
        if (+isGet === 1) {
          const { orderId } = refundInfo;
          await models.orders.updateOne({ _id: orderId }, { refund: 2 });
        }
        req.response(200, '修改成功')
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
      const { date = [] } = req.query;
      let formatDate = date.map(item => {
        return moment(JSON.parse(item)).format();
      });
      let conditions = {};
      if(formatDate[0]) {
        conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
        if(formatDate[1]) {
          conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
        }
      }
      models.refunds.countDocuments(conditions)
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
    callback(req, res) {
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

     models.refunds.find(conditions).populate({ path: 'orderId', populate: { path: 'goodNumber' }}).sort({_id: -1}).then(refunds => {

       const data = [['商品名称', '订单编号', '交易号', '订单时间', '发货状态', '付款状态', '联系人', '联系方式', '是否处理成功', '申请时间']].concat(refunds.map(refund => ([
         refund.orderId && refund.orderId.goodNumber.title,
         refund.orderId._id.toString(),
         refund.orderId.orderNo,
         refund.orderId.createdAt && moment(refund.orderId.createdAt).format('YYYY-MM-DD HH:mm'),
         refund.orderId.sended === 1 ? '已发货' : '未发货',
         refund.orderId.hasPayed === 1 ? '已付款' : '未付款',
         refund.orderId.username,
         refund.orderId.phone,
         refund.success === 1 ? '是' : '否',
         moment(refund.createdAt).format('YYYY-MM-DD HH:mm:ss'),
       ])))
       const downloadPath = excel(data, req);
       res.download(downloadPath);
     }).catch(err => {
      console.log(err)
       req.response(500, err);
     })
   },
  },
]

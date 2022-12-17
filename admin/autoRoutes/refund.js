const models = require('../model.js');
const moment = require('moment');
const excel = require('../functions/excel');
const { refundAction, decodeResource } = require('../functions/wxPayV3');
const wxrefund = require('../wxrefund.json');

wxrefund.map(async refund => {
  const orderInfo = await models.orders.findOne({ orderNo: refund['商户订单号'] });
  if (orderInfo.refund !== 3) {
    // consot = aorderInfo = await models.orders.findOne({ orderNo: refund['商户订单号'] })
    console.log(refund, orderInfo, '<--------没有找到订单');
  }
})


module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '退款申请列表',
    callback: async (req, res) => {
      const { page = 1, pageSize = 20, date = [], isGet, success, orderId, orderNo } = req.query;
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
      if ([0, 1].includes(+isGet)) {
        conditions.isGet = isGet;
      }
      if ([0, 1].includes(+success)) {
        conditions.success = success;
      }
      if (orderId) {
        conditions.orderId = orderId;
      }

      if (orderNo) {
        const orderInfo = await models.orders.findOne({ orderNo });
        conditions.orderId = orderInfo._id;
      }
      console.log(conditions, '---')
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
    callback: async (req, res) => {
      const { id } = req.params;
      const { success, isGet } = req.body;
      const conditions = req.body;

      const refundInfo = await models.refunds.findOne({ _id: id }).populate('orderId');

      // 如果操作退款成功, 更新订单退款信息
      if (+success === 3) {
        const { orderId } = refundInfo;
        const orderInfo = await models.orders.findOne({ _id: orderId });
        const { goodNumber, payTotal, transactionId, orderNo } = orderInfo;
        // 调用微信的退单流程
        const result = await refundAction({
          transactionId,
          outRefundNo: orderNo,
          amount: payTotal,
        });

        console.log(result, '<----微信退款信息');

        if (result.status !== 200) {
          return res.response(200, { msg: '微信退款失败' }, 1);
        }

        const wxrefundData = JSON.parse(result.data);

        if (wxrefundData.status !== 'PROCESSING') {
          return res.response(200, { msg: wxrefundData.status }, 1);
        }

        // 更新订单的退款状态为待微信商户处理
        await models.orders.findOne({ _id: orderId }, { refund: 4 });
        
      }
      
      try {
        const refundInfo = await models.refunds.findOneAndUpdate({ _id: id }, conditions).populate('orderId');
        if (+isGet === 1) {
          const { orderId } = refundInfo;
          await models.orders.updateOne({ _id: orderId }, { refund: 2 });
        }
        req.response(200, '修改成功')
      } catch (err) {
        req.response(500, err);
      }
    }
  },
  {
    uri: '/count',
    method: 'get',
    mark: '退款申请Total',
    callback: async (req, res) => {
      const { date = [], isGet, success, orderId, orderNo } = req.query;
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
			if ([0, 1].includes(+isGet)) {
				conditions.isGet = isGet;
			}
			if ([0, 1].includes(+success)) {
				conditions.success = success;
			}
			if (orderId) {
				conditions.orderId = orderId;
			}
      if (orderNo) {
        const orderInfo = await models.orders.findOne({ orderNo });
        conditions.orderId = orderInfo._id;
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
    async callback(req, res) {
     let { date = [], isGet, success, orderId, orderNo } = req.query;
     if (typeof date === 'string') {
       date = JSON.parse(date);
     }
		 orderId = JSON.parse(orderId);

     orderNo = JSON.parse(orderNo);

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
      
     if ([0, 1].includes(isGet)) {
       conditions.isGet = isGet;
	   }
	   if ([0, 1].includes(success)) {
	     conditions.success = success;
	   }
	   if (orderId) {
	     conditions.orderId = orderId;
	   }

     if (orderNo) {
      const orderInfo = await models.orders.findOne({ orderNo });
      conditions.orderId = orderInfo._id;
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
  {
  	uri: '/notify',
  	method: 'post',
  	mark: '微信退款结果通知',
  	async callback(req, res) {

  		// 把订单退回到未退款的状态
  		async function handleBack(orderNo) {
  			const orderInfo = await models.orders.findOneAndUpdate({ orderNo }, { refund: 2 });
  			const { _id } = orderInfo;
  			await models.refunds.updateOne({ orderId: _id }, { success: 0 });
  		}

  		// 把订单修改为已退款
  		async function handleSuccess(orderNo) {
  			const orderInfo = await models.orders.findOneAndUpdate({ orderNo }, { refund: 3 });
  			const { _id, goodNumber } = orderInfo;
  			await models.refunds.updateOne({ orderId: _id }, { success: 1 });
  			await models.goods.updateOne({ _id: goodNumber }, { $set: { stock: goodInfo.stock + orderInfo.count } });
  		}

  		const result = decodeResource(req.body);
  		console.log(result, '<-------微信退款返回的结果');
  		const { out_trade_no, refund_status } = result;
  		if (refund_status === 'SUCCESS') {
  			const orderInfo = await models.orders.findOne({ orderNo: out_trade_no });
  			const { _id, refund } = orderInfo;

  			if (refund === 3) { // 已支付不需要在处理了
  				res.json({
  					code: 'SUCCESS',
  					message: '已经退款过了'
  				});
  				return;
  			}

  			if (refund === 2) {
  				await handleSuccess(out_trade_no);
  				res.json({
  					code: 'SUCCESS',
  					message: '接收退款通知成功'
  				})
  			}

  		} else {
  			// 微信错误
  			await handleBack(out_trade_no);
  			console.log('<-------微信退款返回的结果错误');
  			res.json({
  				code: 'ERROR',
  				message: '状态错误'
  			});
  		}
  	}
  }
]

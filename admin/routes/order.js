const models = require('../model.js');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const excel = require('../functions/excel');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [], sended, hasPayed, openid, orderNo, refund } = req.query;
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
    if (+sended === 1 || +sended === 0) {
      conditions.sended = sended;
    }
    if (+hasPayed === 1 || +hasPayed === 0) {
      conditions.hasPayed = hasPayed;
    }
    if (openid) {
      conditions.openid = openid;
    }
    if (orderNo) {
      conditions.orderNo = orderNo;
    }
    if (+refund === 0) {
      conditions.refund = 0
    }
    if (+refund === 1) {
      conditions.refund = { $in: [1,2,3,4] }
    }
    console.log(conditions, typeof sended, hasPayed, '---')
    models.orders.find(conditions).populate('agent').populate('puller').populate('goodNumber').sort({_id: -1}).skip((+page - 1) * limit).limit(+limit).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {

    let {price, payTotal, agent, agentProfit, hasPayed = 0, mark, good, address, card, phone, count = 1, username} = req.body;
    const paymentAmount = price * count;
    let conditions = {
      payTotal,
      agent,
      price,
      agentProfit,
      hasPayed,
      mark,
      card,
      phone,
      good,
      address,
      count,
      paymentAmount,
      username,
    };
    new models.orders(conditions).save().then(order => {
      req.response(200, order);
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  delete(req, res) {
    const {id} = req.params;
    models.orders.deleteOne({_id: id}).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  async update(req, res) {
    const { id } = req.params;
    const { _id, ...otherInfo } = req.body;
    try {
      await models.orders.findByIdAndUpdate(id, otherInfo);
      req.response(200, 'ok');
    } catch (err) {
      req.response(500, err);
    }
  },
  pay(req, res) {
    const { id}  = req.params;
    models.orders.findById(id).then(order => {
      const conditions = {
        hasPayed: 1,
        payTotal: order.paymentAmount
      }
      return models.orders.updateOne({_id: id}, conditions).then(() => order )
    }).then(order => {
      if(order.agent) {
        return models.agents.findOne({_id: order.agent}).then(agent => {
          return models.agents.updateOne({_id: agent._id}, {$inc: {score: order.paymentAmount * agent.ratio / 100}})
        })
      } else {
        return null
      }
    }).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  detail(req, res) {
    const { id } = req.params;
    models.orders.findOne({_id: id}).then(order => {
      req.response(200, order);
    })
  },
  total(req, res) {
    const { q = {}, date = [], sended, hasPayed, openid, orderNo, refund } = req.query;
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
    if (+sended === 1 || +sended === 0) {
      conditions.sended = sended;
    }
    if (+hasPayed === 1 || +hasPayed === 0) {
      conditions.hasPayed = hasPayed;
    }
    
    if (+refund === 0) {
      conditions.refund = 0;
    }
    
    if (+refund === 1) {
      conditions.refund = { $in: [1, 2, 3, 4] }
    }

    if (openid) {
      conditions.openid = openid;
    }
    
    if (orderNo) {
      conditions.orderNo = orderNo;
    }

    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.orders.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  },
  excel(req, res) {
    let { date = [], sended, hasPayed, openid, orderNo, refund } = req.query;
    if (typeof date === 'string') {
      date = JSON.parse(date);
    }
    
    
    
    openid = JSON.parse(openid);
    
    orderNo = JSON.parse(orderNo);
    
    refund = JSON.parse(refund);

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
    if (+sended === 1 || +sended === 0) {
      conditions.sended = sended;
    }
    if (+hasPayed === 1 || +hasPayed === 0) {
      conditions.hasPayed = hasPayed;
    }
    
    if (+refund === 0) {
      conditions.refund = 0
    }
    
    if (+refund === 1) {
      conditions.refund = { $in: [1, 2, 3, 4] }
    }
    
    if (orderNo) {
      conditions.orderNo = orderNo;
    }
    
    if (openid) {
      conditions.openid = openid;
    }
    
    models.orders.find(conditions).populate('agent').populate('puller').populate('goodNumber').sort({_id: -1}).then(orders => {
      // req.response(200, orders)

      const data = [['商品名称', '订单号', '包装编号', '数量', '单价', '总计', '已付金额（元）', '付款方式（元）', '是否付款', '退款情况', '用户姓名', '联系方式', '联系地址', '是否发货', '代理商', '下单时间']].concat(orders.map(order => ([
        order.goodNumber && order.goodNumber.title, order.orderNo,
        order.boxNumber,
        order.count,
        order.price,
        order.paymentAmount,
        order.payTotal,
        order.payChannel === 1 ? '微信' : (order.payChannel === 2 ? '支付宝' : '线下'),
        order.hasPayed === 0 ? '否' : '是',
        (() => {
          switch (order.refund) {
            case 1 : return '已申请';
            case 2 : return '已受理';
            case 3 : return '已退款';
            case 4 : return '微信商户处理中';
            default : return ''
          }
        })(),
        order.username,
        order.phone,
        order.address,
        order.sended === 1 ? '是' : '否',
        order.agent && order.agent.concat,
        moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      ])))
      const downloadPath = excel(data, req);
      res.download(downloadPath);
    }).catch(err => {
      req.response(500, err);
    })
  }
}

const models = require('../model.js');
const request = require('request');
const qs = require('qs');
const moment = require('moment');
const singFn = require('../functions/signHelper');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
const wxpay = require('../functions/wxpay');
const sendTemplateMessage = require('../functions/sendTemplateMessage');
const { order, paysignjsapifinal, decodeResource } = require('../functions/wxPayV3');
const generatorOrder = require('../functions/generatorOrder');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const conditions = {}
    models.agents.find(conditions).populate('creater good').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(agents => {
      req.response(200, agents)
    }).catch(err => {
      req.response(500, err);
    })
  },
  // 查找同一个机构的代理商
  async sameAgent(req, res) {
    const { id } = req.params;
    const findCurrentAgent = await models.agents.findById(id);
    const { title } = findCurrentAgent;
    const sameTitleAgents = await models.agents.find({ title });
    req.response(200, sameTitleAgents);
  },
  add(req, res) {
    const {title, statu, contact, address, tel, price = 0, ratio = 0, good, discount, num} = req.body;
    const conditions = {
      title,
      statu,
      good,
      contact, address, tel,
      price,
      ratio,
      discount,
      creater: req.user.uid,
      num,
    };
    new models.agents(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.agents.findById(id).then(puller => {
      req.response(200, puller);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params;
    models.agents.deleteOne({_id: id}).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params;
    const {title, statu, contact, address, tel, price, ratio, good, discount} = req.body;
    const conditions = {
      title,
      statu,
      price,
      ratio,
      good,
      discount,
      contact, address, tel,
      creater: req.user.uid
    };
    if (!discount) {
      conditions.discount = undefined
    }
    models.agents.findOneAndUpdate({_id: id}, conditions).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  total(req, res) {
    const q = req.query;
    let conditions = {};
    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.agents.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  },
  qrcode(req, res) {
    res.render('qrcode', req.query);
  },
  qrRedirect(req, res) {
    const {aid, price, ratio, good, address, phone, card, count = 1, username, goodNumber} = req.query;
    generatorOrder({aid, price, ratio, good, address, card, count, phone, username, goodId: goodNumber})
    .then(orderNo => {
      // res.send(orderNo)
      res.render('qredirect', {orderNo});
      // res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn(good, orderNo, price))
    });
  },
  alipay(req, res) {
    const { orderNo } = req.query;
    models.orders.findOne({ orderNo}).then(order => {
      const { good, paymentAmount} = order;
      res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn(good, orderNo, paymentAmount))
    })
  },
  alipaycallback(req, res) {
    const {out_trade_no, total_amount} = req.body;
    models.orders.updateOne({orderNo: out_trade_no}, {hasPayed: 1, payTotal: total_amount * 1, payChannel: 2,}).then(() => {
      return models.orders.findOne({orderNo: out_trade_no})
    }).then(order => {
      if(order.agent) {
        return models.agents.findOne({_id: order.agent}).then(agent => {
          return models.agents.updateOne({_id: agent._id}, {$inc: {score: order.paymentAmount * agent.ratio / 100}})
        })
        // return models.agents.updateOne({_id: order.agent}, {$inc: {score: order.paymentAmount * order.agentProfit / 100}})
      }
      return null
    }).then(() => {
      res.send('ok')
    }).catch(err => {
      res.send('failed')
    })

  },
  wxpay(req, res) {
    let {params, code} = req.query;
    console.log(params)
    // params = Buffer.from(params, 'base64').toString();
    const { orderNo, to } = JSON.parse(params);
    // console.log(orderNo, to, 'jhjhjhjhj');
    getOpenIdAction(code).then(openid => {
      models.orders.findOne({ orderNo}).populate('goodNumber')
      .then(order => {
        // console.log(order, '订单')
        const { paymentAmount, goodNumber: { title } } = order;
        return generatorWxpay({
          orderNo,
          openid,
          paymentAmount,
          body: title,
          res,
          order,
          to
        })
      })
    });
  },
  async wxpaycallback(req, res) {
    // {
    //   0|云量后台  |   mchid: '1472079802',
    //   0|云量后台  |   appid: 'wx9753ba7c20ea36b2',
    //   0|云量后台  |   out_trade_no: '1628270305123',
    //   0|云量后台  |   transaction_id: '4200001229202108071954591656',
    //   0|云量后台  |   trade_type: 'JSAPI',
    //   0|云量后台  |   trade_state: 'SUCCESS',
    //   0|云量后台  |   trade_state_desc: '支付成功',
    //   0|云量后台  |   bank_type: 'OTHERS',
    //   0|云量后台  |   attach: '',
    //   0|云量后台  |   success_time: '2021-08-07T01:18:35+08:00',
    //   0|云量后台  |   payer: { openid: 'ot6_41JDOuSFk0LB1qL0G_wIQ9ZE' },
    //   0|云量后台  |   amount: { total: 1, payer_total: 1, currency: 'CNY', payer_currency: 'CNY' }
    //   0|云量后台  | }
    // console.log(req.body, '微信支付返回的请求主体');
    const result = decodeResource(req.body);
    // console.log(result, 'wxpay-v3解密的主体信息')
    if (result) {
      const {out_trade_no, transaction_id, amount: { total }} = result;

      const orderInfo = await models.orders.findOne({ orderNo: out_trade_no });

      if (orderInfo.hasPayed === 1) {
        res.json({   
          code: "SUCCESS",
          message: "已经付款过的单子了!",
        });
        return;
      }
      return models.orders.findOneAndUpdate({ orderNo: out_trade_no }, {hasPayed: 1, payTotal: total / 100 * 1, payChannel: 1, transactionId: transaction_id}).then(async ({ count, goodNumber }) => {
        try {
          // 扣减库存
          const { stock } = await models.goods.findOne({ _id: goodNumber });
          await models.goods.findOneAndUpdate({ _id: goodNumber }, { stock: stock - count });
          res.json({   
            code: "SUCCESS",
            message: "成功"
          });
        } catch (err) {
          console.log(err, '付款成功但扣减库存失败');
          res.json({   
            "code": "FAIL",
            "message": "失败"
          });
          return;
        }
        // 发送订单消息
        // const orderInfo = await models.orders.find({ orderNo: out_trade_no }).populate('goodNumber');
        // const { paymentAmount, address, goodNumber: { } } = orderInfo;
        // const messageData = {
        //   template_id: 'l2p5BPpW5SKE2n-Junt3QL82i1_4C_nt6HPpVKs9bkY',
        //   url: `https://api.verlantum.cn/uploads/${reportPath}`,
        //   data: {
        //     first: {
        //       value: '尊敬的用户，您的检测报告已生成',
        //     },
        //     keyword1: {
        //       value: botNumber
        //     },
        //     keyword2: {
        //       value: uname,
        //     },
        //     remark: {
        //       value: '点击详情打开报告',
        //     }
        //   }
        // };
        // const msg = await sendTemplateMessage(openid, messageData);
      }).catch(err => {
        res.json({   
          "code": "FAIL",
          "message": "失败"
        })
      })
    }else {
      res.json({   
        "code": "SUCCESS",
        "message": "成功"
    });
    }
  },
  take(req, res) {
    const {id} = req.params;
    const {money} = req.body;
    models.agents.updateOne({_id: id}, {$inc: {score: money * -1}}).then(agent => {
      console.log(id)
      return new models.takes({agent: id, score: money, creater: req.user.uid}).save()
    }).then(res => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err);
      req.response(500, err);
    })
  }
}

const getOpenIdAction = (code) => {
  return new Promise((resolve, reject) => {
    request({url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxAppId}&secret=${wxAppSecret}&code=${code}&grant_type=authorization_code`,method:'GET'},function(err,response,body){
      if(!err && response.statusCode === 200){
        const response = JSON.parse(body)
          resolve(response.openid)
      }else {
        console.log(err)
        reject(err)
      }
    })
  })
}

const generatorWxpay = ({ orderNo, paymentAmount, body,openid, res, to }) => {
  return new Promise(async (resolve) => {
    const result = await order({
      description: body,
      total: wxpay.getmoney(paymentAmount),
      openid,
      orderNo,
    });
    // 统计用户当天下单的数量是否已经超过2个
    const today = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    const todayEnd = moment(Date.now()).format('YYYY-MM-DD 23:59:59');
    const userTodayOrders = await models.orders.find({
      openid,
      hasPayed: 1,
      createdAt: {
        $gte: new Date(today),
        $lte: new Date(todayEnd),
      },
    });
    const userTodayGoodNumber = userTodayOrders.map(v => v.count).reduce((a, b) => a + b, 0);
    console.log(userTodayGoodNumber, '----------<<<<<')
    if (userTodayGoodNumber > 2) {
      res.render('pay-error',{ err: '当天下单的数量已经超过限制' });
      return;
    }

    let noncestr = wxpay.createNonceStr();
    let timestamp = wxpay.createTimeStamp();
    const { prepay_id } = result;
    const finalsign = paysignjsapifinal({
      appid: wxAppId,
      mch_id: wxMchId,
      pkg: `prepay_id=${prepay_id}`,
      noncestr,
      timestamp,
      mchkey: '773ADDFE99B6749A16D6B9E266F8A20A',
    })
    res.render('frontwxpay',{'appId':wxAppId, 'prepayId':prepay_id,'nonceStr':noncestr,'timeStamp':timestamp,'package':'Sign=WXPay', signType: 'RSA', 'sign':finalsign, to, err: '' });

  })
}

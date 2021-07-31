const models = require('../model.js');
const request = require('request');
const singFn = require('../functions/signHelper');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
const wxpay = require('../functions/wxpay');
const { order, paysignjsapifinal } = require('../functions/wxPayV3');
console.log(wxpay)
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
  add(req, res) {
    const {title, statu, contact, address, tel, price = 0, ratio = 0, good, discount} = req.body;
    const conditions = {
      title,
      statu,
      good,
      contact, address, tel,
      price,
      ratio,
      discount,
      creater: req.user.uid
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
    generatorOrderAction({aid, price, ratio, good, address, card, count, phone, username, goodId: goodNumber})
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
    let {orderNo, code} = req.query;
    // params = Buffer.from(params, 'base64').toString();
    // const {aid, price, ratio, good = '天赋基因检测'} = qs.parse(params);

    getOpenIdAction(code).then(body => {
      // console.log(body, typeof body, '----code body');
      const openid = body.openid;
      models.orders.findOne({ orderNo}).populate('goodNumber')
      .then(order => {
        const { paymentAmount, good, goodNumber } = order;
        return generatorWxpay({
          orderNo,
          openid,
          paymentAmount,
          body: good,
          res,
          order
        })
      })
    });
  },
  wxpaycallback(req, res) {
    const {return_code} = req.body.xml;
    if (return_code === 'SUCCESS') {
      const {out_trade_no, cash_fee} = req.body.xml;
      models.orders.updateOne({orderNo: out_trade_no}, {hasPayed: 1, payTotal: cash_fee / 100 * 1, payChannel: 1,}).then(() => {
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
        console.log(err)
        res.send('failed')
      })
    }else {
      res.send('failed');
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

const generatorOrderAction = ({aid, price, ratio, good, address, phone, card, count = 1, username, goodId}) => {
  const orderNo = Date.now();
  const paymentAmount = count * price;
  const order = {
    price,
    paymentAmount,
    agentProfit: ratio,
    good,
    count,
    address,
    phone,
    card,
    username,
    orderNo,
    goodNumber: goodId,
  }
  if (aid) {
    order.agent = aid
  }
  return new models.orders(order).save().then(() => orderNo)
}



const getOpenIdAction = (code) => {
  return new Promise((resolve, reject) => {
    request({url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxAppId}&secret=${wxAppSecret}&code=${code}&grant_type=authorization_code`,method:'GET'},function(err,response,body){
      if(!err && response.statusCode == 200){
          resolve(JSON.parse(body))
      }else {
        console.log(err)
        reject(err)
      }
    })
  })
}

const generatorWxpay = ({orderNo, paymentAmount, body,openid, res, order}) => {
  return new Promise( async (resolve) => {
    const result = await order({
      description: '',
      total: wxpay.getmoney(paymentAmount),
      openid,
      orderNo,
    })
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
    res.render('frontwxpay',{'appId':wxAppId, 'prepayId':prepay_id,'nonceStr':noncestr,'timeStamp':timestamp,'package':'Sign=WXPay', signType: 'RSA', 'sign':finalsign});

  })
}

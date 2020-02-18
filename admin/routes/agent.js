const models = require('../model.js');
const singFn = require('../functions/signHelper');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const conditions = {}
    models.agents.find(conditions).populate('creater').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(agents => {
      req.response(200, agents)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, statu, contact, address, tel, price = 0, ratio = 0} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      price,
      ratio,
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
    const {id} = req.params.id;
    models.agents.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params;
    const {title, statu, contact, address, tel, price, ratio} = req.body;
    const conditions = {
      title,
      statu,
      price,
      ratio,
      contact, address, tel,
      creater: req.user.uid
    };
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
    const {aid, price, ratio} = req.query;
    res.render('qrcode', req.query);
  },
  qrRedirect(req, res) {
    res.render('qredirect', req.query);
  },
  alipay(req, res) {
    const {aid, price, ratio} = req.query;
    generatorOrderAction({aid, price, ratio, payChannel: 2})
    .then(orderNo => {
      res.send(orderNo)
      // res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn('云量科技', orderNo, price))
    });
  },
  alipaycallback(req, res) {
    console.log(req.body)
  },
  wxpay(req, res) {
    const {aid, price, ratio} = req.query;
    generatorOrderAction({aid, price, ratio, payChannel: 1})
    .then(orderNo => {
      res.send(orderNo)
      // res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn('云量科技', orderNo, price))
    });
    // res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn('云量科技', '21111', '0.01'))
  },
  wxpaycallback(req, res) {
    console.log(req.body)
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

const generatorOrderAction = ({aid, price, ratio, payChannel}) => {
  const orderNo = Date.now();
  return new models.orders({
    price,
    payChannel,
    agent: aid,
    agentProfit: ratio,
    orderNo
  }).save().then(() => orderNo)
}

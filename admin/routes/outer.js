const models = require('../model.js');
const _ = require('lodash');
const moment = require('moment');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = { type: 2 };
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: moment(formatDate[1]).add(1, 'days').format('YYYY-MM-DD')}
      }
    }
    const orders = models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').sort({_id: -1}).skip((+page - 1) * limit).limit(+limit).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  add(req, res) {
    let {fruit, pusher, price, payStatu, count, payNumber, outerUnit, outerCount, avgPrice, reserve = 0} = req.body;
    // if(!avgPrice) {
    //   avgPrice = price;
    // }
    // avgPrice = (+avgPrice + +price) / 2; // 计算平均价格
    let conditions = {
      type: 2,
      fruit,
      pusher,
      price,
      count,
      avgPrice,
      reserve,
      creater: req.user.uid
    };
    const $payTotal = price * count; // 应付款项
    if(payStatu === 2) {
      payNumber = $payTotal
    }else if(+payNumber === $payTotal) {
      payStatu = 2
    }
    conditions.payStatu = payStatu;
    conditions.payNumber = payNumber;
    conditions.payTotal = $payTotal;
    if(outerUnit) {
      conditions.outerUnit = outerUnit
    }
    if(outerCount) {
      conditions.outerCount = outerCount
    }
    new models.orders(conditions).save().then(() => {
      const saveCountPromise = models.fruits.updateOne({_id: fruit}, {$inc: {total: count * -1}, outerPrice: price})
      saveCountPromise.then(() => {
        req.response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.orders.findById(id).then(order => {
      req.response(200, order);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.orders.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params.id;
    const {pusher, price, payStatu, reserve} = req.body;
    const conditions = {
      title,
      unit,
      reserve,
      creater: req.user.uid
    };
    models.orders.updateOne({_id: id}, conditions).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  total(req, res) {
    const { page = 1, limit = 20, date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = { type: 2 };
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
    }
    if(formatDate[1]) {
      conditions.createdAt = { $lte: formatDate[1]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: formatDate[1]}
      }
    }
    models.orders.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  },
  //今日出库数量
  today(req, res) {
    const conditions = {}
    conditions.type = 2;
    conditions.createdAt = {
      $gte: moment().format('YYYY-MM-DD')
    }
    models.orders.find(conditions).then(outers => {
      req.response(200, outers);
    }).catch(error => {
      console.log(error);
      req.response(500, error);
    })
  },
  //昨日出库数量
  yesterday() {
    const conditions = {}
    conditions.type = 2;
    conditions.createdAt = {
      $gte: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      $lt: moment().format('YYYY-MM-DD'),
    }
    models.orders.find(conditions).then(outers => {
      req.response(200, outers);
    }).catch(error => {
      console.log(error);
      req.response(500, error);
    })
  }
}

const models = require('../model.js');
const moment = require('moment');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [] } = req.query;
    const conditions = {}
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: moment(formatDate[1]).add(1, 'days').format('YYYY-MM-DD')}
      }
    }
    models.costsDetail.find(conditions).populate('title').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(costsDetail => {
      req.response(200, costsDetail)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, count} = req.body;
    const conditions = {
      title,
      count: +count
    };
    new models.costsDetail(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.costsDetail.findById(id).then(costDetail => {
      req.response(200, costDetail);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.costsDetail.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params;
    const {title, count,} = req.body;
    const conditions = {
      title,
      count: +count
    };
    models.costsDetail.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.costsDetail.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}

const models = require('../model.js');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const conditions = {}
    models.pullers.find(conditions).populate('creater').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(pullers => {
      req.response(200, pullers)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, statu, contact, address, tel} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      creater: req.user.uid
    };
    new models.pullers(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.pullers.findById(id).then(puller => {
      req.response(200, puller);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.pullers.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params.id;
    const {title, statu, contact, address, tel,} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      creater: req.user.uid
    };
    models.pullers.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.pullers.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}

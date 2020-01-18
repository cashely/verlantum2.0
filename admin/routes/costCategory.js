const models = require('../model.js');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const conditions = {}
    models.costsCategory.find(conditions).populate('creater').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(costsCategory => {
      req.response(200, costsCategory)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title} = req.body;
    const conditions = {
      title,
      creater: req.user.uid
    };
    new models.costsCategory(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.costsCategory.findById(id).then(costCategory => {
      req.response(200, costCategory);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.costsCategory.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params.id;
    const {title} = req.body;
    const conditions = {
      title,
    };
    models.costsCategory.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.costsCategory.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}

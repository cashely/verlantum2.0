const models = require('../model.js');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    console.log(req.user, 'user', req.logOut)
    const conditions = {}
    models.fruits.find(conditions).populate('creater').skip((+page - 1) * limit).limit(+limit).then(fruits => {
      req.response(200, fruits)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, unit, warn, min, total = 0} = req.body;
    const conditions = {
      title,
      unit,
      total: +total,
      warn, min,
      creater: req.user.uid
    };
    new models.fruits(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.fruits.findById(id).then(fruit => {
      req.response(200, fruit);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params;
    models.fruits.deleteOne({_id: id}).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  update(req, res) {
    const id = req.params.id;
    const {title, unit, warn, min, total = 0} = req.body;
    const conditions = {
      title,
      unit,
      warn,
      total: +total,
      min: +min,
      creater: req.user.uid
    };
    console.log(conditions, id)
    models.fruits.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.fruits.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}

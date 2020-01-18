const models = require('../model.js');
module.exports = {
  list(req, res) {
    const conditions = {}
    models.counts.find(conditions).populate('creater').then(fruits => {
      req.response(200, fruits)
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
    new models.counts(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const fruit = req.params.fruit;
    models.counts.findOne({fruit}).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error);
    })
  }
}

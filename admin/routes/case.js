const models = require('../model.js');
const {response} = require('../functions/helper.js');
const mongoose = require('mongoose');
module.exports = {
  add(req, res, next) {
    const q = req.body;
    const conditions = {
      creater: mongoose.Types.ObjectId('5dc6c9cb08e89cae34c64db7')
    };
    if(q.title) {
      conditions.title = q.title
    }
    if(q.group) {
      conditions.group = q.group
    }
    if(q.tester) {
      conditions.tester = q.tester
    }
    if(q.developer) {
      conditions.developer = q.developer
    }
    if(q.mark) {
      conditions.mark = q.mark
    }
    new models.cases(conditions).save().then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  update(req, res) {
    const q = req.body;
    const id = req.params.id;
    const conditions = {};
    if(q.title) {
      conditions.title = q.title
    }
    if(typeof(q.test) === 'number') {
      conditions.test = Boolean(q.test)
    }
    if(typeof(q.develop) === 'number') {
      conditions.develop = Boolean(q.develop)
    }
    if(q.tester) {
      conditions.tester = q.tester
    }
    if(q.developer) {
      conditions.developer = q.developer
    }
    if(q.mark) {
      conditions.mark = q.mark
    }
    models.cases.updateOne({_id: id}, conditions).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  delete(req, res) {
    const id = req.params.id;
    models.cases.deleteOne({_id: id}).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  detail(req, res) {
    const id = req.params.id;
    models.cases.findById(id).populate('creater').then(group => {
      response(200, group, res);
    }).catch(e => {
      response(500, e, res);
    })
  },
  list(req, res) {
    const group = req.query.group;
    models.cases.find({group}).populate({path: 'developer'}).populate({path: 'creater'}).populate({path: 'tester'}).populate({path: 'group'}).then(cases => {
      response(200, cases, res)
    }).catch(e => {
      console.log(e);
      response(500, e, res)
    })
  },

  total(req, res) {
    const group = req.query.group;
    models.cases.countDocuments({group}).then(count => {
      response(200, count, res);
    }).catch(e => {
      response(500, e, res);
    })
  }
}

const models = require('../model.js');
const {response} = require('../functions/helper.js');
const mongoose = require('mongoose');
const _ = require('lodash');
module.exports = {
  add(req, res, next) {
    const q = req.body;
    const conditions = {
      creater: mongoose.Types.ObjectId('5dc6c9cb08e89cae34c64db7')
    };
    if(q.title) {
      conditions.title = q.title
    }
    if(q.mark) {
      conditions.mark = q.mark
    }
    if(q.system) {
      conditions.system = q.system
    }
    new models.groups(conditions).save().then(() => {
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
    models.groups.update({_id: id}, conditions).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  delete(req, res) {
    const id = req.params.id;
    models.groups.deleteById(id).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  detail(req, res) {
    const id = req.params.id;
    models.groups.findById(id).populate('creater').then(group => {
      response(200, group, res);
    }).catch(e => {
      response(500, e, res);
    })
  },
  list(req, res) {
    models.groups.find().populate('creater').then(groups => {
      response(200, groups, res)
    }).catch(e => {
      console.log(e);
      response(500, e, res)
    })
  },

  total(req, res) {
    models.groups.countDocuments().then(count => {
      response(200, count, res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  count(req, res) {
    // console.log(typeof req.query.ids, 'group')
    const ids = req.query.ids.map(id => mongoose.Types.ObjectId(id));

    models.cases.aggregate([
      {
        $match: {
          group: {$in: ids}
        }
      }
    ]).then(groups => {
      groups = _.mapValues(_.groupBy(groups, 'group'), items => ({success: _.sumBy(items, o => o.test && o.develop), failed: _.sumBy(items, o => (!o.test || !o.develop)) }));
      response(200, groups, res);
    }).catch(e => {
      console.log(e)
      response(500, e, res);
    })
  }
}

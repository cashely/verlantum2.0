const models = require('../model.js');
const {response} = require('../functions/helper.js');
const mongoose = require('mongoose');
module.exports = {
  add(req, res, next) {
    const q = req.body;
    const conditions = {
      case: q.case
    };
    if(q.nodes) {
      conditions.nodes = q.nodes;
    } else {
      conditions.nodes = [{title: "测试1"}, {title: '测试2'}];
    }
    new models.nodes(conditions).save().then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      console.log(e)
      response(500, e, res);
    })
  },

  update(req, res) {
    const q = req.body;
    const id = req.params.id;
    const conditions = {};
    if(q.nodes) {
      conditions.nodes = q.nodes
    }
    models.nodes.update({_id: id}, conditions).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  delete(req, res) {
    const id = req.params.id;
    models.nodes.deleteById(id).then(() => {
      response(200, 'ok', res);
    }).catch(e => {
      response(500, e, res);
    })
  },

  detail(req, res) {
    const id = req.params.id;
    models.nodes.findOne({case: id}).populate('creater').then(group => {
      response(200, group, res);
    }).catch(e => {
      response(500, e, res);
    })
  },
  list(req, res) {
    models.nodes.find().populate({path: 'developer'}).populate({path: 'creater'}).populate({path: 'group'}).then(nodes => {
      response(200, nodes, res)
    }).catch(e => {
      console.log(e);
      response(500, e, res)
    })
  },

  total(req, res) {
    models.nodes.countDocuments().then(count => {
      response(200, count, res);
    }).catch(e => {
      response(500, e, res);
    })
  }
}

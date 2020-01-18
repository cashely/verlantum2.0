const models = require('../model.js');
const {response} = require('../functions/helper.js');
const {getSha1} = require('../functions/helper.js');
module.exports = {
  list(req, res, next) {
    const { page = 1, limit = 20 } = req.query;
    const q = req.query;
    let conditions = {};
    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.users.find(conditions).limit(limit).sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit)
    .then(users => {
      response(200, users, res)
    }).catch(error => {
      response(500, error, res)
    })
  },
  total(req, res, next) {
    const q = req.query;
    let conditions = {};
    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.users.countDocuments(conditions).then(count => {
      response(200, count, res);
    }).catch(error => {
      response(500, error, res)
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.users.findById(id).then(user => {
      response(200, user, res);
    }).catch(error => {
      response(500, error, res);
    })
  },
  add(req, res, next) {
    const q= req.body;
    let conditions = {};
    if(q.acount) {
      conditions.acount = q.acount;
    }
    if(q.password) {
      conditions.password = getSha1(q.password);
    }
    if(q.mark) {
      conditions.mark = q.mark;
    }
    if(q.statu) {
      conditions.statu = q.statu;
    }
    if(q.role) {
      conditions.role = q.role;
    }
    new models.users(conditions).save().then(() => {
      response(200, 'ok', res);
    }).catch(error => {
      console.log(error)
      response(500, error, res);
    })
  },
  update(req, res, next) {
    const id = req.params.id;
    const q = req.body;
    let conditions = {};
    if(q.acount) {
      conditions.acount = q.acount;
    }
    if(q.password) {
      conditions.password = getSha1(q.password);
    }
    if(q.email) {
      conditions.email = q.email;
    }
    if(q.mark) {
      conditions.mark = q.mark;
    }
    if(q.role) {
      conditions.role = q.role;
    }
    if(q.statu) {
      conditions.statu = q.statu;
    }
    models.users.update({_id: id}, conditions).then(() => {
      response(200, 'ok', res);
    }).catch(error => {
      response(500, error, res);
    })
  },
  delete(req, res, next) {
    const id = req.params.id;
    models.users.deleteOne({
      _id: id
    }).then(() => {
      response(200, 'ok', res);
    }).catch(error => {
      response(500, error, res);
    })
  },
  me(req, res, next) {
    models.users.findById(req.user.uid).select('-password').then(user => {
      req.response(200, user)
    }).catch(error => {
      req.response(500, error);
    })
  }
}

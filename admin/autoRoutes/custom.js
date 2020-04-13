const models = require('../model.js');
module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '所有用户列表',
    callback: (req, res) => {
      models.customs.find()
      .then(args => {
        req.response(200, args)
      })
      .catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/total',
    method: 'get',
    mark: '所有用户的个数',
    callback: (req, res) => {
      models.customs.countDocuments().then(count => {
        req.response(200, count);
      }).catch(err => {
        req.response(500, err);
      })
    }
  },
  {
    uri: '/create',
    mark: '新增用户',
    method: 'post',
    callback: (req, res) => {
      const {phone, address, card} = req.body;
      const conditions = {
        phone,
        address,
        card
      };
      new models.customs(conditions).save().then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    mark: '根据id修改用户信息',
    method: 'put',
    callback: (req, res) => {
      const { id } = req.params;
      const { path, role, method, title } = req.body;
      const conditions = {path, role, method, title};
      models.customs.updateOne({_id: id}, conditions).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id获取用户详情',
    method: 'get',
    callback: (req, res) => {
      const { id } = req.params;
      models.customs.findById(id).then(arg => {
        req.response(200, arg)
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id删除用户',
    method: 'delete',
    callback: (req, res) => {
      const { id } = req.params;
      models.customs.deleteOne({_id: id}).then(() => {
        req.response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    }
  }
]

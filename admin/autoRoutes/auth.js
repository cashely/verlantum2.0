const models = require('../model.js');
module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '所有权限列表',
    callback: (req, res) => {
      models.auths.find()
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
    mark: '所有权限的个数',
    callback: (req, res) => {
      models.auths.countDocuments().then(count => {
        req.response(200, count);
      }).catch(err => {
        req.response(500, err);
      })
    }
  },
  {
    uri: '/create',
    mark: '新增权限',
    method: 'post',
    callback: (req, res) => {
      const {path, role, title, method} = req.body;
      const conditions = {
        path,
        role,
        title,
        method
      };
      new models.auths(conditions).save().then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    mark: '根据id修改权限',
    method: 'put',
    callback: (req, res) => {
      const { id } = req.params;
      const { path, role, method, title } = req.body;
      const conditions = {path, role, method, title};
      models.auths.updateOne({_id: id}, conditions).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id获取权限详情',
    method: 'get',
    callback: (req, res) => {
      const { id } = req.params;
      models.auths.findById(id).then(arg => {
        req.response(200, arg)
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id删除权限详情',
    method: 'delete',
    callback: (req, res) => {
      const { id } = req.params;
      models.auths.deleteOne({_id: id}).then(() => {
        req.response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    }
  }
]

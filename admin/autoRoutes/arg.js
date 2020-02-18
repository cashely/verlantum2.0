const models = require('../model.js');
module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '系统参数列表',
    callback: (req, res) => {
      models.args.find()
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
    mark: '获取系统参数总数量',
    callback: (req, res) => {
      models.args.countDocuments().then(count => {
        req.response(200, count);
      }).catch(err => {
        req.response(500, err);
      })
    }
  },
  {
    uri: '/create',
    mark: '新增系统参数',
    method: 'post',
    callback: (req, res) => {
      const {title, value, mark} = req.body;
      const conditions = {
        title,
        value,
        mark
      };
      new models.args(conditions).save().then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    mark: '根据id修改系统参数',
    method: 'put',
    callback: (req, res) => {
      const { id } = req.params;
      const { value, mark } = req.body;
      const conditions = {value, mark};
      models.args.updateOne({_id: id}, conditions).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id获取系统变量',
    method: 'get',
    callback: (req, res) => {
      const { id } = req.params;
      models.args.findById(id).then(arg => {
        req.response(200, arg)
      }).catch(err => {
        req.response(500, err)
      })

    }
  },
  {
    uri: '/:id',
    mark: '根据id删除系统参数',
    method: 'delete',
    callback: (req, res) => {
      const { id } = req.params;
      models.args.deleteOne({_id: id}).then(() => {
        req. response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    }
  }
]

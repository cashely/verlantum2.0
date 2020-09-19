const models = require('../model.js');
module.exports = [
  {
    uri: '/20200711',
    method: 'get',
    mark: '2020年7月11日活动报名页面',
    callback: (req, res) => {
      res.render('20200711', {})
    }
  },
  {
    uri: '/users/:num?',
    method: 'get',
    mark: '根据活动编号获取用户名单',
    callback: (req, res) => {
      const { num } = req.params;
      const { page = 1, limit, noWin = 0 } = req.query;
      const conditions = {}
      if (noWin) {
        conditions.$or = [ { winItem: 0 }, { winItem: undefined }]
      }
      if (num) {
        conditions.num = num
      }
      models.activity.find(conditions).skip((page - 1) * limit).limit(+limit).then(users => {
        req.response(200, users)
      })
    }
  },
  {
    uri: '/user/winItem',
    method: 'post',
    mark: '批量更改用户中奖状态',
    callback: (req, res) => {
      const { phones } = req.body;
      console.log(phones, '需要批量设置的电话')
      models.activity.updateMany({phone: { $in: phones } }, {$set: { winItem: 1 }}).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/count/:num?',
    method: 'get',
    mark: '根据活动编号获取用户数量',
    callback: (req, res) => {
      const { num } = req.params;
      const conditions = {}
      if (num) {
        conditions.num = num
      }
      models.activity.countDocuments(conditions).then(count => {
        req.response(200, count)
      })
    }
  },
  {
    uri: '/activity/:num',
    method: 'post',
    mark: '提交活动信息',
    callback: (req, res) => {
      const { num } = req.params
      const { username, phone, company } = req.body
      models.activity.findOne({num, phone}).then(user => {
        if (user) {
          req.response(200, '您已经报名过了，感谢参与', 1)
          return;
        }
        if (!username || !phone || !company) {
          req.response(500, '字段缺失')
          return;
        }
        new models.activity({
          username,
          num,
          phone,
          company,
        })
        .save()
        .then(() => {
          req.response(200, '创建成功')
        })
        .catch(err => {
          console.log(err)
          req.response(500, err)
        })
      })
    }
  }
]

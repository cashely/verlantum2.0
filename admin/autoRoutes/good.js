const models = require('../model');

module.exports = [
  {
    uri: '/create',
    method: 'post',
    mark: '创建商品',
    callback: (req, res) => {
      const { title, price, number, discount } = req.body;
      const good = new models.goods({
        title,
        price,
        number,
        discount
      }).saveGood().then(result => {
        req.response(200, 'ok')
      })
    }
  },
  {
    uri: '/list',
    method: 'get',
    mark: '查询商品列表',
    callback: (req, res) => {
      const conditions = {};
      models.goods.find(conditions).then(goods => {
        req.response(200, goods)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/list/count',
    method: 'get',
    mark: '查询商品数量',
    callback: (req, res) => {
      const conditions = {};
      models.goods.count(conditions).then(count => {
        req.response(200, count)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    method: 'put',
    mark: '修改商品信息',
    callback: (req, res) => {
      const { id } = req.params;
      const { title, price, number, discount } = req.body;
      const conditions = {title, price, number, discount};
      models.goods.updateOne({_id: id }, conditions).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    method: 'get',
    mark: '获取商品信息',
    callback: (req, res) => {
      const { id } = req.params;
      models.goods.findOne({_id: id }).then(good => {
        req.response(200, good)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:id',
    method: 'delete',
    mark: '删除商品',
    callback: (req, res) => {
      const { id } = req.params;
      models.goods.deleteOne({_id: id }).then(() => {
        req.response(200, 'ok')
      }).catch(err => {
        req.response(500, err)
      })
    }
  }
]
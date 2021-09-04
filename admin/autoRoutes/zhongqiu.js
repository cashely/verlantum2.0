const models = require('../model.js');
module.exports = [
  {
    uri: '/page/success',
    method: 'get',
    mark: '中秋领券成功提示页面',
    callback(req, res) {
      res.render('actives/zhongqiu-success')
    }
  },
  {
    uri: '/page/:spec',
    method: 'get',
    mark: '中秋领券页面',
    callback(req, res) {
      const { spec = 1 } = req.params;
      res.render('actives/zhongqiu', { spec })
    }
  },
  {
    uri: '/list',
    method: 'get',
    mark: '查询中秋券领取列表',
    async callback(req, res) {
      const { limit, page } = req.query;
      const list = await models.zhongqiu.find().limit(+limit).skip(limit * (page - 1)).sort({ _id: -1 });
      req.response(200, list);
    }
  },
  {
    uri: '/card',
    method: 'post',
    mark: '随机号码管理',
    async callback(req, res) {
      const { number } = req.body;
      const isCreated = await models.mathcard.findOne({ number });
      if (isCreated) {
        req.response(200, { code: 1, msg: '已经存在相同的券号' });
      }
      try {
        await new models.mathcard({ number }).save()
        req.response(200, { code: 0 });
      }catch(e) {
        req.response(500, e)
      }
    }
  },
  {
    uri: '/count',
    method: 'get',
    mark: '查询中秋券领取列表统计',
    async callback(req, res) {
      const count = await models.zhongqiu.count(req.query);
      req.response(200, count);
    }
  },
  {
    uri: '/request',
    method: 'post',
    mark: '领取中秋券',
    async callback(req, res) {
      const { card } = req.body;
      const isValid = await models.mathcard.findOne({ number: card });
      if (!isValid) {
        return req.response(200, { code: 1, msg: '券号无效' });
      }
      const isRequest = await models.zhongqiu.findOne({ card });
      if (isRequest) {
        return req.response(200, { code: 1, msg: '已经领取过了' });
      }
      try {
        await new models.zhongqiu(req.body).save();
        req.response(200, { code: 0, msg: '领取成功' });
      }catch(e) {
        req.response(500, { code: 1, msg: e });
      }

    }
  },
  {
    uri: '/:_id',
    method: 'put',
    mark: '修改券信息',
    async callback(req, res) {
      const { _id } = req.params;
      const { body } = req;
      try {
        await models.zhongqiu.findOneAndUpdate({ _id }, body);
        req.response(200, { code: 0, msg: '修改成功' });
      }catch(e) {
        req.response(500, { code: 1, msg: e });
      }

    }
  }
]

const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order } = require('../functions/wxPayV3');
module.exports = [
  {
    uri: '/sended',
    method: 'put',
    mark: '发货',
    callback: (req, res) => {
      const { id } = req.body;
      models.orders.updateOne({_id: id}, {sended: 1})
      .then(() => {
        req.response(200, 'ok')
      })
      .catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/wx/payInfo',
    method: 'get',
    mark: '获取jsApi微信支付信息',
    callback(req, res) {
      const {description, total, code} = req.query;
      const orderNo = +Date.now();
      // const 
      if (!code) {
        return res.send('缺少微信授权code');
      }
      getOpenIdAction(code).then(openid => {
        const orderInfo = {
          description,
          orderNo,
          total,
          openid,
        };
        new models.wxorder(orderInfo).save().then(result => {
          return order({
            description,
            total,
            openid,
            orderNo,
          })
        }).then(result => {
          console.log(result, '---')
        })
      })
    }
  }
]

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
      const {params, code} = req.query;
      const orderNo = String(+Date.now());
      // const 
      if (!code) {
        return res.send('缺少微信授权code');
      }
      const { description, total } = JSON.parse(params);
      console.log('订单描述:', description)
      console.log('订单价格:', total)
      
      getOpenIdAction(code).then(openid => {
        const orderInfo = {
          description,
          orderNo,
          total,
          openid,
        };
        console.log('openid:', openid)
        new models.wxorder(orderInfo).save().then(async () => {
          let result = await order({
            description,
            total,
            openid,
            orderNo,
          });
          req.response(200, {
            orderNo,
            ...result,
          });
        });
      })
    }
  }
]

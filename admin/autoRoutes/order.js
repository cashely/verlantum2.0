const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order, paysignjsapifinal, configSign } = require('../functions/wxPayV3');
const wxpay = require('../functions/wxpay');
const { wxMchId, wxAppId } = require('../config.global');
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
  // 新版本微信的config信息
  {
    uri: '/wx/pay/config',
    method: 'get',
    mark: '新版本微信的config信息',
    callback(req, res) {
      const { url } = req.query;
      const result = configSign(url);
      req.response(200, result);
    }
  },
  {
    uri: '/wx/pay/transactions/jsapi',
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
  },
  {
    uri: '/wx/pay/sign',
    method: 'get',
    callback: (req, res) => {
      const { prepay_id } = req.query;
      const noncestr = wxpay.createNonceStr();
      const timestamp = wxpay.createTimeStamp();
      const finalsign = paysignjsapifinal({
        appid: wxAppId,
        mch_id: wxMchId,
        pkg: `prepay_id=${prepay_id}`,
        noncestr,
        timestamp,
        mchkey: '773ADDFE99B6749A16D6B9E266F8A20A',
      });
      console.log(finalsign, '<-最终签名')
      req.response(200, {
        appid: wxAppId,
        mch_id: wxMchId,
        noncestr,
        timestamp,
        signType: 'RSA',
        sign: finalsign,
      })
    }
  }
]

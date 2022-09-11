const moment = require('moment');
const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order, paysignjsapifinal, configSign } = require('../functions/wxPayV3');
const wxpay = require('../functions/wxpay');
const { wxMchId, wxAppId } = require('../config.global');
const generatorOrder = require('../functions/generatorOrder');
module.exports = [
  {
    uri: '/wx/me',
    method: 'get',
    mark: '查询微信个人订单',
    async callback(req, res) {
      const openid = req.cookies.openid;
      if (!openid) {
        res.redirect(`/wxcode/get?uri=https://api.verlantum.cn/wxcode/login?redirect=https://api.verlantum.cn/order/wx/me`);
      } else {
        let orders = await models.orders.find({ openid }).populate('goodNumber').sort({ _id: -1 }).lean();
        orders = orders.map(v => {
          return { ...v, createdAt: moment(v.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        })
        res.render('me', { orders });
      }
    }
  },
  {
    uri: '/create',
    method: 'post',
    mark: '通过接口微信下单',
    callback: (req, res) => {
      const {aid, goodId, username, sex, birthday, phone, address, guardian, isRequireTicket, ticketHead, payChannel, count } = req.body;
      models.goods.findOne({ _id: goodId }).then(({ price, title }) => {
        return generatorOrder({aid, price, title, address, phone, sex, birthday, isRequireTicket, ticketHead, guardian, username, goodId, payChannel, count })
      })
      .then(orderNo => {
        req.response(200, {
          orderNo,
          appid: wxAppId,
        });
      })
    }
  },
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
    async callback(req, res) {
      const { url } = req.query;
      const result = await configSign(url);
      console.log(result, 'result')
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
  },
  {
    uri: '/ticket/create',
    method: 'post',
    mark: '创建发票',
    async callback(req, res) {
      // 获取订单id
      const { orderId: _id, type, head, name, email  } = req.body;
      try {
        const hasTicket = await models.tickets.findOne({ orderId: _id });
        if (hasTicket) {
          return req.response(200, { code: 1, msg: '此订单已开过发票了' });
        }
        const { payTotal } = await models.orders.findOne({ _id });
        await new models.tickets({
          type,
          head,
          name,
          email,
          amount: payTotal * 100,
          orderId: _id,
        }).save();
        req.response(200, { code: 0, msg: 'ok' });
      }catch(e) {
        console.log('创建发票信息失败', e);
        req.response(500, e)
      }
    }
  }
]

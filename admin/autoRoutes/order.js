const moment = require('moment');
const _ = require('lodash');
const schedule = require('node-schedule');
const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order, paysignjsapifinal, configSign } = require('../functions/wxPayV3');
const wxpay = require('../functions/wxpay');
const { wxMchId, wxAppId } = require('../config.global');
const generatorOrder = require('../functions/generatorOrder');

// 增加扫描定时任务清理临时订单
const date = '*/5 * * * *'; // 每5分钟执行一次

const clearTempOrder = schedule.scheduleJob(date, async () => {
  console.log('开启定时任务', '---------->', moment().format('HH:mm'), '<---------');
  try {
    const tempOrders = await models.tempOrders.find({ createdAt: { $lt: new Date(moment().subtract(15, 'm').format('YYYY-MM-DD HH:mm:ss')) }});
    const tempOrderNos = tempOrders.map(async ({ orderNo }) => {
      const orderInfo = await models.orders.findOne({ orderNo, hasPayed: 0 }).populate('goodNumber'); // 未付款并且在临时订单里面
      if (orderInfo) {
        await models.goods.findOneAndUpdate({ _id: orderInfo.goodNumber._id }, { stock: orderInfo.goodNumber.stock + orderInfo.count });
        console.log(orderInfo.count, '<------增加库存');
      }
      await models.tempOrders.deleteOne({ orderNo });
    });
  } catch (err) {
    console.log(err, '<-----定时任务失败');
  }
})


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
    async callback(req, res) {
      const { aid, goodId, username, sex, birthday, phone, address, guardian, isRequireTicket, ticketHead, payChannel, count } = req.body;
      const { price, title, stock, number } = await models.goods.findOne({ _id: goodId });

      if (!_.isInteger(+count) || +count <= 0) {
        req.response(200, {
          msg: '下单失败,下单数量必须是正整数',
        }, 1);
        return;
      }

      // 下单临时限制每天2盒
      if (count > 1 && number === 'YL-GOOD-20221229-14') {
        req.response(200, {
          msg: '下单失败,每单最多能下2盒',
        }, 1);
        return;
      }
      // const 
      if (stock < count) {
        req.response(200, {
          msg: '下单失败,库存不够',
        }, 1);
        return;
      }
      const orderNo = await generatorOrder({aid, price, title, address, phone, sex, birthday, isRequireTicket, ticketHead, guardian, username, goodId, payChannel, count });
      try {
         // 先临时扣减库存，并且新增一张临时表
         await models.goods.updateOne({ _id: goodId }, { stock: stock - count });
         await new models.tempOrders({ orderNo }).save();
         req.response(200, {
          orderNo,
          appid: wxAppId,
         });
       } catch (e) {
         console.log(e, '扣库存失败');
         req.response(200, {
          msg: '下单失败,库存错误',
         }, 1);
       }
    }
  },
  {
    uri: '/sended/all',
    method: 'put',
    mark: '批量发货',
    callback: (req, res) => {
      const { ids } = req.body;
      models.orders.updateMany({ _id: { $in: ids } }, { sended: 1 })
      .then(() => {
        req.response(200, 'ok')
      })
      .catch(err => {
        console.log(err, '---')
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

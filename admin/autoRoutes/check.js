const moment = require('moment');
const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order, paysignjsapifinal, configSign } = require('../functions/wxPayV3');
const wxpay = require('../functions/wxpay');
const { wxMchId, wxAppId } = require('../config.global');
const generatorOrder = require('../functions/generatorOrder');
module.exports = [
  {
    uri: '/scan-bot',
    method: 'get',
    mark: '扫描检测盒页面',
    async callback(req, res) {
      const openid = req.cookies.openid;
      if (!openid) {
        res.redirect(`/wxcode/get?uri=https://api.verlantum.cn/wxcode/login?redirect=https://api.verlantum.cn/check/scan-bot`);
      } else {
        res.render('scan-bot');
      }
    }
  },
  {
    uri: '/scan-bot/:botNumber',
    method: 'post',
    mark: '录入检测盒',
    async callback(req, res) {
      const { openid } = req.cookies;
      console.log(openid)
      if (!openid) {
        res.response(500, '获取授权失败,请刷新页面')
      } else {
        const { botNumber } = req.params;
        const conditions = {
          openid,
          botNumber
        };
        new models.customs(conditions).save().then(result => {
          console.log(result, '-=-=-=');
          req.response(200, 'ok');
        }).catch(err => {
          req.response(500, err)
        })
      }
    }
  }
]

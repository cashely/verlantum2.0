const request = require('request');
const { wxAppId, wxMchId } = require('../config.global');
module.exports = {
  // 获取openId
  getOpenId(code) {
    return new Promise((resolve, reject) => {
      request({url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxAppId}&secret=${wxAppSecret}&code=${code}&grant_type=authorization_code`,method:'GET'},function(err,response,body){
      if(!err && response.statusCode == 200){
          resolve(JSON.parse(body))
      }else {
        console.log(err)
        reject(err)
      }
    })
    })
  },
  // jsAPI统一下单
  order: ({
    description, // 订单描述
    total, // 订单金额
    openid, // 用户微信id
    orderNo,
  }) => {
    return new Promise((resolve, reject) => {
      const formData = {
        appid: wxAppId,
          mchid: wxMchId,
          description: description,
          out_trade_no: orderNo,
          amount: {
            total: total,
          },
          payer: {
            openid,
          },
          notify_url: 'https://api.verlantum.cn/auth/wxpaycallback', // 订单支付通知地址
      };
      request({
        url: 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
        method: 'POST',
        headers: {
          'Accept':'application/json, text/javascript, */*; q=0.01',
          'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36',
          'X-Requested-With':'XMLHttpRequest',
          'Content-Type':'application/json; charset=UTF-8',
        },
        body: JSON.stringify(formData),
      }, (err, response, body) => {
        console.log('统一下单信息:',response, body)
        if (!err && response.statusCode === 200) {
          resolve(response, body)
        } else {
          reject(err)
        }
      })
    })
  },
}
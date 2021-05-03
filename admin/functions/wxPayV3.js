const request = require('request');
const Payment = require('wxpay-v3');
const path = require('path');
const fs = require('fs');
const { wxAppId, wxMchId } = require('../config.global');
console.log(fs.readFileSync(path.resolve(__dirname, '../1472079802_20200424_cert/apiclient_cert.pem')).toString())
const payment = new Payment({
  appid: wxAppId,
  mchid: wxMchId,
  private_key: fs.readFileSync(path.resolve(__dirname, '../1472079802_20200424_cert/apiclient_cert.pem')).toString(), //或者直接复制证书文件内容
  serial_no:'55B518F71AFB2E5A99AABED154BEC0D99DEA9216',
  apiv3_private_key:'773ADDFE99B6749A16D6B9E266F8A20A',
  notify_url: 'https://api.verlantum.cn/auth/wxpaycallback',
})
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
  async order ({
    description, // 订单描述
    total, // 订单金额
    openid, // 用户微信id
    orderNo,
  }) {
    try {
      let result = await payment.jsapi({
        description,
        out_trade_no: orderNo,
        amount: {
          total,
        },
        payer: {
          openid,
        }
      })
      console.log(result, '-->')
    }catch(e) {
      console.log(e, '<---')
    };
  }
}
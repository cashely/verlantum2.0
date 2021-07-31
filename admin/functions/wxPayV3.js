const request = require('request');
const fetch = require('node-fetch');
const Payment = require('wxpay-v3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const wxpay = require('../functions/wxpay');
const { wxAppId, wxMchId, wxAppSecret } = require('../config.global');
const private_key = fs.readFileSync(path.resolve(__dirname, '../1472079802_20210503_cert/apiclient_key.pem')).toString();
const payment = new Payment({
  appid: wxAppId,
  mchid: wxMchId,
  private_key, //或者直接复制证书文件内容
  serial_no:'7E9E0047261197C96D82A3FD70E9A2E2B47AD027',
  apiv3_private_key:'773ADDFE99B6749A16D6B9E266F8A20A',
  notify_url: 'https://api.verlantum.cn/auth/wxpaycallback',
});

function raw(args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
      newArgs[key] = args[key];
  });
  var string = '';
  for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
}

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
      // {
      //   status: 200,
      //   data: {"prepay_id":"wx03111728688239b722db21a23fb42d0000"}
      // }
      if (result.status === 200) {
        return JSON.parse(result.data);
      }
      console.log(result, '-->')
    }catch(e) {
      console.log(e, '<---')
    };
  },
  //签名加密算法,第二次的签名
  paysignjsapifinal({
    appid, pkg, noncestr,timestamp, mchkey, mch_id
  }) {
    var ret = {
        appId: appid,
        mch_id,
        package: pkg,
        nonceStr: noncestr,
        timeStamp: timestamp,
        signType: 'RSA'
    };
    // console.log('retretret==', ret);
    // var string = raw(ret);
    // var key = mchkey;
    // string = string + '&key=' + key;
    // console.log('string=', string);
    try {
      const sign = payment.rsaSign(`${appid}\n${timestamp}\n${noncestr}\n${pkg}\n`, private_key, 'SHA256withRSA');
      return sign;
    } catch(e) {
      console.log(e, '<-签名报错')
    }
  },
  // 获取微信config签名
  async configSign(url) {
    // 请求accessToken
    // {"access_token":"ACCESS_TOKEN","expires_in":7200}
    const { access_token, errcode } = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxAppId}&secret=${wxAppSecret}`)
    .then(res => res.json())
    console.log('获取到的accessToken', access_token, errcode);
    // 请求jsapiTicket
    const { ticket } = await fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`).then(res => res.json());
    console.log('获取到的jsapiTicket', ticket);
    // 签名config信息
    const noncestr = wxpay.createNonceStr();
    const timestamp = wxpay.createTimeStamp();
    const str = raw({
      noncestr,
      jsapi_ticket: ticket,
      timestamp,
      url,
    })
    const signature = crypto.createHash('sha1').update(str).digest('hex').toUpperCase();
    return {
      signature,
      noncestr,
      timestamp,
      appId: wxAppId,
    }
  }
}
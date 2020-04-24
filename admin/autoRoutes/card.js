const models = require('../model')
const wxcard = require('../functions/wxcard');
const request = require('request');
const fs = require('fs');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
module.exports = [
  {
    uri: 'wx',
    method: 'get',
    callback: (req, res) => {
      const {code, good} = req.query;
      if (!code) {
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wxAppId+'&redirect_uri='+ encodeURIComponent('http://api.verlantum.cn/card/wx')+ '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirec')
        return;
      }
      getOpenIdAction(code).then(body => {
        const openid = body.openid;
        models.goods.findOne({ number: good})
        .then(good => {
          // const { discount } = good;
          const discount = '10410300'
          const out_request_no = wxcard.createTimeStamp();
          const params = {
            openid,
            openid_count: 1,
            partner_trade_no: wxcard.createTimeStamp(),
            coupon_stock_id: discount,
            out_request_no: out_request_no,
            appid: wxAppId,
            stock_creator_mchid: wxMchId,
            nonce_str: wxcard.createNonceStr(),
          }

          const sign = generatorWxCardSign(params)
          const formData = `<xml>
          <appid>${params.appid}</appid>
          <coupon_stock_id>${params.coupon_stock_id}</coupon_stock_id>
          <mch_id>${params.stock_creator_mchid}</mch_id>
          <nonce_str>${params.nonce_str}</nonce_str>
          <openid>${params.openid}</openid>
          <openid_count>${params.openid_count}</openid_count>
          <partner_trade_no>${params.partner_trade_no}</partner_trade_no>
          <sign>${sign}</sign>
          </xml>`;

          var url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon';

          request({url:url,method:'POST',body: formData, agentOptions: {
            pfx: fs.readFileSync('../1472079802_20200424_cert/apiclient_cert.p12'),
            passphrase: params.stock_creator_mchid // 商家id
          }},function(err,response,body){
              console.log(err, response, body)
          });
          res.send(formData);

        })
      });
    }
  }
]


const getOpenIdAction = (code) => {
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
}

const generatorWxCardSign = ({
    coupon_stock_id,
    openid_count,
    partner_trade_no,
    openid,
    appid,
    mch_id,
    nonce_str
}) => {
  return wxcard.cardsignjsapi(coupon_stock_id,
  openid_count,
  partner_trade_no,
  openid,
  appid,
  mch_id,
  nonce_str, '773ADDFE99B6749A16D6B9E266F8A20A')
}

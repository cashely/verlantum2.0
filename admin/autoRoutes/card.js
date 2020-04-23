const models = require('../model')
const wxcard = require('../functions/wxcard');
const request = require('request');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
module.exports = [
  {
    uri: 'wx',
    method: 'get',
    callback: (req, res) => {
      const {code, good} = req.query;
      if (!code) {
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wxAppId+'&redirect_uri='+ encodeURIComponent('http://api.verlantum.cn/card/wx')+ '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirec')
      }
      getOpenIdAction(code).then(body => {
        console.log(body)
        const openid = body.openid;
        models.goods.findOne({ number: good})
        .then(good => {
          const { discount } = good;
          return {
            sign: generatorWxCardSign({
              openid,
              mch_id: wxMchId,
              stock_id: discount
            }),
            discount
          }
        })
        .then(({sign, discount}) => {
          // req.response(200, {
          //   stock_id: discount,
          //   out_request_no: wxcard.createTimeStamp(),
          //   sign,
          //   send_coupon_merchant: wxMchId,
          //   openid: openid
          // })
          res.redirect(`https://action.weixin.qq.com/busifavor/getcouponinfo?stock_id=${discount}&out_request_no=${wxcard.createTimeStamp()}&sign=${sign}&send_coupon_merchant=${wxMchId}&open_id=${openid}#wechat_redirect`)
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

const generatorWxCardSign = ({openid, mch_id, stock_id, mch_key}) => {
  return wxcard.cardsignjsapi(stock_id, mch_id, openid, '773ADDFE99B6749A16D6B9E266F8A20A')
}

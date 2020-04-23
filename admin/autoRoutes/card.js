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
        // const openid = 'ot6_41JDOuSFk0LB1qL0G_wIQ9ZE';
        models.goods.findOne({ number: good})
        .then(good => {
          // const { discount } = good;
          const discount = '10410300'
          const out_request_no = wxcard.createTimeStamp();
          return {
            sign: generatorWxCardSign({
              openid,
              mch_id: wxMchId,
              stock_id: discount,
              out_request_no,
            }),
            discount,
            out_request_no,
          }
        })
        .then(({sign, discount, out_request_no}) => {
          // req.response(200, {
          //   stock_id: discount,
          //   out_request_no: wxcard.createTimeStamp(),
          //   sign,
          //   send_coupon_merchant: wxMchId,
          //   openid: openid
          // })
          // var formData  = "<xml>";
          // formData  += "<appid>"+appid+"</appid>";  //appid
          // formData  += "<coupon_stock_id>"+discount+"</coupon_stock_id>";
          // formData  += "<mch_id>"+wxMchId+"</mch_id>";  //商户号
          // formData  += "<nonce_str>"+wxcard.createNonceStr()+"</nonce_str>"; //随机字符串，不长于32位。
          // formData  += "<notify_url>"+notify_url+"</notify_url>";
          // formData  += "<openid_count>"+1+"</openid_count>";
          // formData  += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>";
          // formData  += "<total_fee>"+total_fee+"</total_fee>";
          // formData  += "<trade_type>"+trade_type+"</trade_type>";
          // formData  += "<sign>"+sign+"</sign>";
          // formData  += "<openid>"+openid+"</openid>";
          // formData  += "</xml>";

          const url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon';

          console.log(sign, '======')
          res.redirect(`https://action.weixin.qq.com/busifavor/getcouponinfo?stock_id=${discount}&out_request_no=${out_request_no}&sign=${sign}&send_coupon_merchant=${wxMchId}&open_id=${openid}#wechat_redirect`)
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

const generatorWxCardSign = ({openid, mch_id, stock_id, out_request_no}) => {
  return wxcard.cardsignjsapi(stock_id, mch_id, openid, out_request_no, '773ADDFE99B6749A16D6B9E266F8A20A')
}

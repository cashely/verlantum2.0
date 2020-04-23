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
            "stock_id": discount,
            "out_request_no": out_request_no,
            "appid": wxAppId,
            "stock_creator_mchid": wxMchId,
          }

          res.render('wxcard', params);

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

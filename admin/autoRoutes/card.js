const models = require('../model')
const wxcard = require('../functions/wxcard');
const request = require('request');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const qs = require('qs');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
module.exports = [
  {
    uri: 'wx',
    method: 'get',
    callback: (req, res) => {
      const {code, params} = req.query;
      if (!code) {
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wxAppId+'&redirect_uri='+ encodeURIComponent(`http://api.verlantum.cn/card/wx?params=${params}`)+ '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirec')
        return;
      }
      let paramsBuffer = Buffer.from(params, 'base64').toString()
      paramsBuffer = qs.parse(paramsBuffer);
      console.log(paramsBuffer = qs.parse(paramsBuffer), 'buffer')
      const { good, agent }  = paramsBuffer;
      getOpenIdAction(code).then(body => {
        const openid = body.openid;
        models.goods.findOne({ _id: good})
        .then(resultGood => {
          if (agent) {
            return models.agents.findOne({_id: agent}).then(agentDetail => {
              if(!agentDetail) {
                return resultGood
              }
              console.log(agentDetail, 'agentDetail')
              if (agentDetail && agentDetail.discount) {
                return Object.assign({}, resultGood.toObject(), { discount: agentDetail.discount, agentDetail })
              }
              res.render('wxcard', { err_code: '', err_code_des: '', broken: '1', url: `http://api.verlantum.cn/good/page/${good}`});
              return null
            })
          }
          return resultGood;
        })
        .then(resultGood => {
          if (!resultGood) return;
          const { discount, number, agentDetail } = resultGood;
          console.log(resultGood, 'resultGood');
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

          let formData = '<xml>';
          formData += `<appid>${params.appid}</appid>`;
          formData += `<coupon_stock_id>${params.coupon_stock_id}</coupon_stock_id>`;
          formData += `<mch_id>${params.stock_creator_mchid}</mch_id>`;
          formData += `<nonce_str>${params.nonce_str}</nonce_str>`;
          formData += `<openid>${params.openid}</openid>`;
          formData += `<openid_count>${params.openid_count}</openid_count>`;
          formData += `<partner_trade_no>${params.partner_trade_no}</partner_trade_no>`;
          formData += `<sign>${sign}</sign>`;
          formData += '</xml>';

          var wxurl = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon';

          request({url:wxurl,method:'POST',body: formData, agentOptions: {
            pfx: fs.readFileSync(path.resolve(__dirname, '../1472079802_20200424_cert/apiclient_cert.p12')),
            passphrase: params.stock_creator_mchid // 商家id
          }},function(err,response,body){
              if(!err && response.statusCode === 200){
                  xml2js.parseString(body, {explicitArray : false}, function (errors, response) {
                      if (null !== errors) {
                          console.log(errors)
                          return;
                      }
                      const  $result = {
                        err_code: response.xml.err_code || '',
                        err_code_des: response.xml.err_code_des || ''
                      }
                      console.log(response.xml, '优惠券领取结果')
                      let url = `http://api.verlantum.cn/good/page/${number}`
                      if (agent) {
                        url += `?agent=${agent}`
                      }
                      res.render('wxcard', { ...$result, url, broken: '0' });
                  });
              }
          });
        })
        .catch(err => {
          if(err !== 0) {
            console.log(err)
          }
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
    stock_creator_mchid,
    nonce_str
}) => {
  return wxcard.cardsignjsapi(coupon_stock_id,
  openid_count,
  partner_trade_no,
  openid,
  appid,
  stock_creator_mchid,
  nonce_str, '773ADDFE99B6749A16D6B9E266F8A20A')
}

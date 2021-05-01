const request = require('request');
const { wxAppId, wxAppSecret} = require('../config.global');
module.exports = (code) => {
  return new Promise((resolve, reject) => {
    request({url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxAppId}&secret=${wxAppSecret}&code=${code}&grant_type=authorization_code`,method:'GET'},function(err,response,body){
      if(!err && response.statusCode == 200){
          resolve(JSON.parse(body).openid)
      }else {
        console.log(err)
        reject(err)
      }
    })
  })
}
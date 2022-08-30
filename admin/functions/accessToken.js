const request = require('request');
const { wxAppId, wxAppSecret } = require('../config.global');

const uri = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxAppId}&secret=${wxAppSecret}`;

module.exports = () => {
  return new Promise((resolve, reject) => {
    request(uri, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        const access_token = JSON.parse(body).access_token;
        resolve(access_token);
      }
      reject(err);
    })
  })
}
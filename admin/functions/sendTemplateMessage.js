const request = require('request');
const accessToken = require('./accessToken');


const uri = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=`;

module.exports = async (openid, messageDate) => {
  try {
    const access_token = await accessToken();
    return new Promise((resolve, reject) => {
      request({
        url: `${uri}${access_token}`,
        method: 'post',
        body: JSON.stringify({ touser: openid, ...messageDate }),
        headers: { 'Content-Type': 'application/json' },
      }, (err, response, body) => {
        if (!err && response.statusCode == 200) {
          resolve('模版消息发送成功');
        }
        resolve('模版消息发送失败');
      });
    })
  } catch (err) {
    console.log(err);
    return '模版消息发送失败'
  }

}
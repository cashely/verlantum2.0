const  {wxAppId} = require('../config.global');
module.exports = [
  {
    uri: '/get',
    method: 'get',
    callback: (req, res) => {
      const {uri} = req.query;
      res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wxAppId+'&redirect_uri='+uri+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirec')
    }
  }
]
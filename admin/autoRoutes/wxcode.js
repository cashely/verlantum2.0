const  {wxAppId} = require('../config.global');
const  { getOpenIdAction } = require('../functions/wxPayV3');
module.exports = [
  {
    uri: '/get',
    method: 'get',
    callback: (req, res) => {
      const {uri} = req.query;
      res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wxAppId+'&redirect_uri='+uri+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirec')
    }
  },
  {
    uri: '/login',
    method: 'get',
    mark: '获取微信code的登录',
    async callback(req, res) {
      const { code, redirect } = req.query;
      const openid = await getOpenIdAction(code);
      res.cookie('openid', openid);
      res.redirect(redirect);
    },
  },
  {
    uri: '/about',
    method: 'get',
    mark: '支付成功以后关注公众号',
    async callback(req, res) {
      res.render('yunliang');
    }
  },
  {
    uri: '/xinguan-about',
    method: 'get',
    mark: '支付成功以后关注公众号',
    async callback(req, res) {
      res.render('xinguan-about');
    }
  },
  {
    uri: '/normal-about',
    method: 'get',
    mark: '口罩支付成功以后关注公众号',
    async callback(req, res) {
      res.render('normal-about');
    }
  }
]

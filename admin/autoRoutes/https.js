module.exports = [
  {
    uri: '/admin.verlantum.cn',
    method: 'get',
    mark: '腾讯云admin.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202105021357535mwlef11v3sdv0v0voacod7vrzrp489rdyserado7xhip6qe4v')
    }
  },
  {
    uri: '/api.verlantum.cn',
    method: 'get',
    mark: '腾讯云api.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202105021354134viaymcfrr8x5470kl6hxu5n6zg8csozo04qlvro9ubq8jctg7')
    }
  },
  {
    uri: '/wx_uri_auth',
    method: 'get',
    mark: '微信jssdk授权域名',
    callback: (req, res) => {
      res.send('TulMgRcUBXaRi7hY')
    }
  }
]

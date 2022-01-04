module.exports = [
  {
    uri: '/admin.verlantum.cn',
    method: 'get',
    mark: '腾讯云admin.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202201031343242d1qsmz9hsba8xeoq0cofeam3rzy70bgwqtubxtqz5d99i94e6')
    }
  },
  {
    uri: '/api.verlantum.cn',
    method: 'get',
    mark: '腾讯云api.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202201031348392dffktr5g3765299mhtd70cz9pdrh4vluelbwn15ck0r4d00n5 ')
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

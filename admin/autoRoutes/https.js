module.exports = [
  {
    uri: '/admin.verlantum.cn',
    method: 'get',
    mark: '腾讯云admin.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202002170916344ozqi3dlkk6ujihf68692nx5ezmsji3drr81i8x3yzgv70xnnt')
    }
  },
  {
    uri: '/api.verlantum.cn',
    method: 'get',
    mark: '腾讯云api.verlantum.cn证书',
    callback: (req, res) => {
      res.send('202002170913470dzkxg8quoybdofu5qodmerkhya9mnus7hlcisw4d1sevosmq3')
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

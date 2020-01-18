module.exports = () => {
  return (req, res, next) => {
    console.log(req.isAuthenticated())
    if(req.isAuthenticated()) {
      return next()
    }
    res.json({
      code: 1,
      message: '未登录'
    })
  }
}

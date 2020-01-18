const models = require('../model.js');
const qrcode = require('../functions/qrCode');

module.exports = {
  units(req, res) {
    models.units.find().then(units => {
      req.response(200, units);
    }).catch(err => {
      req.response(500, err);
    })
  },
  qrRedirect(req, res) {
    // console.log(req.)
    console.log(req.headers)
    res.send('ok');
  },
  qrCode(req, res) {
    // res.send(qrcode)
    qrcode('http://localhost.charlesproxy.com:6010/qrRedirect').then(string => {
      res.send(`<img src='${string}'/>`)
    })
  }
}

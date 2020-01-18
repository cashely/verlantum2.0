const QRCode = require('qrcode');

var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 1,
  color: {
    dark:"#010599FF",
    light:"#FFBF60FF"
  }
}

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(url, opts, (err, string) => {
      if(err) {
        reject(err)
      }else {
        resolve(string)
      }
    })
  })
}

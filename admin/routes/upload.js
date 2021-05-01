const {response, uploadFile, splitcsv2json, fixEmptyJson} = require('../functions/helper.js');
module.exports = (req, res) => {
  uploadFile(req).then(([path]) => {
    response(200, {
      path
    }, res);
  }).catch(err => {
    console.log(err)
    response(500, err, res);
  })
}

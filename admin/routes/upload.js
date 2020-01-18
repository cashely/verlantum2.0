const models = require('../model.js');
const {response, uploadFile, splitcsv2json, fixEmptyJson} = require('../functions/helper.js');
const multiparty = require('multiparty');
module.exports = (req, res) => {
  uploadFile(req).then(([path, group]) => {
    const data = fixEmptyJson(splitcsv2json(path));
    exportCase(data, group).then(() => {
      response(200, 'ok', res);
    }).catch(err => {
      console.log(err)
      throw new Error(err);
    })

  }).catch(err => {
    console.log(err)
    response(500, err, res);
  })
}


const exportCase = (dataArr, gid) => {
  const promises = dataArr.map((nodes, index) => {
    return new models.cases({
      title: `场景${index+1}`,
      group: gid
    }).save().then(caseObj => {
      return new models.nodes({
        case: caseObj._id,
        nodes: nodes.map(n => ({title: n}))
      }).save().then(() => {}).catch(err => {
        console.log(err)
      })
    })
  })
  console.log(promises)
  return Promise.all(promises)
}

const request = require('request');
const baidupushapi = 'http://data.zz.baidu.com/urls?site=www.yuanxiaorencai.com&token=fPrV5wBk0w6Svi0o';
const baiduupdateapi = 'http://data.zz.baidu.com/update?site=www.yuanxiaorencai.com&token=fPrV5wBk0w6Svi0o';
const rootUrl = 'https://www.yuanxiaorencai.com';
const xlsx2json = require('node-xlsx');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const staticPath = path.resolve(__dirname, '../public/uploads/')
module.exports = {
  /**
   * @function function response
   * @desc 用于全局node返回响应接口数据
   * @param {Number} statu 状态码
   * @param {Any} data payload数据
   * @param {Responese} res response
   */
  response: (statu, data, res) => {
    if(statu === 200) {
      res.json({
        code: 0,
        data: data
      })
    }else if(statu === 530) {
      res.status(statu).json(data)
    }else if(statu) {
      res.status(statu).json(data)
    }else {
      res.sendStatus(500)
    }
  },
  responseMiddleware(req, res, next) {
    req.response = (statu, data, code = 0) => {
      if(statu === 200) {
        res.json({
          code,
          data: data
        })
      }else if(statu === 530) {
        res.status(statu).json(data)
      }else if(statu) {
        res.sendStatus(statu)
      }else {
        res.sendStatus(500)
      }
    }
    next();
  },
  getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || ''
  },
  baidupush(url) {
    return new Promise((resolve, reject) => {
      request({
        url: baidupushapi,
        method: 'POST',
        json: true,
        headers: {
          "content-type": 'text/plain',
          "user-agent": 'curl/7.12.1'
        },
        form: rootUrl + url
      }, (error, response, body) => {
        if(!error && response.statusCode == 200) {
          resolve(body)
        }else {
          reject(error)
        }
      })
    })
  },
  baiduupdate(url) {
    return new Promise((resolve, reject) => {
      request({
        url: baiduupdateapi,
        method: 'POST',
        json: true,
        headers: {
          "content-type": 'text/plain',
          "user-agent": 'curl/7.12.1'
        },
        form: rootUrl + url
      }, (error, response, body) => {
        if(!error && response.statusCode == 200) {
          resolve(body)
        }else {
          reject(error)
        }
      })
    })
  },
  splitcsv2json(path) {
    return xlsx2json.parse(path)
  },
  fixEmptyJson(data) {
    data = data[0].data.slice(2);
    for (let i = 0; i < data.length; i++) {
      if (i !== 0) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j] === undefined) {
            data[i][j] = data[i - 1][j];
          }
        }
      }
    }
    return data
  },
  uploadFile(req) {
    return new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm()
      form.uploadDir = staticPath;
      form.parse(req, (err, fields, files) => {
        const file = files.file;
        if(err) reject(err);
        let splitnames = file.name.split('.');
        fs.rename(file.path, file.path + '.' + splitnames[splitnames.length - 1], (err) => {
          resolve([staticPath+ '/' + file.path.split('/').reverse()[0] + '.' + splitnames[splitnames.length - 1], fields.group])
        })
      })
    })
  },
  getSha1(str) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  }
}

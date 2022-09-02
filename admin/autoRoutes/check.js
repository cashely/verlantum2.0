const moment = require('moment');
const models = require('../model.js');
const getOpenIdAction = require('../functions/getOpenIdAction');
const { order, paysignjsapifinal, configSign } = require('../functions/wxPayV3');
const wxpay = require('../functions/wxpay');
const { wxMchId, wxAppId } = require('../config.global');
const generatorOrder = require('../functions/generatorOrder');
const sendTemplateMessage = require('../functions/sendTemplateMessage');
module.exports = [
  {
    uri: '/scan-bot',
    method: 'get',
    mark: '扫描检测盒页面',
    async callback(req, res) {
      const openid = req.cookies.openid;
      if (!openid) {
        res.redirect(`/wxcode/get?uri=https://api.verlantum.cn/wxcode/login?redirect=https://api.verlantum.cn/check/scan-bot`);
      } else {
        res.render('scan-bot');
      }
    }
  },
  {
    uri: '/scan-form/:id',
    method: 'get',
    mark: '检测信息填写页面',
    callback(req, res) {
      const { id } = req.params;
      res.render('scan-form', { id });
    }
  },
  {
    uri: '/scan-success',
    method: 'get',
    mark: '检测信息填写成功页面',
    callback(req, res) {
      res.render('scan-success');
    }
  },
  {
    uri: '/scan-guide',
    method: 'get',
    mark: '检测引导页面',
    callback(req, res) {
      res.render('scan-guide');
    }
  },
  {
    uri: '/scan',
    method: 'get',
    mark: '检测信息列表页面',
    async callback(req, res) {
      const { limit, page } = req.query;
      const list = await models.check.find().limit(+limit).skip(limit * (page - 1)).sort({ _id: -1 });
      req.response(200, list);
    }
  },
  {
    uri: '/scan-me',
    method: 'get',
    mark: '检测报告下载列表',
    async callback(req, res) {
      const openid = req.cookies.openid;
      if (!openid) {
        res.redirect(`/wxcode/get?uri=https://api.verlantum.cn/wxcode/login?redirect=https://api.verlantum.cn/check/scan-me`);
      } else {
        let checks = await models.check.find({ openid }).sort({ _id: -1 }).lean();
        checks = checks.map(v => {
          return { ...v, checkDate: moment(v.checkDate).format('YYYY-MM-DD')}
        })
        res.render('scan-me', { checks });
      }
    }
  },
  {
    uri: 'total',
    method: 'get',
    mark: '',
    callback(req, res) {
      const q = req.query;
      let conditions = {};
      if(q._k) {
        conditions.acount = new RegExp(q._k);
      }
      models.check.countDocuments(conditions).then(count => {
        req.response(200, count);
      }).catch(error => {
        req.response(500, error)
      })
    }
  },
  {
    uri: '/scan-form/:id',
    method: 'post',
    mark: '提交检测信息页面',
    async callback(req, res) {
      const { id } = req.params;
      const {
        uname,
        age,
        passPortNumber,
        checkDate,
        phone,
        sex,
      } = req.body;
      const conditions = {
        uname,
        age,
        passPortNumber,
        checkDate,
        phone,
        sex,
      };
      try {
        await models.check.findByIdAndUpdate(id, conditions);
        req.response(200, 'ok');
      } catch (err) {
        console.log(err);
        req.response(500, err);
      }

    }
  },
  {
    uri: '/scan-bot/:botNumber',
    method: 'post',
    mark: '录入检测盒',
    async callback(req, res) {
      const { openid } = req.cookies;
      if (!openid) {
        res.response(500, '获取授权失败,请刷新页面')
      } else {
        const { botNumber } = req.params;
        const hasBotNumber = await models.check.findOne({ botNumber });
        if (hasBotNumber) {
          req.response(200, {
            message: '采集管已使用',
          }, 1);
          return;
        }
        const conditions = {
          openid,
          botNumber
        };
        new models.check(conditions).save().then(result => {
          const { _id } = result;
          req.response(200, _id);
        }).catch(err => {
          console.log(err)
          req.response(500, err)
        })
      }
    }
  }, {
    uri: '/update/:id',
    method: 'put',
    mark: '更新检测信息',
    async callback(req, res) {
      const { id } = req.params;
      const { _id, ...otherInfo } = req.body;
      try {
        const checkRecord = await models.check.findByIdAndUpdate(id, otherInfo);
        const { openid, reportPath, botNumber, uname } = checkRecord;
        // 如果更新的字段里面包含报告，需要发送通知
        if (otherInfo.reportPath) {
          console.log(reportPath, '查询的用户报告地址')
          const messageData = {
            template_id: 'l2p5BPpW5SKE2n-Junt3QL82i1_4C_nt6HPpVKs9bkY',
            url: `https://api.verlantum.cn/uploads/${reportPath}`,
            data: {
              first: {
                value: '尊敬的用户，您的检测报告已生成',
              },
              keyword1: {
                value: botNumber
              },
              keyword2: {
                value: uname,
              },
              remark: {
                value: '点击详情打开报告',
              }
            }
          };
          const msg = await sendTemplateMessage(openid, messageData);
          console.log(msg);
        }
        req.response(200, 'ok');
      } catch (err) {
        req.response(500, err);
      }
    },
  }, {
    uri: '/delete/:id',
    method: 'delete',
    mark: '删除单条记录',
    async callback(req, res) {
      const {id} = req.params;
      models.check.deleteOne({_id: id}).then(() => {
        req.response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    },
  }
]

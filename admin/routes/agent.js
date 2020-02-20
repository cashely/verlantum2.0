const models = require('../model.js');
const request = require('request');
const xml2js = require('xml2js');
const qs = require('qs');
const singFn = require('../functions/signHelper');
const {wxAppId, wxAppSecret, wxMchId} = require('../config.global');
const wxpay = require('../functions/wxpay');
console.log(wxpay)
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const conditions = {}
    models.agents.find(conditions).populate('creater').sort({updatedAt: -1}).skip((+page - 1) * limit).limit(+limit).then(agents => {
      req.response(200, agents)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, statu, contact, address, tel, price = 0, ratio = 0} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      price,
      ratio,
      creater: req.user.uid
    };
    new models.agents(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.agents.findById(id).then(puller => {
      req.response(200, puller);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.agents.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params;
    const {title, statu, contact, address, tel, price, ratio} = req.body;
    const conditions = {
      title,
      statu,
      price,
      ratio,
      contact, address, tel,
      creater: req.user.uid
    };
    models.agents.findOneAndUpdate({_id: id}, conditions).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  total(req, res) {
    const q = req.query;
    let conditions = {};
    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.agents.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  },
  qrcode(req, res) {
    const {aid, price, ratio} = req.query;
    res.render('qrcode', req.query);
  },
  qrRedirect(req, res) {
    res.render('qredirect', req.query);
  },
  alipay(req, res) {
    const {aid, price, ratio} = req.query;
    generatorOrderAction({aid, price, ratio, payChannel: 2})
    .then(orderNo => {
      // res.send(orderNo)
      res.redirect('https://openapi.alipay.com/gateway.do?'+ singFn('云量科技', orderNo, price))
    });
  },
  alipaycallback(req, res) {
    const {out_trade_no, total_amount} = req.body;
    models.orders.updateOne({orderNo: out_trade_no}, {hasPayed: 1, payTotal: total_amount * 1}).then(() => {
      return models.orders.findOne({orderNo: out_trade_no})
    }).then(order => {
      return models.agents.updateOne({_id: order.agent}, {$inc: {score: total_amount * order.agentProfit / 100}})
    }).then(() => {
      res.send('ok')
    }).catch(err => {
      console.log(err)
      res.send('failed')
    })

  },
  wxpay(req, res) {
    let {params, code} = req.query;
    params = Buffer.from(params, 'base64').toString();
    console.log(params, code);
    const {aid, price, ratio} = qs.parse(params);
    getOpenIdAction(code).then(body => {
      console.log(body, typeof body, '----code body');
      const openid = body.openid;

      generatorOrderAction({aid, price, ratio, payChannel: 1})
      .then(orderNo => {
        // res.send(orderNo)
        let appid = wxAppId;
        let mch_id = wxMchId;
        let nonce_str = wxpay.createNonceStr();
        let timestamp = wxpay.createTimeStamp();
        let body = '测试微信支付';
        let out_trade_no = String(orderNo);
        let total_fee = wxpay.getmoney(price);
        // let spbill_create_ip = req.ip.slice(req.connection.remoteAddress.lastIndexOf(':')+1);
        let spbill_create_ip = '10.101.68.93';
        let notify_url = 'https://api.verlantum.cn/auth/wxpaycallback';
        let trade_type = 'JSAPI';
        let mchkey = '773ADDFE99B6749A16D6B9E266F8A20A';

        let sign = wxpay.paysignjsapi(appid,body,mch_id,nonce_str,notify_url,out_trade_no,spbill_create_ip,total_fee,trade_type, mchkey);

        console.log('sign==',sign);

        //组装xml数据
        var formData  = "<xml>";
        formData  += "<appid>"+appid+"</appid>";  //appid
        formData  += "<body>"+body+"</body>";
        formData  += "<mch_id>"+mch_id+"</mch_id>";  //商户号
        formData  += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串，不长于32位。
        formData  += "<notify_url>"+notify_url+"</notify_url>";
        formData  += "<out_trade_no>"+out_trade_no+"</out_trade_no>";
        formData  += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>";
        formData  += "<total_fee>"+total_fee+"</total_fee>";
        formData  += "<trade_type>"+trade_type+"</trade_type>";
        formData  += "<sign>"+sign+"</sign>";
        formData  += "<openid>"+openid+"</openid>";
        formData  += "</xml>";

        console.log('formData===',formData);

        var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

        request({url:url,method:'POST',body: formData},function(err,response,body){
            if(!err && response.statusCode == 200){
                console.log(body);

                xml2js.parseString(body, {explicitArray : false}, function (errors, response) {
                    if (null !== errors) {
                        console.log(errors)
                        return;
                    }
                    console.log('长度===', response);
                    var prepay_id = response.xml.prepay_id.text();
                    console.log('解析后的prepay_id==',prepay_id);


                    //将预支付订单和其他信息一起签名后返回给前端
                    let finalsign = wxpay.paysignjsapifinal(appid,mch_id,prepay_id,nonce_str,timestamp, mchkey);

                    res.json({'appId':appid,'partnerId':mchid, 'prepayId':prepay_id,'nonceStr':nonce_str,'timeStamp':timestamp,'package':'Sign=WXPay','sign':finalsign});
                });


            }
        });
      });
      res.send('200');
    });
  },
  wxpaycallback(req, res) {
    console.log(req.body)
  },
  take(req, res) {
    const {id} = req.params;
    const {money} = req.body;
    models.agents.updateOne({_id: id}, {$inc: {score: money * -1}}).then(agent => {
      console.log(id)
      return new models.takes({agent: id, score: money, creater: req.user.uid}).save()
    }).then(res => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err);
      req.response(500, err);
    })
  }
}

const generatorOrderAction = ({aid, price, ratio, payChannel}) => {
  const orderNo = Date.now();
  return new models.orders({
    price,
    payChannel,
    agent: aid,
    agentProfit: ratio,
    orderNo
  }).save().then(() => orderNo)
}



const getOpenIdAction = (code) => {
  return new Promise((resolve, reject) => {
    request({url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxAppId}&secret=${wxAppSecret}&code=${code}&grant_type=authorization_code`,method:'GET'},function(err,response,body){
      if(!err && response.statusCode == 200){
          resolve(JSON.parse(body))
      }else {
        console.log(err)
        reject(err)
      }
    })
  })
}
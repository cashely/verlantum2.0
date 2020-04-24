var xmlreader = require("xmlreader");
var fs = require("fs");



var wxcard = {

    // 随机字符串产生函数
    createNonceStr: function () {
        return Math.random().toString(36).substr(2, 15);
    },

    // 时间戳产生函数
    createTimeStamp: function () {
        return parseInt(new Date().getTime() / 1000) + '';
    },

    //签名加密算法
    cardsignjsapi: function (coupon_stock_id, openid_count, partner_trade_no, openid, appid, mch_id, nonce_str, mchkey) {
        var ret = {
            coupon_stock_id,
            openid_count,
            partner_trade_no,
            openid,
            appid,
            mch_id,
            nonce_str
        };
        var string = raw(ret);
        var key = mchkey;
        string = string + '&key=' + key;
        console.log('string=', string);
        var crypto = require('crypto');
        return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
    }
}
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

module.exports = wxcard;

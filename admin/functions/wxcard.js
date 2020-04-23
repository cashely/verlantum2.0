var xmlreader = require("xmlreader");
var fs = require("fs");



var wxcard = {

    // 时间戳产生函数
    createTimeStamp: function () {
        return parseInt(new Date().getTime() / 1000) + '';
    },

    //签名加密算法
    cardsignjsapi: function (stock_id, send_coupon_merchant, open_id, mchkey) {
        var ret = {
            stock_id,
            out_request_no: wxcard.createTimeStamp(),
            send_coupon_merchant,
            open_id
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

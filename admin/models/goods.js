const mongoose = require('../db.config');
const m = require('moment');

const Good = new mongoose.Schema({
  title: { // 商品名称
    type: String,
    required: true
  },
  number: { // 商品编号
    type: String,
  },
  price: { // 商品价格
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  discount: { // 微信优惠券号码
    type: String
  },
  url: { // 表单地址
    type: String,
  },
  template: { // 模板名称
    type: String,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

const model = mongoose.model('goods', Good);

model.prototype.saveGood = function () {
  const { title, number, price, discount } = this;
  return new Promise((resolve, reject) => {
    model.count().then(count => {
      const good = {
        title,
        price,
        discount,
        number: number ? number : `YL-GOOD-${m().format('YYYYMMDD')}-${count+1}`
      }
      new model(good).save().then(resolve).catch(reject)
    })
  })
}

module.exports = model;

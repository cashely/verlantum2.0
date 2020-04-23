const mongoose = require('../db.config');
const m = require('moment');

const Good = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  number: {
    type: String,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  discount: {
    type: String
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

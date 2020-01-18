const mongoose = require('../db.config');

const Orders = new mongoose.Schema({
  fruit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fruits',
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  puller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pullers'
  },
  type: {
    type: Number, // 1 - 入库 2 - 出库 3 - 退货
    required: true
  },
  outerUnit: { // 出库单位
    type: Number
  },
  outerCount: {
    type: Number // 出库单位数量
  },
  reserve: {
    type: Number, // 预下单数量
    default: 0
  },
  pusher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pushers'
  },
  payStatu: {
    type: Number,
    default: 1 // 1 - 未付款 2 - 已付款 3 - 其他
  },
  payNumber: { // 已收款数量
    type: Number,
    default: 0
  },
  payTotal: { // 应收款数量
    type: Number,
    default: 0
  },
  avgPrice: { // 当前均价
    type: Number,
    default: 0
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  mark: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});
Orders.virtual('profit').get(() => { // 收益量
  return this.__profit;
}).set(() => {
  this.__profit = (this.price - this.avgPrice) * this.count;
})


Orders.set('toJSON', {
    virtuals: true
})

module.exports = mongoose.model('orders', Orders);

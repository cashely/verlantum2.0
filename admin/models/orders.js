const mongoose = require('../db.config');

const Orders = new mongoose.Schema({
  price: { // 价格
    type: Number,
    default: 0
  },
  good: { // 商品名称
    type: String,
    default: '',
  },
  payTotal: { // 付款数量
    type: Number,
    default: 0
  },
  payChannel: {
    type: Number,
    default: 0 // 0 - 线下  1 - 微信  2 - 支付宝
  },
  agent: { // 代理商id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agents',
    default: null
  },
  agentProfit: { // 代理商占比
    type: Number,
    default: 0
  },
  hasPayed: {
    type: Number,
    default: 0 // 未付款
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  mark: {
    type: String
  },
  orderNo: {
    type: String,
    default: Date.now()
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('orders', Orders);

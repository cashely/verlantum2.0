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
  goodNumber: { // 商品编号
    type: mongoose.Schema.Types.ObjectId,
    ref: 'goods',
  },
  paymentAmount: { // 付款金额
    type: Number,
    default: 0,
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
  mark: { // 订单备注
    type: String
  },
  orderNo: { // 订单号，根据时间戳生成
    type: String,
    default: Date.now()
  },
  card: { // 微信优惠券码
    type: String
  },
  phone: { // 电话
    type: String
  },
  address: { // 地址
    type: String
  },
  count: { // 数量
    type: Number,
    default: 1
  },
  username: { // 姓名
    type: String
  },
  sended: { // 是否已发货 0 - 未发货  1 - 已发货
    type: Number,
    default: 0
  },
  isTake: { // 是否收货 0 - 未收货 1 - 已收货
    type: Number,
    default: 0,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('orders', Orders);

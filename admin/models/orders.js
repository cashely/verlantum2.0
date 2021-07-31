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
  },
  card: {
    type: String
  },
  // 以下是用户需要填写的信息
  username: { // 用户名
    type: String,
    require: true,
  },
  sex: { // 性别
    type: Number,
    require: true,
  },
  phone: { // 手机号码
    type: String
  },
  address: { // 地址
    type: String
  },
  guardian: { // 监护人
    type: String,
  },
  isRequireTicket: {
    type: Number, // 是否需要发票
    default: 0,
  },
  ticketHead: {
    type: String, // 发票抬头
  },
  count: {
    type: Number,
    default: 1
  },
  sended: { // 是否已发货 0 - 未发货  1 - 已发货
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('orders', Orders);

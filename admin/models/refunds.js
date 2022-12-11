const mongoose = require('../db.config');

const Refunds = new mongoose.Schema({
  orderId: { // 订单ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orders',
  },
  goodNumber: { // 商品ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'goods',
  },
  success: { // 是否退款成功 0 - 未成功 1 - 已成功
    type: Number,
    default: 0,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('refunds', Refunds);

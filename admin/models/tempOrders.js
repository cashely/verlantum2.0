// 临时存储的表
const mongoose = require('../db.config');

const TempOrders = new mongoose.Schema({
  orderId: { // 订单ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orders',
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('tempOrders', TempOrders);

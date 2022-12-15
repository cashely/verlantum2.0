// 临时存储的表
const mongoose = require('../db.config');

const TempOrders = new mongoose.Schema({
  orderNo: { // 订单号
    type: String,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('tempOrders', TempOrders);

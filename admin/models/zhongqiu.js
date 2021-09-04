/**
 * 中秋领券
 */
 const mongoose = require('../db.config');

 const Zhongqiu = new mongoose.Schema({
  // 客户姓名
  name: {
    type: String,
    required: true
  },
  // 电话
  phone: {
    type: String,
    required: true,
  },
  // 详细地址
  address: {
    type: String,
    required: true,
  },
  // 规格 1->6 2->8
  spec: {
    type: Number,
    default: 1,
  },
  // 券号
  card: {
    type: String,
    required: true,
  },
  // 是否发货
  isSend: {
    type: Boolean,
    default: false,
  }
 }, {
   timestamps: {
     createdAt: 'createdAt',
     updatedAt: 'updatedAt'
   }
 });
 
 module.exports = mongoose.model('zhongqius', Zhongqiu);
 

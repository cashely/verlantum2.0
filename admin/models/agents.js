const mongoose = require('../db.config');

const Agents = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  good: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'goods',
  },
  discount: {
    type: String
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  score: {
    type: mongoose.Types.Decimal128,
    default: 0
  },
  ratio: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  contact: {
    type: String
  },
  tel: {
    type: String
  },
  address: {
    type: String
  },
  mark: {
    type: String
  },
  // 代理商编号
  num: {
    type: Number,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('agents', Agents);

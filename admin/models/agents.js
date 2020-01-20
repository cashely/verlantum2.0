const mongoose = require('../db.config');

const Agents = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  profit: { // 分成占比
    type: Number,
    default: 0
  },
  agentPrice: { // 代理商价格
    type: Number,
    default: 0
  },
  points: { // 代理商积分
    type: Number,
    default: 0
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
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

module.exports = mongoose.model('agents', Agents);

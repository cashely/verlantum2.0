const mongoose = require('../db.config');

const Outers = new mongoose.Schema({
  fruit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fruits'
  },
  count: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
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

module.exports = mongoose.model('outers', Outers);

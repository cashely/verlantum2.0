const mongoose = require('../db.config');

const Pushers = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
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

module.exports = mongoose.model('pushers', Pushers);

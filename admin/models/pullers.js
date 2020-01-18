const mongoose = require('../db.config');

const Pullers = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
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
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('pullers', Pullers);

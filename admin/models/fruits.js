const mongoose = require('../db.config');

const Fruits = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  outerPrice: {
    type: Number,
    default: 0
  },
  innerPrice: {
    type: Number,
    default: 0
  },
  avgPrice: {
    type: Number,
    default: 0,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'units'
  },
  total: {
    type: Number,
    default: 0
  },
  isCreated: {
    type: Boolean,
    default: true
  },
  min: { // 最小存量报警
    type: Number,
    default: 1000
  },
  warn: {
    type: Number,
    default: 2
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

module.exports = mongoose.model('fruits', Fruits);

const mongoose = require('../db.config');

const Activity = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  num: {
    type: String,
    required: true
  },
  winItem: { // 中奖编号
    type: Number,
    default: 0
  },
  company: { // 中奖编号
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('activitys', Activity);

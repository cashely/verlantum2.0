const mongoose = require('../db.config');

const Wxorder = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  openId: {
    type: String,
  },
  total: {
    type: Number,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('wxorder', Wxorder);

const mongoose = require('../db.config');

const Custom = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  card: {
    type: String,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('customs', Custom);

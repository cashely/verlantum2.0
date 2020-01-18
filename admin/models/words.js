const mongoose = require('../db.config');

const Words = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('words', Words);

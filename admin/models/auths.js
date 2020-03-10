const mongoose = require('../db.config');
const Auths = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  title: {
    type: String
  },
  method: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

module.exports = mongoose.model('auths', Auths)

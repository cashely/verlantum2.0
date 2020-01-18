const mongoose = require('../db.config');

const Nodes = new mongoose.Schema({
  case: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cases'
  },
  nodes: {
    type: [new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      type: {
        type: Number,
        default: 0
      }
    })],
    default: []
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('nodes', Nodes);

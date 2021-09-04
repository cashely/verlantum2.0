/**
 * 券号管理
 */
 const mongoose = require('../db.config');

 const Mathcard = new mongoose.Schema({
  // 券号
  number: {
    type: String,
    required: true
  },
 }, {
   timestamps: {
     createdAt: 'createdAt',
     updatedAt: 'updatedAt'
   }
 });
 
 module.exports = mongoose.model('mathcard', Mathcard);
 

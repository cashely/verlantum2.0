/**
 * 发票Schema
 */

 const mongoose = require('../db.config');

 const Ticket = new mongoose.Schema({
   /**
    * 发票类型
    * 0 个人
    * 1 机构
    */
   type: {
    type: Number,
    default: 0,  
   },
   /**
    * 发票抬头
    */
   head: {
     type: String,
   },
   /**
    * 纳税人
    */
   name: {
     type: String,
   },
   /**
    * 发票金额
    * 单位分
    * 1元 === 100
    */
   amount: {
    type: Number,
   },
   /**
    * 关联订单Id
    */
   orderId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'orders',
   },
   /**
    * 是否已开
    */
   isOffer: {
    type: Boolean,
    default: false,
   },
   /**
    * 备注信息
    */
   mark: {
    type: String,
   },
 }, {
   timestamps: {
     createdAt: 'createdAt',
     updatedAt: 'updatedAt'
   }
 });
 
 module.exports = mongoose.model('tickets', Ticket);
 
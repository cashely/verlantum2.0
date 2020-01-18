const mongoose = require('../db.config');

let Units = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  weight: { // 此单位转换为斤是多少
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

Units = mongoose.model('units', Units)

Units.find().then(units => {
  if(!units.length) {
    console.log('创建初始单位库');
    Units.create(['斤','箱', '个', '份', '包'].map(v => ({title: v}))).then(() => {
      console.log('单位库初始化完毕');
    }).catch(err => {
      console.log(err, '单位库初始化错误');
    })
  }
})
module.exports = Units;

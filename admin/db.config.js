const mongoose = require('mongoose')
mongoose.promise = Promise
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://127.0.0.1:27017/fruit_store_system_dev', {
    useNewUrlParser: true
})

mongoose.connection.on('open', (err, result) => {
    if(err) {
        return null;
    }
    console.log('打开数据库成功!')
})
module.exports = mongoose

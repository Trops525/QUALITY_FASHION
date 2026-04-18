const mongoose = require('mongoose');

const cskhSchema = new mongoose.Schema({
    DanhMuc: String,
    CauHoi: String,
    TraLoi: String,
    TrangThai: Number,
    ThuTu: Number
}, 
{ 
    collection: 'cskh' 
});

module.exports = mongoose.model('CSKH', cskhSchema);
const mongoose = require('mongoose');

const danhmucSchema = new mongoose.Schema({
    TenDanhMuc: { type: String }, // Giữ lại trường này để không bị lỗi các form thêm/sửa cũ
    tenDanhMuc: { type: String }  // Thêm trường này để tương thích với dữ liệu mới
});
module.exports = mongoose.model('danhmuc', danhmucSchema);
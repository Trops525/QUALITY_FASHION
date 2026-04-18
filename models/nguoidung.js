const mongoose = require('mongoose');

const nguoiDungSchema = new mongoose.Schema({
    HoTen: { type: String, required: true },
    TenDangNhap: { type: String, required: true, unique: true },
    MatKhau: { type: String, required: true },
    Email: { type: String, required: true },
    DienThoai: { type: String, required: true },
    DiaChi: { type: String, default: '' },
    QuyenHan: { type: Number, default: 2 }, // 1: Admin, 2: Khách hàng, 3: Nhân viên
    Khoa: { type: Number, default: 0 }      // 0: Hoạt động, 1: Bị khóa
});

module.exports = mongoose.model('NguoiDung', nguoiDungSchema);
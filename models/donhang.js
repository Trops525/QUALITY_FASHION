const mongoose = require('mongoose');

const donHangSchema = new mongoose.Schema({
    khachHang: {
        hoTen: String,
        email: String,
        dienThoai: String,
        diaChi: String
    },
    idNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' },
    tongTien: Number,
    phuongThucThanhToan: { type: String, default: 'COD' },
    tinhTrang: { type: String, default: 'Đang xử lý' },
    ghiChu: String,
    ngayDat: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonHang', donHangSchema);
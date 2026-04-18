const mongoose = require('mongoose');

const chiTietSchema = new mongoose.Schema({
    idDonHang: { type: mongoose.Schema.Types.ObjectId, ref: 'DonHang' }, // Sợi dây liên kết
    idSanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'sanpham' },
    tenSanPham: String,
    hinhAnh: String,
    mauSac: String,
    kichThuoc: String,
    soLuong: Number,
    giaNhap: { type: Number, required: true },
    donGia: Number,
    thanhTien: Number
});

module.exports = mongoose.model('ChiTietDonHang', chiTietSchema);
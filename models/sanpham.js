const mongoose = require('mongoose');

// Định nghĩa cấu trúc Biến thể lồng bên trong
const bientheSchema = new mongoose.Schema({
    mauSac: { type: String, required: true },
    kichThuoc: { type: String },
    soLuong: { type: Number, default: 0 }
});

// Định nghĩa cấu trúc Đánh giá
const danhGiaSchema = new mongoose.Schema({
    idNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'nguoidung' },
    tenNguoiDung: { type: String },
    noiDung: { type: String, required: true },
    soSao: { type: Number, required: true, min: 1, max: 5 },
    ngayDanhGia: { type: Date, default: Date.now }
});

// Định nghĩa cấu trúc Sản phẩm
const sanphamSchema = new mongoose.Schema({
    maSanPham: { type: String },
    tenSanPham: { type: String, required: true },
    giaNhap: { type: Number, default: 0 },
    donGia: { type: Number, required: true },
    tiLeGiamGia: { type: Number, default: 0 },
    hinhAnh: { type: String },
    gioiTinh: { type: String },
    moTa: { type: String },
    luotMua: { type: Number, default: 0 },
    idDanhMuc: { type: mongoose.Schema.Types.ObjectId, ref: 'danhmuc' },
    // Gom biến thể lại ở đây
    bienThe: [bientheSchema],
    danhGia: [danhGiaSchema]
}, { timestamps: true });

module.exports = mongoose.model('sanpham', sanphamSchema);
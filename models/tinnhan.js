const mongoose = require('mongoose');

const tinNhanSchema = new mongoose.Schema({
    idNguoiGui: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' }, // ID người gửi
    idNguoiNhan: { type: String, default: 'admin' }, // Mặc định gửi cho admin hoặc ID khách
    noiDung: { type: String, required: true },
    nguoiGui: { type: String, enum: ['user', 'admin'] }, // Phân biệt ai gửi
}, { timestamps: true }); // Tự động lưu thời gian nhắn

module.exports = mongoose.model('TinNhan', tinNhanSchema);
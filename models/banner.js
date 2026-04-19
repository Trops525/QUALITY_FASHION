const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    hinhAnh: { type: String, required: true },
    thuTu: { type: Number, default: 0 },
    trangThai: { type: Number, default: 1 }
});

module.exports = mongoose.model('Banner', bannerSchema);
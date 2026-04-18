const express = require('express');
const router = express.Router();
const SanPham = require('../models/sanpham');

// GET: Xử lý hiển thị Trang chủ
router.get('/', async (req, res) => {
    try {
        // 1. Lấy các tham số từ URL (giống $_GET trong PHP)
        const page = parseInt(req.query.page) || 1;
        const limit = 12; // Hiển thị 12 sản phẩm mỗi trang như file cũ
        const q = req.query.q ? req.query.q.trim() : '';
        const gender = req.query.gender || '';

        // 2. Xây dựng bộ lọc (Filter)
        let filter = {};
        if (gender) {
            filter.gioiTinh = gender;
        }
        if (q) {
            // Tìm kiếm không phân biệt hoa thường
            filter.tenSanPham = { $regex: q, $options: 'i' };
        }

        // 3. Tính toán phân trang
        const totalItems = await SanPham.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;

        // 4. Truy vấn sản phẩm từ MongoDB
        const sanpham = await SanPham.find(filter)
            .sort({ _id: -1 }) // Sản phẩm mới nhất lên đầu
            .skip(skip)
            .limit(limit);

        // 5. Gửi dữ liệu sang file EJS để hiển thị
        res.render('index', {
            title: 'Trang chủ - QUALITY Fashion',
            sanpham: sanpham,
            currentPage: page,
            totalPages: totalPages,
            query: req.query,
            session: req.session || {}
        });
    } catch (err) {
        console.error('Lỗi trang chủ:', err);
        res.status(500).send('Lỗi máy chủ');
    }
});

module.exports = router;
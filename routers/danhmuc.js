var express = require('express');
var router = express.Router();
var DanhMuc = require('../models/danhmuc');

// GET: Lấy danh sách Danh mục và hiển thị
router.get('/', async (req, res) => {
    try {
        var dm = await DanhMuc.find(); // Lấy toàn bộ dữ liệu từ bảng Danh Mục
        res.render('danhmuc', {
            title: 'Quản lý Danh Mục - QUALITY',
            danhmuc: dm
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi lấy dữ liệu');
    }
});
// 1. GET: Nhận yêu cầu và hiển thị giao diện Form thêm mới
router.get('/them', (req, res) => {
    res.render('danhmuc_them', { title: 'Thêm Danh Mục - QUALITY' });
});

// 2. POST: Nhận dữ liệu từ Form gửi lên và lưu vào MongoDB
router.post('/them', async (req, res) => {
    try {
        // Lấy chữ mà người dùng vừa gõ vào ô input có name="TenDanhMuc"
        var data = {
            TenDanhMuc: req.body.TenDanhMuc 
        };
        
        // Lệnh này đẩy thẳng dữ liệu lên MongoDB Atlas
        await DanhMuc.create(data); 
        
        // Lưu thành công thì tự động quay về trang danh sách
        res.redirect('/danhmuc'); 
    } catch (err) {
        console.log(err);
        res.send('Có lỗi xảy ra khi lưu danh mục!');
    }
});

// --- XỬ LÝ SỬA DANH MỤC ---
// 1. GET: Lấy thông tin danh mục cũ hiển thị lên Form
router.get('/sua/:id', async (req, res) => {
    try {
        var id = req.params.id;
        var dm = await DanhMuc.findById(id); // Tìm đúng danh mục theo ID
        res.render('danhmuc_sua', { title: 'Sửa Danh Mục - QUALITY', danhmuc: dm });
    } catch (err) {
        console.log(err);
        res.send('Lỗi tải trang sửa');
    }
});

// 2. POST: Cập nhật dữ liệu mới lên MongoDB
router.post('/sua/:id', async (req, res) => {
    try {
        var id = req.params.id;
        var data = { TenDanhMuc: req.body.TenDanhMuc };
        await DanhMuc.findByIdAndUpdate(id, data); // Lệnh cập nhật
        res.redirect('/danhmuc');
    } catch (err) {
        console.log(err);
        res.send('Lỗi cập nhật danh mục');
    }
});

// --- XỬ LÝ XÓA DANH MỤC ---
// 3. GET: Xóa danh mục theo ID
router.get('/xoa/:id', async (req, res) => {
    try {
        var id = req.params.id;
        await DanhMuc.findByIdAndDelete(id); // Lệnh xóa
        res.redirect('/danhmuc');
    } catch (err) {
        console.log(err);
        res.send('Lỗi xóa danh mục');
    }
});

module.exports = router;
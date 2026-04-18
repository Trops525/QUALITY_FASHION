var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var NguoiDung = require('../models/nguoidung');

// Hàm kiểm tra đăng nhập (Middleware)
const requireLogin = (req, res, next) => {
    if (!req.session.MaNguoiDung) {
        return res.redirect('/dangnhap');
    }
    next();
};

// 1. GET: HIỂN THỊ TRANG TÀI KHOẢN
router.get('/', requireLogin, async (req, res) => {
    try {
        let user = await NguoiDung.findById(req.session.MaNguoiDung);
        res.render('taikhoan', {
            title: 'Tài khoản của tôi - QUALITY Fashion',
            user: user,
            session: req.session
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi tải trang tài khoản!');
    }
});

// 2. POST: XỬ LÝ CẬP NHẬT THÔNG TIN
router.post('/capnhat', requireLogin, async (req, res) => {
    try {
        await NguoiDung.findByIdAndUpdate(req.session.MaNguoiDung, {
            HoTen: req.body.HoTen,
            Email: req.body.Email,
            DienThoai: req.body.DienThoai,
            DiaChi: req.body.DiaChi
        });
        
        // Cập nhật lại tên trong session nếu họ đổi tên
        req.session.HoVaTen = req.body.HoTen; 
        req.session.success = 'Cập nhật thông tin thành công!';
        res.redirect('/taikhoan');
    } catch (err) {
        req.session.error = 'Có lỗi xảy ra khi cập nhật thông tin.';
        res.redirect('/taikhoan');
    }
});

// 3. POST: XỬ LÝ ĐỔI MẬT KHẨU
router.post('/doimatkhau', requireLogin, async (req, res) => {
    try {
        let user = await NguoiDung.findById(req.session.MaNguoiDung);
        
        // Kiểm tra mật khẩu cũ
        if (!bcrypt.compareSync(req.body.MatKhauCu, user.MatKhau)) {
            req.session.error = 'Mật khẩu cũ không chính xác!';
            return res.redirect('/taikhoan');
        }

        // Kiểm tra xác nhận mật khẩu
        if (req.body.MatKhauMoi !== req.body.XacNhanMatKhau) {
            req.session.error = 'Mật khẩu mới và xác nhận không khớp!';
            return res.redirect('/taikhoan');
        }

        // Mã hóa và lưu mật khẩu mới
        var salt = bcrypt.genSaltSync(10);
        user.MatKhau = bcrypt.hashSync(req.body.MatKhauMoi, salt);
        await user.save();

        req.session.success = 'Đổi mật khẩu thành công!';
        res.redirect('/taikhoan');
    } catch (err) {
        req.session.error = 'Có lỗi xảy ra khi đổi mật khẩu.';
        res.redirect('/taikhoan');
    }
});

module.exports = router;
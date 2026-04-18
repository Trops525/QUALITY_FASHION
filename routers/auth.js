var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var NguoiDung = require('../models/nguoidung');

// GET: Hiển thị form Đăng ký
router.get('/dangky', (req, res) => {
    return res.render('dangky', { title: 'Đăng ký - QUALITY Fashion' });
});

// POST: Xử lý Đăng ký
router.post('/dangky', async (req, res) => {
    try {
        var checkUser = await NguoiDung.findOne({ TenDangNhap: req.body.TenDangNhap });
        if (checkUser) {
            req.session.swal = { icon: 'error', title: 'Đăng ký thất bại', text: 'Tên đăng nhập đã tồn tại!' };
            return res.redirect('/dangky');
        }

        var salt = bcrypt.genSaltSync(10);
        var data = {
            HoTen: req.body.HoTen,
            TenDangNhap: req.body.TenDangNhap,
            Email: req.body.Email,
            DienThoai: req.body.DienThoai,
            MatKhau: bcrypt.hashSync(req.body.MatKhau, salt),
            QuyenHan: 2, 
            Khoa: 0     
        };

        await NguoiDung.create(data);
        req.session.swal = { icon: 'success', title: 'Thành công', text: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.' };
        return res.redirect('/dangnhap');
    } catch (err) {
        console.log(err);
        req.session.swal = { icon: 'error', title: 'Lỗi', text: 'Lỗi đăng ký: ' + err.message };
        return res.redirect('/dangky');
    }
});

// GET: Hiển thị form Đăng nhập
router.get('/dangnhap', (req, res) => {
    return res.render('dangnhap', { 
        title: 'Đăng nhập - QUALITY Fashion', 
        returnUrl: req.query.returnUrl || ''
    });
});

// POST: Xử lý Đăng nhập 
router.post('/dangnhap', async (req, res) => {
    try {
        var user = await NguoiDung.findOne({ TenDangNhap: req.body.TenDangNhap });
        
        // Kiểm tra mật khẩu bằng bcrypt.compareSync
        if (user && bcrypt.compareSync(req.body.MatKhau, user.MatKhau)) {
            if (user.Khoa == 1) {
                req.session.error = 'Tài khoản của bạn đã bị khóa!';
                return res.redirect('/dangnhap');
            }

            // Gán Session
            req.session.MaNguoiDung = user._id;
            req.session.HoVaTen = user.HoTen;
            req.session.QuyenHan = user.QuyenHan; // Trường này để Header hiện nút Quản lý
            req.session.Email = user.Email;
            
            let linkQuayVe = req.body.returnUrl || '/';
            req.session.swal = { icon: 'success', title: 'Thành công', text: 'Chào mừng ' + user.HoTen + ' đã quay trở lại!' };
            return res.redirect(linkQuayVe);
        } else {
            req.session.error = 'Tên tài khoản hoặc mật khẩu không đúng!';
            return res.redirect('/dangnhap');
        }
    } catch (err) {
        console.log(err);
        req.session.error = 'Lỗi hệ thống khi đăng nhập!';
        return res.redirect('/dangnhap');
    }
});

// GET: Đăng logout
router.get('/dangxuat', (req, res) => {
    req.session.destroy(); 
    return res.status(200).clearCookie('QUALITY_Session').redirect('/');
});

module.exports = router;
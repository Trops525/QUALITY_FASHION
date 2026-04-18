var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var NguoiDung = require('../models/nguoidung');

// GET: Hiển thị form Đăng ký
router.get('/dangky', (req, res) => {
    let alertMsg = req.session.swal || null;
    let errorMsg = req.session.error || null;
    let successMsg = req.session.success || null;
    let oldData = req.session.oldData || {}; // Khôi phục dữ liệu đã nhập
    let errorField = req.session.errorField || null; // Khôi phục trường bị lỗi

    req.session.swal = null; // Xóa thông báo khỏi bộ nhớ sau khi lấy ra
    req.session.error = null;
    req.session.success = null;
    req.session.oldData = null;
    req.session.errorField = null;

    req.session.save((err) => { // Ép lưu session trước khi render để tránh mất thông báo
        return res.render('dangky', { title: 'Đăng ký - QUALITY Fashion', session: req.session, alertMsg, errorMsg, successMsg, oldData, errorField });
    });
});

// POST: Xử lý Đăng ký
router.post('/dangky', async (req, res) => {
    try {
        const { HoTen, TenDangNhap, Email, DienThoai, MatKhau } = req.body;
        const oldData = { HoTen, TenDangNhap, Email, DienThoai };

        // 1. Kiểm tra dữ liệu (Dùng res.render để báo lỗi ngay lập tức)
        if (TenDangNhap.length <= 3) {
            return res.render('dangky', { 
                title: 'Đăng ký - QUALITY Fashion',
                alertMsg: { icon: 'error', title: 'Lỗi', text: 'Tên đăng nhập phải dài hơn 3 ký tự!' },
                oldData 
            });
        }
        
        if (MatKhau.length <= 4) {
            return res.render('dangky', { 
                title: 'Đăng ký - QUALITY Fashion',
                alertMsg: { icon: 'error', title: 'Lỗi', text: 'Mật khẩu phải dài hơn 4 ký tự!' },
                oldData 
            });
        }

        // 2. Kiểm tra trùng lặp trong Database
        const checkUser = await NguoiDung.findOne({ TenDangNhap });
        if (checkUser) {
            return res.render('dangky', { 
                title: 'Đăng ký - QUALITY Fashion',
                alertMsg: { icon: 'error', title: 'Thất bại', text: 'Tên đăng nhập đã tồn tại!' },
                oldData
            });
        }
        
        const checkPhone = await NguoiDung.findOne({ DienThoai });
        if (checkPhone) {
            return res.render('dangky', { 
                title: 'Đăng ký - QUALITY Fashion',
                alertMsg: { icon: 'error', title: 'Thất bại', text: 'Số điện thoại này đã được sử dụng!' },
                oldData
            });
        }

        const checkEmail = await NguoiDung.findOne({ Email });
        if (checkEmail) {
            return res.render('dangky', { 
                title: 'Đăng ký - QUALITY Fashion',
                alertMsg: { icon: 'error', title: 'Thất bại', text: 'Email này đã được đăng ký!' },
                oldData
            });
        }

        // 3. Mã hóa mật khẩu và lưu
        var salt = bcrypt.genSaltSync(10);
        var data = {
            HoTen, TenDangNhap, Email, DienThoai,
            MatKhau: bcrypt.hashSync(MatKhau, salt),
            QuyenHan: 2, Khoa: 0     
        };

        await NguoiDung.create(data);

        // 4. HIỂN THỊ THÀNH CÔNG NGAY LẬP TỨC (Dùng res.render để chắc chắn 100% hiện thông báo)
        return res.render('dangky', { 
            title: 'Đăng ký - QUALITY Fashion',
            alertMsg: { icon: 'success', title: 'Thành công', text: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.' },
            oldData: {}
        });

    } catch (err) {
        console.log(err);
        res.render('dangky', { 
            title: 'Đăng ký - QUALITY Fashion',
            alertMsg: { icon: 'error', title: 'Lỗi hệ thống', text: err.message },
            oldData: req.body 
        });
    }
});

// GET: Hiển thị form Đăng nhập
router.get('/dangnhap', (req, res) => {
    let alertMsg = req.session.swal || null;
    let errorMsg = req.session.error || null;
    let successMsg = req.session.success || null;
    req.session.swal = null;
    req.session.error = null;
    req.session.success = null;
    return res.render('dangnhap', { 
        title: 'Đăng nhập - QUALITY Fashion', 
        returnUrl: req.query.returnUrl || '',
        session: req.session,
        alertMsg,
        errorMsg,
        successMsg
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
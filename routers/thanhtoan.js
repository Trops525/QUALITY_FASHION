var express = require('express');
var router = express.Router();
var SanPham = require('../models/sanpham');
var NguoiDung = require('../models/nguoidung');
var DonHang = require('../models/donhang');
var ChiTietDonHang = require('../models/chitietdonhang'); 
// GET: Hiển thị trang thanh toán (Giữ nguyên hoặc cập nhật nếu cần)
router.get('/', async (req, res) => {
    if (!req.session.MaNguoiDung) return res.redirect('/dangnhap');

    let type = req.query.type; 
    let cart = (type === 'buynow') ? req.session.buy_now_cart : req.session.cart;

    if (!cart || Object.keys(cart).length === 0) return res.redirect('/giohang');

    let items = [];
    let total = 0;
    
    for (let key in cart) {
        let [id, mau, size] = key.split('_');
        let sp = await SanPham.findById(id);
        if (sp) {
            let giaBan = sp.donGia - (sp.donGia * (sp.tiLeGiamGia || 0) / 100);
            let thanhTien = giaBan * cart[key];
            total += thanhTien;
            items.push({ ten: sp.tenSanPham, hinhAnh: sp.hinhAnh, mauSac: mau, kichThuoc: size, soLuong: cart[key], thanhTien });
        }
    }

    let user = await NguoiDung.findById(req.session.MaNguoiDung);

    res.render('thanhtoan', {
        title: 'Thanh toán - QUALITY Fashion',
        items, total, user, type, session: req.session
    });
});

// POST: Xử lý đặt hàng
router.post('/', async (req, res) => {
    try {
        let { diaChi, dienThoai, ghiChu, phuongThuc, checkout_type } = req.body;
        let cart = (checkout_type === 'buynow') ? req.session.buy_now_cart : req.session.cart;

        // 1. Tính tổng tiền và LẤY GIÁ NHẬP
        let total = 0;
        let orderDetails = [];
        for (let key in cart) {
            let [id, mau, size] = key.split('_');
            let sp = await SanPham.findById(id);
            
            if (sp) {
                let gia = sp.donGia - (sp.donGia * (sp.tiLeGiamGia || 0) / 100);
                total += gia * cart[key];
                
                // LƯU Ý: Thêm sp.giaNhap vào đây để dùng ở bước sau
                orderDetails.push({ 
                    id, 
                    mau, 
                    size, 
                    qty: cart[key], 
                    gia, 
                    giaNhapHienTai: sp.giaNhap || 0 // Đây chính là "sanPhamGoc" bạn cần tìm
                });
            }
        }

        // 2. Lưu Đơn hàng
        let moi = await DonHang.create({
        idNguoiDung: req.session.MaNguoiDung,
        tongTien: total, 
        khachHang: {
            diaChi: diaChi,
            dienThoai: dienThoai
        },
        ghiChu, 
        phuongThucThanhToan: phuongThuc
    });

        // 3. Lưu Chi tiết đơn hàng 
        for (let item of orderDetails) {
            await ChiTietDonHang.create({
                idDonHang: moi._id, 
                idSanPham: item.id, 
                mauSac: item.mau, 
                kichThuoc: item.size, 
                soLuong: item.qty, 
                donGia: item.gia, 
                thanhTien: item.gia * item.qty,
                giaNhap: item.giaNhapHienTai 
            });
        }

        // 4. Xóa giỏ hàng
        if (checkout_type === 'buynow') {
            delete req.session.buy_now_cart;
        } else {
            delete req.session.cart;
        }

        req.session.success = 'Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.';
        res.redirect('/donhang');
    } catch (err) {
        // Log lỗi chi tiết ra console để Quân dễ debug nếu còn sai
        console.error(err);
        res.send('Lỗi đặt hàng: ' + err.message);
    }
});

module.exports = router;
var express = require('express');
var router = express.Router();
var DonHang = require('../models/donhang');
var ChiTietDonHang = require('../models/chitietdonhang');
var SanPham = require('../models/sanpham');

router.get('/', async (req, res) => {
    // 1. Kiểm tra đăng nhập
    if (!req.session.MaNguoiDung) return res.redirect('/dangnhap');

    let userId = req.session.MaNguoiDung;
    let tab = req.query.tab || 'active';
    let action = req.query.action;
    let orderId = req.query.id;

    // 2. Xử lý các hành động (Hủy đơn, Nhận hàng...)
    if (action && orderId) {
        try {
            let order = await DonHang.findOne({ _id: orderId, idNguoiDung: userId });
            if (order) {
                // Khách chỉ được hủy khi đơn còn 'Đang xử lý'
                if (action === 'cancel' && order.tinhTrang === 'Đang xử lý') {
                    order.tinhTrang = 'Đã hủy';
                    req.session.success = 'Đã hủy đơn hàng thành công.';
                    tab = 'history'; // Chuyển sang tab Lịch sử để xem đơn đã hủy
                } 
                // Khách nhấn 'Đã nhận' khi đơn đang 'Đang giao' hoặc 'Đã xác nhận'
                else if (action === 'danhan' && (order.tinhTrang === 'Đang giao' || order.tinhTrang === 'Đã xác nhận')) {
                    order.tinhTrang = 'Đã giao';
                    
                    // Lượt mua đã được cập nhật khi Admin duyệt đơn.
                    req.session.success = 'Đã xác nhận nhận hàng. Cảm ơn bạn!';
                    tab = 'history'; // Chuyển sang tab Lịch sử để xem đơn đã giao
                }
                // Khách nhấn 'Trả hàng/Hoàn tiền' khi đơn đã giao xong
                else if (action === 'trahang' && order.tinhTrang === 'Đã giao') {
                    //  "Yêu cầu trả hàng
                    order.tinhTrang = 'Yêu cầu trả hàng';
                    req.session.success = 'Đã gửi yêu cầu trả hàng. Vui lòng chờ Cửa hàng xác nhận!';
                    tab = 'history'; // Ép buộc ở lại tab Lịch sử
                }
                await order.save();
            }
        } catch (err) { console.log(err); }
        // Sau khi xử lý xong, chuyển về đúng tab hiện tại để khách thấy kết quả
        return res.redirect('/donhang?tab=' + tab);
    }

    // 3. PHÂN LOẠI TAB 
    let condition = { idNguoiDung: userId };
    if (tab === 'history') {
        // Tab Lịch sử: Hiện đơn đã kết thúc
        condition.tinhTrang = { $in: ['Đã giao', 'Đã hủy', 'Đã trả hàng', 'Từ chối trả hàng', 'Yêu cầu trả hàng'] };
    } else {
        // Tab Đơn hàng: Hiện các đơn đang chạy 
        condition.tinhTrang = { $in: ['Đang xử lý', 'Đã xác nhận', 'Đang giao'] };
    }

    // 4. Lấy dữ liệu và nối bảng (Populate)
    try {
       
        // Lấy danh sách đơn hàng
        const donHangs = await DonHang.find(condition).sort({ ngayDat: -1 }).lean();

        // Tối ưu: Lấy tất cả chi tiết đơn hàng trong 1 lần query
        const orderIds = donHangs.map(dh => dh._id);
        const allChiTiet = await ChiTietDonHang.find({ idDonHang: { $in: orderIds } })
            .populate('idSanPham')
            .lean();

        // Ghép chi tiết vào từng đơn hàng tương ứng
        donHangs.forEach(dh => {
            dh.chiTiets = allChiTiet.filter(ct => ct.idDonHang.toString() === dh._id.toString());
        });

        res.render('donhang', {
            title: 'Đơn hàng của tôi - QUALITY Fashion',
            donHangs: donHangs,
            tab: tab,
            session: req.session
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi chi tiết: ' + err.message);
    }
});

// POST: Xử lý cập nhật thông tin đơn hàng (Chỉ khi đang xử lý)
router.post('/capnhat/:id', async (req, res) => {
    if (!req.session.MaNguoiDung) return res.redirect('/dangnhap');
    
    try {
        let order = await DonHang.findOne({ _id: req.params.id, idNguoiDung: req.session.MaNguoiDung });
        
        if (order && order.tinhTrang === 'Đang xử lý') {
            order.khachHang.diaChi = req.body.diaChi;
            order.khachHang.dienThoai = req.body.dienThoai;
            await order.save();
            req.session.success = 'Cập nhật thông tin nhận hàng thành công!';
        } else {
            req.session.error = 'Đơn hàng này không thể cập nhật thông tin nữa!';
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect('/donhang?tab=active');
});

module.exports = router;
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
                } 
                // Khách nhấn 'Đã nhận' khi đơn đang 'Đang giao' hoặc 'Đã xác nhận'
                else if (action === 'danhan' && (order.tinhTrang === 'Đang giao' || order.tinhTrang === 'Đã xác nhận')) {
                    order.tinhTrang = 'Đã giao';
                    
                    // Lượt mua đã được cập nhật khi Admin duyệt đơn, không cần cập nhật ở đây nữa.
                    req.session.success = 'Đã xác nhận nhận hàng. Cảm ơn bạn!';
                }
                // Khách nhấn 'Trả hàng/Hoàn tiền' khi đơn đã giao xong
                else if (action === 'trahang' && order.tinhTrang === 'Đã giao') {
                    // CHỈNH SỬA: Chuyển sang "Yêu cầu trả hàng" thay vì trừ kho ngay lập tức
                    order.tinhTrang = 'Yêu cầu trả hàng';
                    req.session.success = 'Đã gửi yêu cầu trả hàng. Vui lòng chờ Cửa hàng xác nhận!';
                }
                await order.save();
            }
        } catch (err) { console.log(err); }
        // Sau khi xử lý xong, chuyển về đúng tab hiện tại để khách thấy kết quả
        return res.redirect('/donhang?tab=' + tab);
    }

    // 3. PHÂN LOẠI TAB (SỬA LẠI Ở ĐÂY)
    let condition = { idNguoiDung: userId };
    if (tab === 'history') {
        // Tab Lịch sử: Hiện đơn đã kết thúc
        condition.tinhTrang = { $in: ['Đã giao', 'Đã hủy', 'Đã trả hàng', 'Từ chối trả hàng'] };
    } else {
        // Tab Đơn hàng: Hiện các đơn đang chạy 
        condition.tinhTrang = { $in: ['Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Yêu cầu trả hàng'] };
    }

    // 4. Lấy dữ liệu và nối bảng (Populate)
    try {
        // Sử dụng .lean() để tăng tốc độ truy vấn
        let donHangs = await DonHang.find(condition).sort({ ngayDat: -1 }).lean();
        
        for (let dh of donHangs) {
            // Lấy chi tiết đơn hàng và thông tin sản phẩm đi kèm
            dh.chiTiets = await ChiTietDonHang.find({ idDonHang: dh._id })
                .populate('idSanPham') 
                .lean();
        }

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
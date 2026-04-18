var express = require('express');
var router = express.Router();

// Gọi model CSKH vừa tạo 
var CSKH = require('../models/cskh'); 

router.get('/', async (req, res) => {
    try {
        // Chỉ lấy những câu hỏi có Trahai ngT= 1 và sắp xếp tăng dần theo ThuTu
        let danhSachFAQ = await CSKH.find({ TrangThai: 1 }).sort({ ThuTu: 1 });

        res.render('cskh', {
            title: 'Chăm sóc khách hàng - QUALITY Fashion',
            session: req.session,
            faqs: danhSachFAQ // Gửi data ra ngoài giao diện
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi tải dữ liệu CSKH!');
    }
});

module.exports = router;
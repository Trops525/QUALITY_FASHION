var express = require('express');
var router = express.Router();
var SanPham = require('../models/sanpham'); 
var DanhMuc = require('../models/danhmuc'); 
var NguoiDung = require('../models/nguoidung');
var DonHang = require('../models/donhang');
var ChiTietDonHang = require('../models/chitietdonhang');

// GET: Hiển thị danh sách sản phẩm cho User
router.get('/', async (req, res) => {
    try {
        var dm = await DanhMuc.find(); 
        
        // Pagination
        var page = parseInt(req.query.page) || 1;
        var limit = 12;
        
        // Filtering
        var filter = {};
        
        if (req.query.danhMuc) {
            filter.idDanhMuc = req.query.danhMuc;
        }
        if (req.query.gioiTinh) {
            filter.gioiTinh = req.query.gioiTinh;
        }
        if (req.query.khoangGia) {
            const priceRange = req.query.khoangGia;
            if (priceRange === 'duoi-200k') filter.donGia = { $lt: 200000 };
            else if (priceRange === '200k-400k') filter.donGia = { $gte: 200000, $lte: 400000 };
            else if (priceRange === 'tren-400k') filter.donGia = { $gt: 400000 };
        }

        if (req.query.mauSac) {
            filter['bienThe.mauSac'] = req.query.mauSac; 
        }

        if (req.query.sort === 'dang-sale') {
            filter.tiLeGiamGia = { $gt: 0 };
        }

        // Sorting
        var sortCondition = { _id: -1 }; // Mới nhất by default
        if (req.query.sort === 'ban-chay') sortCondition = { luotMua: -1 };
        else if (req.query.sort === 'gia-thap-cao') sortCondition = { donGia: 1 };
        else if (req.query.sort === 'gia-cao-thap') sortCondition = { donGia: -1 };
        
        // Count total for pagination
        var totalProducts = await SanPham.countDocuments(filter);
        var totalPages = Math.max(1, Math.ceil(totalProducts / limit));
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var sp = await SanPham.find(filter)
            .populate('idDanhMuc')
            .sort(sortCondition)
            .skip((page - 1) * limit)
            .limit(limit);
        
        res.render('sanpham', { 
            title: 'Sản phẩm - QUALITY Fashion', 
            sanpham: sp,
            danhmuc: dm,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts,
            query: req.query, 
            session: req.session || {} 
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi lấy dữ liệu sản phẩm!');
    }
});

// GET: Xem chi tiết sản phẩm
router.get('/chitiet/:id', async (req, res) => {
    try {
        var id = req.params.id;
        // 1. Lấy thông tin sản phẩm đang xem
        var sp = await SanPham.findById(id).populate('idDanhMuc');
        
        if (!sp) {
            return res.send('Không tìm thấy sản phẩm này!');
        }

        // 2. TÌM CÁC SẢN PHẨM CÙNG MẪU (ĐỂ LẤY MÀU SẮC LIÊN KẾT NỐI VỚI NHAU)
        // Cắt bỏ phần đuôi màu sắc của mã sản phẩm (Ví dụ: "SHORT_PROMAX_BLACK" -> "SHORT_PROMAX")
        let parts = sp.maSanPham.split('_');
        let maGoc = parts.length > 1 ? parts.slice(0, -1).join('_') : sp.maSanPham;
        
        // Tìm tất cả các sản phẩm có mã bắt đầu bằng mã gốc này
        var spCungLoai = await SanPham.find({ maSanPham: { $regex: '^' + maGoc + '(_|$)' } });
        
        // Tạo mảng danh sách Màu + ID để EJS tạo nút bấm
        var listMauSac = spCungLoai.map(item => {
            // Giả định màu sắc nằm ở biến thể đầu tiên, hoặc lấy từ tên sản phẩm
            let mau = item.bienThe && item.bienThe.length > 0 ? item.bienThe[0].mauSac : item.tenSanPham.split(' ').pop();
            return {
                id: item._id,
                mauSac: mau,
                isActive: item._id.toString() === id.toString() // Kiểm tra xem có phải màu đang xem không
            }
        });

        // Lọc bỏ các màu trùng lặp (nếu có)
        listMauSac = listMauSac.filter((v, i, a) => a.findIndex(t => (t.mauSac === v.mauSac)) === i);

        // 3. Lấy 4 sản phẩm Gợi ý
        var spGoiY = await SanPham.find({
            idDanhMuc: sp.idDanhMuc,
            _id: { $ne: id }
        }).limit(4);

        // 4. Kiểm tra quyền đánh giá (Chỉ được đánh giá số lần <= số lần mua thành công)
        let canReview = false;
        let reasonCantReview = 'Vui lòng đăng nhập để đánh giá.';

        if (req.session && req.session.MaNguoiDung) {
            const userId = req.session.MaNguoiDung;
            
            // Lấy danh sách ID đơn hàng đã giao (thành công) của user
            const donHangsDaGiao = await DonHang.find({
                idNguoiDung: userId,
                tinhTrang: 'Đã giao'
            }).select('_id');
            const donHangIds = donHangsDaGiao.map(dh => dh._id);

            // Đếm số lần mua sản phẩm này
            const soLanMua = await ChiTietDonHang.countDocuments({
                idDonHang: { $in: donHangIds },
                idSanPham: id
            });

            // Đếm số lần user đã đánh giá sản phẩm này
            const soLanDanhGia = sp.danhGia ? sp.danhGia.filter(dg => dg.idNguoiDung && dg.idNguoiDung.toString() === userId.toString()).length : 0;

            if (soLanMua === 0) {
                reasonCantReview = 'Bạn cần mua sản phẩm này và nhận hàng thành công để được đánh giá.';
            } else if (soLanDanhGia >= soLanMua) {
                reasonCantReview = 'Bạn đã đánh giá sản phẩm này cho tất cả các lượt mua. Hãy mua thêm để tiếp tục đánh giá.';
            } else {
                canReview = true;
            }
        }

        res.render('chitiet', {
            title: sp.tenSanPham + ' - QUALITY Fashion',
            sanpham: sp,
            listMauSac: listMauSac, 
            sanphamGoiY: spGoiY,
            canReview: canReview,
            reasonCantReview: reasonCantReview,
            session: req.session || {}
        });
    } catch (err) {
        console.log(err);
        res.send('Lỗi khi tải trang chi tiết sản phẩm!');
    }
});

// POST: Xử lý thêm đánh giá
router.post('/chitiet/:id/danhgia', async (req, res) => {
    try {
        if (!req.session || !req.session.MaNguoiDung) {
            return res.redirect('/dangnhap');
        }
        var id = req.params.id;
        var user = await NguoiDung.findById(req.session.MaNguoiDung);
        
        // Kiểm tra quyền đánh giá ở phía backend để đảm bảo an toàn
        var spCheck = await SanPham.findById(id);
        if (!spCheck) return res.send('Sản phẩm không tồn tại!');

        const donHangsDaGiao = await DonHang.find({ idNguoiDung: user._id, tinhTrang: 'Đã giao' }).select('_id');
        const donHangIds = donHangsDaGiao.map(dh => dh._id);
        const soLanMua = await ChiTietDonHang.countDocuments({ idDonHang: { $in: donHangIds }, idSanPham: id });
        const soLanDanhGia = spCheck.danhGia ? spCheck.danhGia.filter(dg => dg.idNguoiDung && dg.idNguoiDung.toString() === user._id.toString()).length : 0;

        if (soLanDanhGia >= soLanMua) {
            return res.send("<script>alert('Bạn không có quyền đánh giá hoặc đã hết lượt đánh giá cho sản phẩm này!'); window.location.href='/sanpham/chitiet/" + id + "#danh-gia';</script>");
        }

        var danhGiaMoi = {
            idNguoiDung: user._id,
            tenNguoiDung: user.HoTen || user.hoTen || 'Khách hàng',
            noiDung: req.body.noiDung,
            soSao: req.body.soSao || 5
        };

        await SanPham.findByIdAndUpdate(id, { $push: { danhGia: danhGiaMoi } });
        res.redirect('/sanpham/chitiet/' + id + '#danh-gia');
    } catch (err) {
        console.log(err);
        res.send('Lỗi khi thêm đánh giá!');
    }
});

module.exports = router;
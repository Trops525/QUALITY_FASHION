﻿const express = require('express');
const router = express.Router();
const SanPham = require('../models/sanpham'); 
const DanhMuc = require('../models/danhmuc'); 
const ChiTietDonHang = require('../models/chitietdonhang');
const DonHang = require('../models/donhang'); 
const NguoiDung = require('../models/nguoidung'); 
const CSKH = require('../models/cskh');
const Banner = require('../models/banner');
const bcrypt = require('bcryptjs');

// --- CẤU HÌNH CLOUDINARY ---
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ 
    cloud_name: 'db5ykirtg', 
    api_key: '659993772793257', 
    api_secret: 'uogoevPb7ImVCXnXA_GE_dETaI0' 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Quality_Fashion',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});
const upload = multer({ storage: storage });

// --- ĐƯỜNG DẪN GỐC CỦA ADMIN ---
router.get('/', (req, res) => {
    if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) {
        return res.redirect('/');
    }
    res.redirect('/admin/sanpham');
});

// ==========================================
// 1. QUẢN LÝ SẢN PHẨM
// ==========================================

// GET: Danh sách sản phẩm (Bao gồm logic Lọc & Phân loại)
router.get('/sanpham', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        const { search, category, status, sort } = req.query;
        const danhSachDM = await DanhMuc.find();

        // 1. Khởi tạo query object
        let query = {};

        // Tìm kiếm theo tên hoặc mã 
        if (search) {
            query.$or = [
                { tenSanPham: { $regex: search, $options: 'i' } },
                { maSanPham: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo Danh mục
        if (category) query.idDanhMuc = category;

        // --- BỔ SUNG: Logic lọc Trạng thái tồn ---
        if (status === 'sold') {
            query.luotMua = { $gt: 0 }; // Sản phẩm có lượt mua > 0
        } else if (status === 'unsold') {
            query.luotMua = 0; // Sản phẩm chưa ai mua
        } else if (status === 'outstock') {
            query['bienThe.soLuong'] = { $lte: 0 }; // Tổng kho bé hơn hoặc bằng 0
        }

        // --- BỔ SUNG: Logic Sắp xếp & Lọc Sale ---
        let sortObj = { _id: -1 }; // Mặc định mới nhất

        if (sort === 'newest') sortObj = { _id: -1 };
        if (sort === 'price_asc') sortObj = { donGia: 1 };
        if (sort === 'price_desc') sortObj = { donGia: -1 };
        
        if (sort === 'sale') {
            query.tiLeGiamGia = { $gt: 0 }; // Chỉ lấy sản phẩm có giảm giá
            sortObj = { tiLeGiamGia: -1 }; // Ưu tiên giảm giá nhiều nhất lên đầu
        }

        const danhSachSP = await SanPham.find(query).populate('idDanhMuc').sort(sortObj);

        res.render('admin/sanpham', {
            title: 'Quản lý Sản Phẩm - QUALITY ADMIN',
            danhSachSP,
            danhSachDM,
            query: req.query,
            session: req.session,
            currentPath: '/admin/sanpham' 
        });
    } catch (err) { 
        console.log("Lỗi tải DS SP:", err);
        res.status(500).send("Lỗi Server"); 
    }
});

// GET: Xóa 1 sản phẩm
router.get('/sanpham/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const sp = await SanPham.findById(req.params.id);
        if (sp && sp.hinhAnh && sp.hinhAnh.includes('cloudinary.com')) {
            const publicId = sp.hinhAnh.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await SanPham.findByIdAndDelete(req.params.id);
        req.session.success = 'Đã xóa sản phẩm thành công!';
        res.redirect('/admin/sanpham');
    } catch (err) {
        res.redirect('/admin/sanpham');
    }
});

// POST: Xóa hàng loạt nhiều sản phẩm
router.post('/sanpham/xoanhieu', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        let selectedIds = req.body.selected_ids;
        if (typeof selectedIds === 'string') selectedIds = [selectedIds];

        if (selectedIds && selectedIds.length > 0) {
            const spList = await SanPham.find({ _id: { $in: selectedIds } });
            for (let sp of spList) {
                if (sp.hinhAnh && sp.hinhAnh.includes('cloudinary.com')) {
                    const publicId = sp.hinhAnh.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            await SanPham.deleteMany({ _id: { $in: selectedIds } });
            req.session.success = `Đã xóa thành công ${selectedIds.length} sản phẩm!`;
        }
        res.redirect('/admin/sanpham');
    } catch (err) { res.redirect('/admin/sanpham'); }
});

// GET: Hiển thị Form thêm sản phẩm
router.get('/sanpham/them', async (req, res) => {
    if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
    const danhSachDM = await DanhMuc.find(); 
    res.render('admin/themsanpham', { title: 'Thêm SP', danhSachDM, session: req.session, currentPath: '/admin/sanpham' });
});

// POST: Xử lý thêm sản phẩm mới vào CSDL
router.post('/sanpham/them', upload.single('hinh_anh'), async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');

        // BỔ SUNG: Kiểm tra trùng mã sản phẩm trước khi làm bất cứ việc gì khác
        const { ma_san_pham } = req.body;
        const checkTonTai = await SanPham.findOne({ maSanPham: ma_san_pham });
        if (checkTonTai) {
            return res.send("<script>alert('Lỗi: Mã sản phẩm này đã tồn tại trong hệ thống! Vui lòng kiểm tra lại.'); window.history.back();</script>");
        }

        let mangBienThe = [];
        const { mau_sac, kich_thuoc, so_luong } = req.body;
        if (Array.isArray(kich_thuoc)) {
            for (let i = 0; i < kich_thuoc.length; i++) {
                mangBienThe.push({ mauSac: mau_sac[i], kichThuoc: kich_thuoc[i], soLuong: parseInt(so_luong[i]) || 0 });
            }
        } else if (kich_thuoc) {
            mangBienThe.push({ mauSac: mau_sac, kichThuoc: kich_thuoc, soLuong: parseInt(so_luong) || 0 });
        }

        const sanPhamMoi = new SanPham({
            ...req.body,
            maSanPham: ma_san_pham,
            idDanhMuc: req.body.id_danh_muc,
            tenSanPham: req.body.ten_san_pham,
            donGia: parseInt(req.body.gia_goc),
            giaNhap: parseInt(req.body.gia_nhap) || 0,
            tiLeGiamGia: parseInt(req.body.gia_khuyen_mai) || 0,
            hinhAnh: req.file ? req.file.path : '',
            bienThe: mangBienThe
        });
        await sanPhamMoi.save();
        req.session.success = 'Thêm sản phẩm thành công!';
        res.redirect('/admin/sanpham');
    } catch (err) { 
        console.log("Lỗi thêm SP:", err);
        res.status(500).send("Lỗi thêm SP"); 
    }
});

// GET: Hiển thị Form Sửa sản phẩm
router.get('/sanpham/sua/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        // Tìm sản phẩm theo ID trên thanh địa chỉ
        const sp = await SanPham.findById(req.params.id).populate('idDanhMuc');
        const danhSachDM = await DanhMuc.find(); // Lấy danh sách danh mục để đổ vào Select

        if (!sp) {
            return res.send("<script>alert('Sản phẩm không tồn tại!'); window.location='/admin/sanpham';</script>");
        }

        res.render('admin/suasanpham', { 
            title: 'Sửa SP', 
            sp: sp, 
            danhSachDM: danhSachDM, 
            session: req.session, 
            currentPath: '/admin/sanpham' 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/sanpham');
    }
});

// POST: Xử lý Lưu dữ liệu Sửa sản phẩm
router.post('/sanpham/sua/:id', upload.single('hinh_anh'), async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');

        const spId = req.params.id;
        const spCu = await SanPham.findById(spId);
        if (!spCu) return res.redirect('/admin/sanpham');

        const { ma_san_pham, ten_san_pham, id_danh_muc, gioi_tinh, gia_goc, gia_khuyen_mai, mo_ta } = req.body;

        // Kiểm tra xem mã SP mới nhập có bị trùng với một sản phẩm KHÁC hay không
        const checkTonTai = await SanPham.findOne({ maSanPham: ma_san_pham, _id: { $ne: spId } });
        if (checkTonTai) {
            return res.send("<script>alert('Mã sản phẩm đã tồn tại ở sản phẩm khác!'); window.history.back();</script>");
        }

        // Xử lý mảng Phân loại (Size, Màu, Số lượng)
        let mangBienThe = [];
        const { mau_sac, kich_thuoc, so_luong } = req.body;
        if (Array.isArray(kich_thuoc)) {
            for (let i = 0; i < kich_thuoc.length; i++) {
                mangBienThe.push({ 
                    mauSac: Array.isArray(mau_sac) ? mau_sac[i] : mau_sac, 
                    kichThuoc: kich_thuoc[i], 
                    soLuong: parseInt(so_luong[i]) || 0 
                });
            }
        } else if (kich_thuoc) {
            mangBienThe.push({ mauSac: mau_sac, kichThuoc: kich_thuoc, soLuong: parseInt(so_luong) || 0 });
        }

        // Xử lý cập nhật Hình ảnh
        let hinhAnhMoi = spCu.hinhAnh; // Mặc định giữ lại ảnh cũ
        
        if (req.file) { // Nếu Admin có chọn tải ảnh mới lên
            hinhAnhMoi = req.file.path; // Link Cloudinary mới
            
            // Xóa ảnh cũ trên Cloudinary để đỡ tốn dung lượng
            if (spCu.hinhAnh && spCu.hinhAnh.includes('cloudinary.com')) {
                const publicId = spCu.hinhAnh.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId).catch(err => console.log(err));
            }
        }

        // Cập nhật Database
        await SanPham.findByIdAndUpdate(spId, {
            maSanPham: ma_san_pham,
            tenSanPham: ten_san_pham,
            idDanhMuc: id_danh_muc,
            gioiTinh: gioi_tinh,
            donGia: parseInt(gia_goc),
            tiLeGiamGia: parseInt(gia_khuyen_mai) || 0,
            moTa: mo_ta,
            hinhAnh: hinhAnhMoi,
            bienThe: mangBienThe
        });

        req.session.success = 'Cập nhật sản phẩm thành công!';
        res.redirect('/admin/sanpham');

    } catch (err) {
        console.log("Lỗi sửa SP:", err);
        res.status(500).send("Lỗi cập nhật sản phẩm");
    }
});

// ==========================================
// 2. QUẢN LÝ DANH MỤC
// ==========================================

router.get('/danhmuc', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const danhSachDM = await DanhMuc.find().sort({ _id: 1 });
        res.render('admin/danhmuc', {
            title: 'Quản lý Danh Mục - QUALITY ADMIN',
            danhSachDM,
            session: req.session,
            currentPath: '/admin/danhmuc'
        });
    } catch (err) { res.status(500).send("Lỗi tải danh mục"); }
});

router.post('/danhmuc/them', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const tenDM = req.body.ten_danh_muc;
        if (tenDM) await DanhMuc.create({ TenDanhMuc: tenDM, tenDanhMuc: tenDM });
        res.redirect('/admin/danhmuc');
    } catch (err) { res.redirect('/admin/danhmuc'); }
});

router.get('/danhmuc/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        // Kiểm tra xem danh mục có đang chứa sản phẩm nào không
        const count = await SanPham.countDocuments({ idDanhMuc: req.params.id });
        if (count > 0) {
            return res.send(`<script>alert('Không thể xóa! Đang có ${count} sản phẩm thuộc danh mục này.'); window.location.href='/admin/danhmuc';</script>`);
        }
        await DanhMuc.findByIdAndDelete(req.params.id);
        res.redirect('/admin/danhmuc');
    } catch (err) { res.redirect('/admin/danhmuc'); }
});

router.post('/danhmuc/sua/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const tenDM = req.body.ten_danh_muc;
        if (tenDM) await DanhMuc.findByIdAndUpdate(req.params.id, { TenDanhMuc: tenDM, tenDanhMuc: tenDM });
        res.redirect('/admin/danhmuc');
    } catch (err) { res.redirect('/admin/danhmuc'); }
});

// ==========================================
// 3. QUẢN LÝ ĐƠN HÀNG
// ==========================================

router.get('/donhang', async (req, res) => {
    if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
    const dsDonHang = await DonHang.find().populate('idNguoiDung').sort({ ngayDat: -1 });
    res.render('admin/donhang', { dsDonHang });
});

router.get('/donhang/chitiet/:id', async (req, res) => {
    if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
    const order = await DonHang.findById(req.params.id).populate('idNguoiDung').populate('idNhanVienDuyet');
    const items = await ChiTietDonHang.find({ idDonHang: req.params.id }).populate('idSanPham'); 
    res.render('admin/chitietdonhang', { order, items });
});

router.get('/donhang/xacnhan/:id', async (req, res) => {
    if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
    
    try {
        const order = await DonHang.findById(req.params.id);
        
        // Chỉ trừ số lượng khi đơn hàng đang ở trạng thái mới (chưa duyệt)
        if (order && order.tinhTrang === 'Đang xử lý') {
            const items = await ChiTietDonHang.find({ idDonHang: req.params.id });
            
            for (let item of items) {
                console.log(`[ADMIN] Đang trừ kho cho SP: ${item.idSanPham}, Màu: ${item.mauSac}, Size: ${item.kichThuoc}, SL: ${item.soLuong}`);
                const updateResult = await SanPham.findByIdAndUpdate(item.idSanPham, {
                    $inc: { 
                        "bienThe.$[elem].soLuong": -item.soLuong,
                        "luotMua": item.soLuong // Cập nhật lượt mua tại đây
                    }
                }, {
                    arrayFilters: [{ "elem.kichThuoc": item.kichThuoc, "elem.mauSac": item.mauSac }],
                    new: true // Trả về tài liệu đã được sửa đổi
                });
                if (!updateResult) {
                    console.warn(`[ADMIN] Cảnh báo: Không tìm thấy SP ${item.idSanPham} hoặc biến thể không khớp để trừ kho.`);
                }
            }
            
            order.tinhTrang = 'Đã xác nhận';
            order.idNhanVienDuyet = req.session.MaNguoiDung;
            await order.save();
            req.session.success = 'Đã duyệt đơn hàng, trừ kho và cập nhật lượt mua thành công!';
        } else {
            req.session.error = `Đơn hàng đang ở trạng thái "${order ? order.tinhTrang : 'không tồn tại'}", không thể duyệt.`;
        }
        res.redirect('/admin/donhang');
    } catch (err) {
        console.error("[ADMIN] Lỗi khi duyệt đơn hàng và trừ kho:", err);
        req.session.error = 'Đã xảy ra lỗi khi duyệt đơn hàng.';
        res.redirect('/admin/donhang');
    }
});
router.get('/donhang/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        // 1. Lấy thông tin đơn hàng trước khi xóa
        const order = await DonHang.findById(req.params.id);
        
        // 2. Nếu đơn hàng ở trạng thái đã duyệt (đã bị trừ kho) thì tiến hành hoàn lại kho
        if (order && ['Đã xác nhận', 'Đang giao', 'Đã giao'].includes(order.tinhTrang)) {
            const items = await ChiTietDonHang.find({ idDonHang: req.params.id });
            for (let item of items) {
                await SanPham.findByIdAndUpdate(item.idSanPham, {
                    $inc: { 
                        "bienThe.$[elem].soLuong": item.soLuong, // Cộng lại số lượng dương
                        "luotMua": -item.soLuong // Trừ đi lượt mua đã tính
                    }
                }, { arrayFilters: [{ "elem.kichThuoc": item.kichThuoc, "elem.mauSac": item.mauSac }] });
            }
        }

        // Xóa tất cả các chi tiết thuộc về đơn hàng này trước để dọn sạch rác DB
        await ChiTietDonHang.deleteMany({ idDonHang: req.params.id });
        
        // Sau đó mới xóa đơn hàng chính
        await DonHang.findByIdAndDelete(req.params.id);
        
        res.send("<script>alert('Đã xóa đơn hàng thành công!'); window.location.href='/admin/donhang';</script>");
    } catch (err) {
        console.log("Lỗi xóa đơn hàng:", err);
        res.send("<script>alert('Lỗi khi xóa đơn hàng!'); window.location.href='/admin/donhang';</script>");
    }
});

// ==========================================
// 4. THỐNG KÊ DOANH THU & LỢI NHUẬN
// ==========================================
router.get('/thongke', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');

        // Lấy tháng năm từ URL hoặc lấy hiện tại làm mặc định
        let currentDate = new Date();
        let selectedYear = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();
        let selectedMonth = req.query.month !== undefined ? parseInt(req.query.month) : currentDate.getMonth() + 1;

        let queryDonHang = { tinhTrang: 'Đã giao' };

        // Tính toán khoảng thời gian bắt đầu và kết thúc
        if (selectedMonth > 0) { // Lọc theo 1 tháng cụ thể
            let startDate = new Date(selectedYear, selectedMonth - 1, 1);
            let endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
            queryDonHang.ngayDat = { $gte: startDate, $lte: endDate };
        } else { // Lọc cả năm
            let startDate = new Date(selectedYear, 0, 1);
            let endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
            queryDonHang.ngayDat = { $gte: startDate, $lte: endDate };
        }

        const dsDonHang = await DonHang.find(queryDonHang);
        const idsDonHang = dsDonHang.map(dh => dh._id);
        const chiTiet = await ChiTietDonHang.find({ idDonHang: { $in: idsDonHang } });

        let tongDoanhThu = 0;
        let tongGiaVon = 0;
        let tongSanPhamDaBan = 0;
        let sanPhamBanChayMap = {};

        chiTiet.forEach(item => {
            const doanhThu = item.donGia * item.soLuong;
            const giaVon = (item.giaNhap || 0) * item.soLuong;
            
            tongDoanhThu += doanhThu;
            tongGiaVon += giaVon;
            tongSanPhamDaBan += item.soLuong;

            if (!sanPhamBanChayMap[item.idSanPham]) {
                sanPhamBanChayMap[item.idSanPham] = {
                    tenSanPham: item.tenSanPham,
                    soLuongBan: 0,
                    doanhThuMangLai: 0
                };
            }
            sanPhamBanChayMap[item.idSanPham].soLuongBan += item.soLuong;
            sanPhamBanChayMap[item.idSanPham].doanhThuMangLai += doanhThu;
        });

        const top10SanPham = Object.values(sanPhamBanChayMap)
            .sort((a, b) => b.soLuongBan - a.soLuongBan)
            .slice(0, 10);

        res.render('admin/thongke', {
            title: 'Thống kê doanh thu - QUALITY ADMIN',
            tongDoanhThu,
            tongGiaVon,
            tongLoiNhuan: tongDoanhThu - tongGiaVon,
            tongDonHang: dsDonHang.length,
            tongSanPhamDaBan,
            top10SanPham,
            selectedMonth,
            selectedYear,
            session: req.session,
            currentPath: '/admin/thongke'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Lỗi thống kê");
    }
});

// ==========================================
// 5. QUẢN LÝ ĐÁNH GIÁ
// ==========================================
router.get('/danhgia', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        const { soSao } = req.query;

        // Tìm tất cả các sản phẩm có chứa mảng danhGia và mảng đó không rỗng
        let sanPhamCoDanhGia = await SanPham.find({ "danhGia.0": { $exists: true } })
                                              .select('tenSanPham hinhAnh danhGia')
                                              .sort({ _id: -1 })
                                              .lean(); // .lean() giúp lọc danh sách dễ dàng hơn
                                              
        // Lọc đánh giá theo số sao nếu Admin có chọn
        if (soSao) {
            sanPhamCoDanhGia = sanPhamCoDanhGia.map(sp => {
                sp.danhGia = sp.danhGia.filter(dg => dg.soSao == soSao);
                return sp;
            }).filter(sp => sp.danhGia.length > 0); // Chỉ giữ lại sản phẩm có đánh giá thỏa mãn
        }

        res.render('admin/danhgia', {
            title: 'Quản lý Đánh Giá - QUALITY ADMIN',
            sanPhamCoDanhGia: sanPhamCoDanhGia,
            query: req.query,
            session: req.session,
            currentPath: '/admin/danhgia'
        });
    } catch (err) {
        res.status(500).send("Lỗi tải danh sách đánh giá");
    }
});

// GET: Xóa một đánh giá
router.get('/danhgia/xoa/:idSanPham/:idDanhGia', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        const { idSanPham, idDanhGia } = req.params;
        
        // Sử dụng $pull để xóa phần tử đánh giá ra khỏi mảng của MongoDB
        await SanPham.findByIdAndUpdate(idSanPham, { $pull: { danhGia: { _id: idDanhGia } } });
        
        res.send("<script>alert('Đã xóa đánh giá thành công!'); window.location.href='/admin/danhgia';</script>");
    } catch (err) {
        res.send("<script>alert('Lỗi khi xóa đánh giá!'); window.location.href='/admin/danhgia';</script>");
    }
});

// ==========================================
// 6. QUẢN LÝ NGƯỜI DÙNG
// ==========================================

// GET: Hiển thị danh sách người dùng
router.get('/nguoidung', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
        
        const { search } = req.query;
        let query = {};
        
        // Tìm kiếm theo tên, email, sđt hoặc tên đăng nhập
        if (search) {
            const kw = search.trim();
            query.$or = [
                { HoTen: { $regex: kw, $options: 'i' } },
                { Email: { $regex: kw, $options: 'i' } },
                { DienThoai: { $regex: kw, $options: 'i' } },
                { TenDangNhap: { $regex: kw, $options: 'i' } }
            ];
        }

        const danhSachND = await NguoiDung.find(query).sort({ _id: -1 });

        res.render('admin/nguoidung', {
            title: 'Quản lý Người Dùng - QUALITY ADMIN',
            danhSachND,
            query: req.query,
            session: req.session,
            currentPath: '/admin/nguoidung'
        });
    } catch (err) {
        res.status(500).send("Lỗi tải danh sách người dùng");
    }
});

// GET: Hiển thị form Thêm người dùng
router.get('/nguoidung/them', async (req, res) => {
    if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
    res.render('admin/themnguoidung', {
        title: 'Thêm Người Dùng - QUALITY ADMIN',
        session: req.session,
        currentPath: '/admin/nguoidung'
    });
});

// POST: Xử lý Thêm người dùng
router.post('/nguoidung/them', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
        
        const { HoTen, TenDangNhap, Email, DienThoai, MatKhau, XacNhanMatKhau, QuyenHan } = req.body;

        // Kiểm tra dữ liệu hợp lệ
        if (TenDangNhap.length <= 3) return res.send("<script>alert('Tên đăng nhập phải dài hơn 3 ký tự!'); window.history.back();</script>");
        if (MatKhau.length <= 4) return res.send("<script>alert('Mật khẩu phải dài hơn 4 ký tự!'); window.history.back();</script>");
        if (MatKhau !== XacNhanMatKhau) return res.send("<script>alert('Xác nhận mật khẩu không khớp!'); window.history.back();</script>");
        if (!/^[0-9]{10}$/.test(DienThoai)) return res.send("<script>alert('Số điện thoại phải gồm đúng 10 chữ số!'); window.history.back();</script>");

        // Kiểm tra trùng lặp
        const checkUser = await NguoiDung.findOne({ TenDangNhap });
        if (checkUser) return res.send("<script>alert('Tên đăng nhập đã tồn tại!'); window.history.back();</script>");

        const checkEmail = await NguoiDung.findOne({ Email });
        if (checkEmail) return res.send("<script>alert('Email này đã được sử dụng!'); window.history.back();</script>");

        const checkPhone = await NguoiDung.findOne({ DienThoai });
        if (checkPhone) return res.send("<script>alert('Số điện thoại này đã được sử dụng!'); window.history.back();</script>");

        // Mã hóa mật khẩu và tạo
        var salt = bcrypt.genSaltSync(10);
        await NguoiDung.create({
            HoTen, TenDangNhap, Email, DienThoai,
            MatKhau: bcrypt.hashSync(MatKhau, salt),
            QuyenHan: parseInt(QuyenHan) || 2,
            Khoa: 0
        });

        res.send("<script>alert('Tạo tài khoản thành công!'); window.location.href='/admin/nguoidung';</script>");
    } catch (err) {
        console.log(err);
        res.send("<script>alert('Lỗi hệ thống khi tạo tài khoản!'); window.history.back();</script>");
    }
});

// POST: Khóa / Mở khóa người dùng
router.post('/nguoidung/khoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
        if (req.params.id === req.session.MaNguoiDung) {
            return res.send("<script>alert('Bạn không thể tự khóa tài khoản của chính mình!'); window.location.href='/admin/nguoidung';</script>");
        }
        
        const user = await NguoiDung.findById(req.params.id);
        if (user) {
            user.Khoa = user.Khoa === 1 ? 0 : 1; // Đảo ngược trạng thái khóa
            await user.save();
            res.send(`<script>alert('Đã ${user.Khoa === 1 ? 'khóa' : 'mở khóa'} tài khoản thành công!'); window.location.href='/admin/nguoidung';</script>`);
        } else res.redirect('/admin/nguoidung');
    } catch (err) { res.send("<script>alert('Lỗi thao tác!'); window.location.href='/admin/nguoidung';</script>"); }
});

// POST: Xóa người dùng
router.post('/nguoidung/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
        if (req.params.id === req.session.MaNguoiDung) {
            return res.send("<script>alert('Bạn không thể tự xóa tài khoản của chính mình!'); window.location.href='/admin/nguoidung';</script>");
        }
        
        await NguoiDung.findByIdAndDelete(req.params.id);
        res.send("<script>alert('Đã xóa người dùng thành công!'); window.location.href='/admin/nguoidung';</script>");
    } catch (err) { 
        res.send("<script>alert('Lỗi thao tác!'); window.location.href='/admin/nguoidung';</script>"); 
    }
});

// POST: Thay đổi Quyền hạn
router.post('/nguoidung/quyen/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || req.session.QuyenHan !== 1) return res.redirect('/');
        if (req.params.id === req.session.MaNguoiDung) {
            return res.send("<script>alert('Bạn không thể tự đổi quyền của chính mình!'); window.location.href='/admin/nguoidung';</script>");
        }
        
        const user = await NguoiDung.findById(req.params.id);
        if (user && req.body.QuyenHan) {
            user.QuyenHan = parseInt(req.body.QuyenHan);
            await user.save();
            res.send("<script>alert('Cập nhật phân quyền thành công!'); window.location.href='/admin/nguoidung';</script>");
        } else res.redirect('/admin/nguoidung');
    } catch (err) { res.send("<script>alert('Lỗi thao tác!'); window.location.href='/admin/nguoidung';</script>"); }
});

// ==========================================
// 7. QUẢN LÝ CSKH (CÂU HỎI THƯỜNG GẶP - FAQ)
// ==========================================

router.get('/cskh', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const danhSachFAQ = await CSKH.find().sort({ DanhMuc: 1, ThuTu: 1 });
        res.render('admin/cskh', {
            title: 'Quản lý CSKH - QUALITY ADMIN',
            danhSachFAQ,
            session: req.session,
            currentPath: '/admin/cskh'
        });
    } catch (err) { res.status(500).send("Lỗi tải danh sách CSKH"); }
});

router.post('/cskh/them', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const { DanhMuc_faq, CauHoi, TraLoi, ThuTu, TrangThai } = req.body;
        await CSKH.create({ DanhMuc: DanhMuc_faq, CauHoi, TraLoi, ThuTu: parseInt(ThuTu) || 1, TrangThai: parseInt(TrangThai) || 0 });
        res.redirect('/admin/cskh');
    } catch (err) { res.send("<script>alert('Lỗi thêm!'); window.history.back();</script>"); }
});

router.post('/cskh/sua', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const { id, DanhMuc_faq, CauHoi, TraLoi, ThuTu, TrangThai } = req.body;
        await CSKH.findByIdAndUpdate(id, { DanhMuc: DanhMuc_faq, CauHoi, TraLoi, ThuTu: parseInt(ThuTu) || 1, TrangThai: parseInt(TrangThai) || 0 });
        res.redirect('/admin/cskh');
    } catch (err) { res.send("<script>alert('Lỗi sửa!'); window.history.back();</script>"); }
});

router.get('/cskh/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        await CSKH.findByIdAndDelete(req.params.id);
        res.send("<script>alert('Đã xóa câu hỏi thành công!'); window.location.href='/admin/cskh';</script>");
    } catch (err) { res.send("<script>alert('Lỗi xóa!'); window.location.href='/admin/cskh';</script>"); }
});

// ==========================================
// 8. QUẢN LÝ BANNER
// ==========================================

router.get('/banner', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        
        let danhSachBanner = await Banner.find().sort({ thuTu: 1 });
        
        // Nếu chưa có banner nào trong CSDL, tự động nạp 4 banner mặc định để quản lý
        if (danhSachBanner.length === 0) {
            const defaultBanners = [
                { hinhAnh: '/images/banner1.jpg', thuTu: 1 },
                { hinhAnh: '/images/banner2.jpg', thuTu: 2 },
                { hinhAnh: '/images/banner3.jpg', thuTu: 3 },
                { hinhAnh: '/images/banner4.jpg', thuTu: 4 }
            ];
            await Banner.insertMany(defaultBanners);
            danhSachBanner = await Banner.find().sort({ thuTu: 1 });
        }

        res.render('admin/banner', {
            title: 'Quản lý Banner - QUALITY ADMIN',
            danhSachBanner,
            session: req.session,
            currentPath: '/admin/banner'
        });
    } catch (err) { res.status(500).send("Lỗi tải danh sách banner"); }
});

router.post('/banner/them', upload.single('hinh_anh'), async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        if (req.file) {
            await Banner.create({ hinhAnh: req.file.path, thuTu: parseInt(req.body.thuTu) || 0 });
        }
        res.redirect('/admin/banner');
    } catch (err) { res.redirect('/admin/banner'); }
});

// Thay đổi trạng thái (Ẩn/Hiện) Banner
router.get('/banner/trangthai/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            banner.trangThai = banner.trangThai === 1 ? 0 : 1;
            await banner.save();
        }
        res.redirect('/admin/banner');
    } catch (err) { res.redirect('/admin/banner'); }
});

router.get('/banner/xoa/:id', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');
        const banner = await Banner.findById(req.params.id);
        if (banner && banner.hinhAnh && banner.hinhAnh.includes('cloudinary.com')) {
            const publicId = banner.hinhAnh.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(err => console.log(err));
        }
        await Banner.findByIdAndDelete(req.params.id);
        res.redirect('/admin/banner');
    } catch (err) { res.redirect('/admin/banner'); }
});

module.exports = router;
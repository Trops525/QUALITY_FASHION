var express = require('express');
var router = express.Router();
var SanPham = require('../models/sanpham');

// 1. POST: XỬ LÝ THÊM VÀO GIỎ / MUA NGAY (Dịch từ add_to_cart.php)
router.post('/them', async (req, res) => { // Make it async
    // 1. Kiểm tra đăng nhập
    if (!req.session || !req.session.MaNguoiDung) {
        // Lấy link của trang chi tiết mà người dùng đang đứng xem
        let returnUrl = req.header('Referer') || '/sanpham';
        
        return res.send(`
            <script>
                alert("Vui lòng đăng nhập để mua hàng!");
                // Gửi kèm địa chỉ trang chi tiết qua tham số returnUrl
                window.location.href = "/dangnhap?returnUrl=" + encodeURIComponent("${returnUrl}");
            </script>
        `);
    }

    // Lấy dữ liệu từ form chitiet.ejs
    const idSanPham = req.body.idSanPham;
    const selectedMauSac = req.body.mauSac; // Màu sắc người dùng chọn từ form
    const selectedKichThuoc = req.body.kichThuoc; // Kích thước người dùng chọn từ form
    let action = req.body.action; // 'add' hoặc 'buy'

    try {
        const sp = await SanPham.findById(idSanPham);
        if (!sp) {
            req.session.error = 'Sản phẩm không tồn tại.';
            return res.redirect(req.header('Referer') || '/sanpham');
        }

        let actualMauSac = '';
        let actualKichThuoc = '';
        let foundVariant = null;

        // Tìm biến thể phù hợp trong mảng bienThe của sản phẩm
        if (sp.bienThe && sp.bienThe.length > 0) {
            // Ưu tiên tìm biến thể khớp chính xác với lựa chọn của người dùng
            foundVariant = sp.bienThe.find(v => 
                v.mauSac === selectedMauSac && v.kichThuoc === selectedKichThuoc
            );

            // Nếu không tìm thấy và sản phẩm chỉ có 1 biến thể, dùng biến thể đó
            if (!foundVariant && sp.bienThe.length === 1) {
                foundVariant = sp.bienThe[0];
            } 
            // Nếu vẫn không tìm thấy và người dùng không chọn màu/size, thử tìm biến thể Freesize hoặc biến thể đầu tiên
            else if (!foundVariant && (!selectedMauSac || !selectedKichThuoc)) {
                foundVariant = sp.bienThe.find(v => v.kichThuoc === 'Freesize') || sp.bienThe[0];
            }
        }

        if (!foundVariant) {
            req.session.error = 'Vui lòng chọn màu sắc và kích thước hợp lệ.';
            return res.redirect(req.header('Referer') || '/sanpham/chitiet/' + idSanPham);
        }

        actualMauSac = foundVariant.mauSac;
        actualKichThuoc = foundVariant.kichThuoc;

        // Kiểm tra số lượng tồn kho trước khi thêm vào giỏ
        if (foundVariant.soLuong <= 0) {
            req.session.error = 'Sản phẩm này hiện đã hết hàng.';
            return res.redirect(req.header('Referer') || '/sanpham/chitiet/' + idSanPham);
        }

        // Tạo Key giỏ hàng: ID_Màu_Size (Sử dụng giá trị thực tế từ biến thể)
        const cartKey = `${idSanPham}_${actualMauSac}_${actualKichThuoc}`;

    // XỬ LÝ: MUA NGAY
    if (action === 'buy') {
        req.session.buy_now_cart = {};
        req.session.buy_now_cart[cartKey] = 1; // Mặc định mua 1 cái
        return res.redirect('/thanhtoan?type=buynow');
    }

    // XỬ LÝ: THÊM VÀO GIỎ HÀNG
    if (!req.session.cart) {
        req.session.cart = {};
    }
    if (req.session.cart[cartKey]) {
        req.session.cart[cartKey] += 1; // Cộng dồn số lượng
    } else {
        req.session.cart[cartKey] = 1;  // Thêm mới
    }
        req.session.success = 'Đã thêm sản phẩm vào giỏ hàng!';
        res.redirect('/sanpham/chitiet/' + idSanPham);

    } catch (err) {
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        req.session.error = 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.';
        res.redirect(req.header('Referer') || '/sanpham');
    }
});

// 2. GET: HIỂN THỊ TRANG GIỎ HÀNG (Dịch từ phần đầu của cart.php)
router.get('/', async (req, res) => {
    if (!req.session || !req.session.MaNguoiDung) {
        return res.redirect('/dangnhap');
    }

    let cart = req.session.cart || {};
    let cartItems = [];
    let total = 0;

    // Lọc lấy danh sách ID sản phẩm từ các Key (Ví dụ key: 69dbc_Trắng_M -> Lấy 69dbc)
    let productIds = Object.keys(cart).map(key => key.split('_')[0]);
    productIds = [...new Set(productIds)]; // Loại bỏ ID trùng

    if (productIds.length > 0) {
        try {
            // Gom 1 lần query lấy tất cả sản phẩm
            let products = await SanPham.find({ _id: { $in: productIds } });
            
            // Chuyển mảng thành dạng Object { ID: Data } để dễ lấy
            let productMap = {};
            products.forEach(p => productMap[p._id.toString()] = p);

            // Bóc tách lại Session Cart để tính tiền
            for (let key in cart) {
                let parts = key.split('_');
                let id = parts[0];
                let mau = parts[1];
                let size = parts[2];
                let qty = cart[key];

                if (productMap[id]) {
                    let sp = productMap[id];
                    let giaBan = sp.donGia - (sp.donGia * (sp.tiLeGiamGia || 0) / 100);
                    let thanhTien = giaBan * qty;
                    total += thanhTien;

                    cartItems.push({
                        cartKey: key,
                        id: sp._id,
                        ten: sp.tenSanPham,
                        hinhAnh: sp.hinhAnh,
                        mauSac: mau,
                        kichThuoc: size,
                        soLuong: qty,
                        donGia: giaBan,
                        thanhTien: thanhTien
                    });
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    res.render('giohang', {
        title: 'Giỏ hàng của bạn - QUALITY Fashion',
        cartItems: cartItems,
        total: total,
        session: req.session
    });
});

// 3. XÓA 1 SẢN PHẨM KHỎI GIỎ HÀNG
router.get('/xoa/:key', (req, res) => {
    let key = req.params.key;
    if (req.session.cart && req.session.cart[key]) {
        delete req.session.cart[key];
    }
    res.redirect('/giohang');
});

// 4. CẬP NHẬT SỐ LƯỢNG
router.post('/capnhat', (req, res) => {
    let quantities = req.body.quantities; 
    if (quantities && req.session.cart) {
        for (let key in quantities) {
            let qty = parseInt(quantities[key]);
            if (qty > 0) {
                req.session.cart[key] = qty;
            } else {
                delete req.session.cart[key];
            }
        }
    }
    res.redirect('/giohang');
});

module.exports = router;
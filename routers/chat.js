const express = require('express');
const router = express.Router();
const TinNhan = require('../models/tinnhan');
const NguoiDung = require('../models/nguoidung');

// 1. Lấy lịch sử chat cho khách
router.get('/history', async (req, res) => {
    try {
        const idNguoiDung = req.session.MaNguoiDung;
        if (!idNguoiDung) return res.json([]);

        const lichSu = await TinNhan.find({
            $or: [{ idNguoiGui: idNguoiDung }, { idNguoiNhan: idNguoiDung }]
        }).sort({ createdAt: 1 });

        res.json(lichSu);
    } catch (err) { res.status(500).json([]); }
});

// 2. Trang chủ Chat Admin (Hiện Sidebar danh sách khách)
router.get('/', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');

        const { filter, search } = req.query;

        // BƯỚC A: Lấy tất cả tin nhắn
        const tatCaTinNhan = await TinNhan.find().populate('idNguoiGui').sort({ createdAt: -1 });

        // BƯỚC B: Lọc trùng lặp và lấy thông tin user
        let danhSachChat = [];
        const daXuatHien = new Set();
        const thongTinKhach = {};

        tatCaTinNhan.forEach(msg => {
            if (msg.nguoiGui === 'user' && msg.idNguoiGui) {
                thongTinKhach[msg.idNguoiGui._id.toString()] = msg.idNguoiGui;
            }
        });

        for (let msg of tatCaTinNhan) {
            let isFromAdmin = (msg.nguoiGui === 'admin');
            let customerId = isFromAdmin ? msg.idNguoiNhan : (msg.idNguoiGui ? msg.idNguoiGui._id.toString() : null);

            if (customerId && !daXuatHien.has(customerId)) {
                daXuatHien.add(customerId);
                let msgData = msg.toObject ? msg.toObject() : msg;
                msgData.isAnswered = isFromAdmin; // True nếu admin nhắn cuối cùng
                msgData.idNguoiGui = thongTinKhach[customerId];

                if (!msgData.idNguoiGui) {
                    const userDb = await NguoiDung.findById(customerId);
                    msgData.idNguoiGui = userDb || { _id: customerId, HoTen: 'Khách hàng' };
                    thongTinKhach[customerId] = msgData.idNguoiGui;
                }
                
                danhSachChat.push(msgData);
            }
        }

        // BƯỚC C: Lọc theo Combobox (Trạng thái)
        if (filter === 'chua-tra-loi' || filter === 'tin-moi') {
            danhSachChat = danhSachChat.filter(c => !c.isAnswered);
        } else if (filter === 'da-tra-loi') {
            danhSachChat = danhSachChat.filter(c => c.isAnswered);
        }

        // BƯỚC D: Lọc theo Tìm kiếm Tên
        if (search) {
            const kw = search.toLowerCase();
            danhSachChat = danhSachChat.filter(c => {
                const ten = (c.idNguoiGui && (c.idNguoiGui.HoTen || c.idNguoiGui.hoTen)) ? (c.idNguoiGui.HoTen || c.idNguoiGui.hoTen).toLowerCase() : '';
                const sdt = (c.idNguoiGui && c.idNguoiGui.DienThoai) ? c.idNguoiGui.DienThoai : '';
                const email = (c.idNguoiGui && c.idNguoiGui.Email) ? c.idNguoiGui.Email.toLowerCase() : '';
                const tk = (c.idNguoiGui && c.idNguoiGui.TenDangNhap) ? c.idNguoiGui.TenDangNhap.toLowerCase() : '';
                return ten.includes(kw) || sdt.includes(kw) || email.includes(kw) || tk.includes(kw);
            });

            // Tìm kiếm thêm trong bảng NguoiDung để admin có thể chủ động nhắn tin
            const regexSearch = new RegExp(search, 'i');
            const usersFound = await NguoiDung.find({
                $or: [
                    { HoTen: regexSearch },
                    { DienThoai: regexSearch },
                    { Email: regexSearch },
                    { TenDangNhap: regexSearch }
                ]
            });

            usersFound.forEach(user => {
                const userIdStr = user._id.toString();
                // Nếu người dùng này chưa có trong danh sách chat
                if (!daXuatHien.has(userIdStr)) {
                    daXuatHien.add(userIdStr);
                    danhSachChat.push({ idNguoiGui: user, isAnswered: true, noiDung: 'Chưa có tin nhắn...' });
                }
            });
        }

        res.render('admin/chat', { 
            title: 'Quản lý Chat - QUALITY ADMIN',
            danhSachChat: danhSachChat, 
            khachHangHienTai: null, 
            lichSuChat: [],
            query: req.query,
            session: req.session,
            currentPath: '/admin/chat'
        });
    } catch (err) { res.send(err.message); }
});

// 3. Chat cụ thể với 1 người (Khi admin nhấn vào Sidebar)
router.get('/:idKhachHang', async (req, res) => {
    try {
        if (!req.session.QuyenHan || ![1, 3].includes(req.session.QuyenHan)) return res.redirect('/');

        const idKH = req.params.idKhachHang;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(idKH)) return res.redirect('/admin/chat');

        const khachHangHienTai = await NguoiDung.findById(idKH);
        
        const lichSuChat = await TinNhan.find({
            $or: [
                { idNguoiGui: idKH },
                { idNguoiNhan: idKH }
            ]
        }).sort({ createdAt: 1 });

        // Xử lý danh sách Sidebar kèm bộ Lọc & Tìm kiếm
        const { filter, search } = req.query;
        const tatCaTinNhan = await TinNhan.find().populate('idNguoiGui').sort({ createdAt: -1 });

        let danhSachChat = [];
        const daXuatHien = new Set();
        const thongTinKhach = {};

        tatCaTinNhan.forEach(msg => {
            if (msg.nguoiGui === 'user' && msg.idNguoiGui) {
                thongTinKhach[msg.idNguoiGui._id.toString()] = msg.idNguoiGui;
            }
        });

        for (let msg of tatCaTinNhan) {
            let isFromAdmin = (msg.nguoiGui === 'admin');
            let customerId = isFromAdmin ? msg.idNguoiNhan : (msg.idNguoiGui ? msg.idNguoiGui._id.toString() : null);

            if (customerId && !daXuatHien.has(customerId)) {
                daXuatHien.add(customerId);
                let msgData = msg.toObject ? msg.toObject() : msg;
                msgData.isAnswered = isFromAdmin;
                msgData.idNguoiGui = thongTinKhach[customerId];

                if (!msgData.idNguoiGui) {
                    const userDb = await NguoiDung.findById(customerId);
                    msgData.idNguoiGui = userDb || { _id: customerId, HoTen: 'Khách hàng' };
                    thongTinKhach[customerId] = msgData.idNguoiGui;
                }
                danhSachChat.push(msgData);
            }
        }

        if (filter === 'chua-tra-loi' || filter === 'tin-moi') danhSachChat = danhSachChat.filter(c => !c.isAnswered);
        else if (filter === 'da-tra-loi') danhSachChat = danhSachChat.filter(c => c.isAnswered);

        if (search) {
            const kw = search.toLowerCase();
            danhSachChat = danhSachChat.filter(c => {
                const ten = (c.idNguoiGui && (c.idNguoiGui.HoTen || c.idNguoiGui.hoTen)) ? (c.idNguoiGui.HoTen || c.idNguoiGui.hoTen).toLowerCase() : '';
                const sdt = (c.idNguoiGui && c.idNguoiGui.DienThoai) ? c.idNguoiGui.DienThoai : '';
                const email = (c.idNguoiGui && c.idNguoiGui.Email) ? c.idNguoiGui.Email.toLowerCase() : '';
                const tk = (c.idNguoiGui && c.idNguoiGui.TenDangNhap) ? c.idNguoiGui.TenDangNhap.toLowerCase() : '';
                return ten.includes(kw) || sdt.includes(kw) || email.includes(kw) || tk.includes(kw);
            });

            // Tìm kiếm thêm trong bảng NguoiDung để admin có thể chủ động nhắn tin
            const regexSearch = new RegExp(search, 'i');
            const usersFound = await NguoiDung.find({
                $or: [
                    { HoTen: regexSearch },
                    { DienThoai: regexSearch },
                    { Email: regexSearch },
                    { TenDangNhap: regexSearch }
                ]
            });

            usersFound.forEach(user => {
                const userIdStr = user._id.toString();
                if (!daXuatHien.has(userIdStr)) {
                    daXuatHien.add(userIdStr);
                    danhSachChat.push({ idNguoiGui: user, isAnswered: true, noiDung: 'Chưa có tin nhắn...' });
                }
            });
        }

        res.render('admin/chat', { 
            title: 'Đang hỗ trợ: ' + (khachHangHienTai ? khachHangHienTai.HoTen : ''),
            danhSachChat: danhSachChat, 
            khachHangHienTai, 
            lichSuChat,
            query: req.query,
            session: req.session,
            currentPath: '/admin/chat'
        });
    } catch (err) { 
        console.error("LỖI CRASH KHI MỞ CHAT:", err);
        res.redirect('/admin/chat'); 
    }
});

module.exports = router;
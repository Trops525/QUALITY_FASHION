const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const express = require('express');

// ==========================================
// 1. ĐĂNG KÝ MODEL (Phải làm sớm để tránh lỗi MissingSchema)
// ==========================================
require('./models/nguoidung'); 
require('./models/sanpham');
require('./models/donhang');
const TinNhan = require('./models/tinnhan');

// ==========================================
// 2. KHỞI TẠO EXPRESS & SOCKET.IO
// ==========================================
const app = express();
const http = require('http').Server(app); // Cần thiết cho Socket.io
const io = require('socket.io')(http);

// ==========================================
// 3. KẾT NỐI MONGODB Atlas
// ==========================================
const uri = 'mongodb://quan_dth235741:quan_dth235741@ac-ksq7wog-shard-00-01.i6nv6qm.mongodb.net:27017/quality_fashion?ssl=true&authSource=admin';
mongoose.connect(uri)
  .then(() => console.log('QUALITY Fashion Store đã kết nối MongoDB Atlas.'))
  .catch(err => console.log('❌ Lỗi kết nối MongoDB:', err));

// ==========================================
// 4. CẤU HÌNH MIDDLEWARE & STATIC FILES
// ==========================================
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 5. CẤU HÌNH SESSION 
// ==========================================
app.use(session({
    name: 'QUALITY_Session',
    secret: 'QUALITY Fashion Store',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// ==========================================
// 6. CẤU HÌNH BIẾN TOÀN CỤC (Locals)
// ==========================================
app.use((req, res, next) => {
    res.locals.session = req.session; 
    let err = req.session.error;
    let msg = req.session.success;
    let swal = req.session.swal;
    delete req.session.error;
    delete req.session.success;
    delete req.session.swal;
    res.locals.message = err ? `<span class="text-danger">${err}</span>` : (msg ? `<span class="text-success">${msg}</span>` : '');
    res.locals.swal = swal;
    next();
});

// ==========================================
// 7. KHAI BÁO ROUTER (QUAN TRỌNG: Thứ tự ưu tiên)
// ==========================================
// Đưa các đường dẫn cụ thể hoặc prefix đặc biệt lên trước để tránh xung đột
app.use('/admin/chat', require('./routers/chat')); // Gắn thẳng prefix /admin/chat
app.use('/admin', require('./routers/admin'));      // Router admin xử lý các việc khác

// Các router chức năng cụ thể
app.use('/danhmuc', require('./routers/danhmuc')); 
app.use('/cskh', require('./routers/cskh')); 
app.use('/taikhoan', require('./routers/taikhoan'));
app.use('/sanpham', require('./routers/sanpham'));
app.use('/giohang', require('./routers/giohang'));
app.use('/thanhtoan', require('./routers/thanhtoan'));
app.use('/donhang', require('./routers/donhang'));

// Các router chung chung (có thể chứa /:id) để ở cuối cùng
app.use('/', require('./routers/auth'));
app.use('/', require('./routers/index'));

// ==========================================
// 8. LOGIC REAL-TIME SOCKET.IO
// ==========================================
io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(userId));

    // Lắng nghe tin nhắn từ khách
    socket.on('client_send_message', async (data) => {
        try {
            const { idUser, noiDung } = data;
            const msg = new TinNhan({ 
                idNguoiGui: idUser, 
                noiDung: noiDung, 
                nguoiGui: 'user' 
            });

            await msg.save();
            io.emit('admin_receive_message', { idUser, noiDung, time: new Date() });
            
        } catch (error) {
            // GIỮ LẠI ĐỂ BẮT LỖI NGẦM
            console.error("❌ LỖI LƯU TIN KHÁCH HÀNG:", error.message); 
        }
    });

    // Lắng nghe tin nhắn từ Admin
    socket.on('admin_send_message', async (data) => {
        try {
            const { idKhachHang, noiDung } = data;
            const msg = new TinNhan({ 
                idNguoiNhan: idKhachHang, 
                noiDung: noiDung, 
                nguoiGui: 'admin' 
            });

            await msg.save();
            io.to(idKhachHang).emit('client_receive_reply', { noiDung });
            
        } catch (error) {
             // GIỮ LẠI ĐỂ BẮT LỖI NGẦM
             console.error("❌ LỖI LƯU TIN ADMIN:", error.message);
        }
    });
});
// ==========================================
// 9. KHỞI CHẠY SERVER 
// ==========================================
http.listen(3000, () => {
    console.log('QUALITY Server is running at http://127.0.0.1:3000');
});
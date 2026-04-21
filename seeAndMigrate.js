const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Import các model 
const SanPham = require('./models/sanpham'); 
const ChiTietDonHang = require('./models/chitietdonhang'); 
const DonHang = require('./models/donhang');

// 1. Cấu hình Cloudinary
cloudinary.config({ 
    cloud_name: 'db5ykirtg', 
    api_key: '659993772793257', 
    api_secret: 'uogoevPb7ImVCXnXA_GE_dETaI0' 
});

// 2. Kết nối MongoDB Atlas
const MONGODB_URI = 'mongodb://quan_dth235741:quan_dth235741@ac-ksq7wog-shard-00-01.i6nv6qm.mongodb.net:27017/quality_fashion?ssl=true&authSource=admin';

// Map danh mục
const idDanhMucMap = {
    aoThunNam: '69dbab7c52ee5283105f4b47',
    quanShortNam: '69dbab7c52ee5283105f4b48',
    aoSoMiNam: '69dbab7c52ee5283105f4b49',
    aoPoloNam: '69dbab7c52ee5283105f4b4a',
    quanDaiNam: '69dbab7c52ee5283105f4b4b',
    aoNu: '69dbab7c52ee5283105f4b4c',
    vayDam: '69dbab7c52ee5283105f4b4d',
    quanNu: '69dbab7c52ee5283105f4b4e',
    phuKien: '69dbab7c52ee5283105f4b4f'
};

// Hàm tạo biến thể
const taoBienThe = (tenSanPham, danhMucId) => {
    if (danhMucId === idDanhMucMap.phuKien) {
        return [{ mauSac: tenSanPham.split(' ').pop(), kichThuoc: 'Freesize', soLuong: 50 }];
    }
    const mauSac = tenSanPham.split(' ').pop();
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    return sizes.map(size => ({
        mauSac: mauSac,
        kichThuoc: size,
        soLuong: 10
    }));
};

// Dữ liệu 
const danhSachSanPham = [
    // QUẦN SHORT NAM
    { ma: 'SHORT_PROMAX_BLACK', ten: 'Quần Short Nam Thể Thao Promax-S1 Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Short Nam Thể Thao Promax-S1_Black.jpg', gia: 250000, km: 0, mt: 'Ngắn vừa phải, co giãn tốt' },
    { ma: 'SHORT_PROMAX_BLUE', ten: 'Quần Short Nam Thể Thao Promax-S1 Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Short Nam Thể Thao Promax-S1_Blue.jpg', gia: 250000, km: 0, mt: 'Ngắn vừa phải, co giãn tốt' },
    { ma: 'SHORT_KAKI_BE', ten: 'Quần Shorts Nam Kaki Excool Be', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Nam Kaki Excool_Be.jpg', gia: 280000, km: 0, mt: 'Mặc đi chơi cực chất' },
    { ma: 'SHORT_KAKI_BLACK', ten: 'Quần Shorts Nam Kaki Excool Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Nam Kaki Excool_Black.jpg', gia: 280000, km: 0, mt: 'Mặc đi chơi cực chất' },
    { ma: 'SHORT_KAKI_BLUE', ten: 'Quần Shorts Nam Kaki Excool Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Nam Kaki Excool_Blue.jpg', gia: 280000, km: 0, mt: 'Mặc đi chơi cực chất' },
    { ma: 'SHORT_EXDRY_BLACK', ten: 'Quần Shorts Nam Logo Basic Exdry Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần shorts nam logo basic Exdry ProActive World Cup_Black.jpg', gia: 199000, km: 0, mt: 'Siêu nhẹ, thoát mồ hôi' },
    { ma: 'SHORT_EXDRY_BLUE', ten: 'Quần Shorts Nam Logo Basic Exdry Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần shorts nam logo basic Exdry ProActive World Cup_Blue.jpg', gia: 199000, km: 0, mt: 'Siêu nhẹ, thoát mồ hôi' },
    { ma: 'SHORT_EXDRY_WHITE', ten: 'Quần Shorts Nam Logo Basic Exdry Trắng', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần shorts nam logo basic Exdry ProActive World Cup_White.jpg', gia: 199000, km: 0, mt: 'Siêu nhẹ, thoát mồ hôi' },
    { ma: 'SHORT_SUMMER_BLACK', ten: 'Quần Shorts Summer Cool 7inch Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Summer Cool 7inch 2 lớp_Black.jpg', gia: 220000, km: 0, mt: 'Có quần lót bảo vệ bên trong' },
    { ma: 'SHORT_SUMMER_BLUE', ten: 'Quần Shorts Summer Cool 7inch Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Summer Cool 7inch 2 lớp_Blue.jpg', gia: 220000, km: 0, mt: 'Có quần lót bảo vệ bên trong' },
    { ma: 'SHORT_SUMMER_WHITE', ten: 'Quần Shorts Summer Cool 7inch Trắng', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Summer Cool 7inch 2 lớp_White.jpg', gia: 220000, km: 0, mt: 'Có quần lót bảo vệ bên trong' },
    { ma: 'SHORT_MOVING_BE', ten: 'Quần Shorts Thể Thao 5 Moving Be', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Thể Thao 5 Moving_Be.jpg', gia: 210000, km: 0, mt: 'Cho các bài tập Cardio' },
    { ma: 'SHORT_MOVING_BLACK', ten: 'Quần Shorts Thể Thao 5 Moving Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Thể Thao 5 Moving_Black.jpg', gia: 210000, km: 0, mt: 'Cho các bài tập Cardio' },
    { ma: 'SHORT_MOVING_BLUE', ten: 'Quần Shorts Thể Thao 5 Moving Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Shorts Thể Thao 5 Moving_Blue.jpg', gia: 210000, km: 0, mt: 'Cho các bài tập Cardio' },
    { ma: 'SHORT_ULTRA_BLACK', ten: 'Quần Thể Thao Nam 7 Ultra Shorts Đen', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Thể Thao Nam 7 Ultra Shorts_Black.jpg', gia: 250000, km: 0, mt: 'Bền bỉ, chống xước' },
    { ma: 'SHORT_ULTRA_BLUE', ten: 'Quần Thể Thao Nam 7 Ultra Shorts Xanh', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Thể Thao Nam 7 Ultra Shorts_Blue.jpg', gia: 250000, km: 0, mt: 'Bền bỉ, chống xước' },
    { ma: 'SHORT_ULTRA_GREEN', ten: 'Quần Thể Thao Nam 7 Ultra Shorts Xanh Lá', dm: idDanhMucMap.quanShortNam, gt: 'Nam', anh: 'images/Nam/Quần Thể Thao Nam 7 Ultra Shorts_Green.jpg', gia: 250000, km: 0, mt: 'Bền bỉ, chống xước' },

    // QUẦN DÀI NAM
    { ma: 'JOGGER_FLEX1_RED', ten: 'Jogger Thể Thao Flexline Đỏ', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Jogger thể thao Flexline Active_Red.jpg', gia: 350000, km: 0, mt: 'Form ôm thể thao' },
    { ma: 'JOGGER_FLEX1_WHITE', ten: 'Jogger Thể Thao Flexline Trắng', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Jogger thể thao Flexline Active_White.jpg', gia: 350000, km: 0, mt: 'Form ôm thể thao' },
    { ma: 'JOGGER_FLEX2_BLACK', ten: 'Quần Joggers Thể Thao Flexline Đen', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần joggers thể thao nam Flexline Active_Black.jpg', gia: 350000, km: 0, mt: 'Form ôm thể thao' },
    { ma: 'JOGGER_FLEX2_BLUE', ten: 'Quần Joggers Thể Thao Flexline Xanh', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần joggers thể thao nam Flexline Active_Blue.jpg', gia: 350000, km: 0, mt: 'Form ôm thể thao' },
    { ma: 'KAKI_STRAIGHT_BLACK', ten: 'Quần Dài Nam Kaki Excool Straight Đen', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Dài Nam Kaki Excool dáng Straight_Black.jpg', gia: 420000, km: 10, mt: 'Kaki chống nhăn' },
    { ma: 'KAKI_STRAIGHT_GREY', ten: 'Quần Dài Nam Kaki Excool Straight Xám', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Dài Nam Kaki Excool dáng Straight_Grey.jpg', gia: 420000, km: 10, mt: 'Kaki chống nhăn' },
    { ma: 'KAKI_EXCOOL_BLACK', ten: 'Quần Dài Nam Kaki Excool Đen', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Dài Nam Kaki Excool_Black.jpg', gia: 390000, km: 0, mt: 'Ống vừa vặn' },
    { ma: 'KAKI_EXCOOL_BLUE', ten: 'Quần Dài Nam Kaki Excool Xanh', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Dài Nam Kaki Excool_Blue.jpg', gia: 390000, km: 0, mt: 'Ống vừa vặn' },
    { ma: 'KAKI_EXCOOL_GREY', ten: 'Quần Dài Nam Kaki Excool Xám', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Dài Nam Kaki Excool_Grey.jpg', gia: 390000, km: 0, mt: 'Ống vừa vặn' },
    { ma: 'JEAN_BASIC_BLACK', ten: 'Quần Jeans Nam Basics Straight Đen', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Jeans Nam Basics dáng Straight_Black.jpg', gia: 499000, km: 0, mt: 'Jeans nam tính' },
    { ma: 'JEAN_BASIC_BLUE', ten: 'Quần Jeans Nam Basics Straight Xanh', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Jeans Nam Basics dáng Straight_Blue.jpg', gia: 499000, km: 0, mt: 'Jeans nam tính' },
    { ma: 'JOGGER_DAILY_BLACK', ten: 'Quần Jogger Nam Daily Wear Đen', dm: idDanhMucMap.quanDaiNam, gt: 'Nam', anh: 'images/Nam/Quần Jogger Nam Daily Wear.jpg', gia: 320000, km: 0, mt: 'Mặc hàng ngày cực thoải mái' },

    // POLO NAM
    { ma: 'POLO_CAFE_BLACK', ten: 'Áo Polo Nam Cafe Đen', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Cafe_Black.jpg', gia: 350000, km: 0, mt: 'Sợi nilon bã cafe khử mùi' },
    { ma: 'POLO_CAFE_BLUE', ten: 'Áo Polo Nam Cafe Xanh', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Cafe_Blue.jpg', gia: 350000, km: 0, mt: 'Sợi nilon bã cafe khử mùi' },
    { ma: 'POLO_CAFE_WHITE', ten: 'Áo Polo Nam Cafe Trắng', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Cafe_White.jpg', gia: 350000, km: 0, mt: 'Sợi nilon bã cafe khử mùi' },
    { ma: 'POLO_PIQUE_BLACK', ten: 'Áo Polo Nam Pique Cotton Đen', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Pique Cotton_Black.jpg', gia: 299000, km: 10, mt: 'Cotton cá sấu thoáng mát' },
    { ma: 'POLO_PIQUE_BLUE', ten: 'Áo Polo Nam Pique Cotton Xanh', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Pique Cotton_Blue.jpg', gia: 299000, km: 10, mt: 'Cotton cá sấu thoáng mát' },
    { ma: 'POLO_PIQUE_WHITE', ten: 'Áo Polo Nam Pique Cotton Trắng', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Pique Cotton_White.jpg', gia: 299000, km: 10, mt: 'Cotton cá sấu thoáng mát' },
    { ma: 'POLO_PROMAX_BLACK', ten: 'Áo Polo Nam Thể Thao Promax-S1 Đen', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Thể Thao Promax-S1_Black.jpg', gia: 320000, km: 0, mt: 'Chất liệu thể thao mỏng nhẹ' },
    { ma: 'POLO_PROMAX_BLUE', ten: 'Áo Polo Nam Thể Thao Promax-S1 Xanh', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Thể Thao Promax-S1_Blue.jpg', gia: 320000, km: 0, mt: 'Chất liệu thể thao mỏng nhẹ' },
    { ma: 'POLO_PROMAX_WHITE', ten: 'Áo Polo Nam Thể Thao Promax-S1 Trắng', dm: idDanhMucMap.aoPoloNam, gt: 'Nam', anh: 'images/Nam/Áo Polo Nam Thể Thao Promax-S1_White.jpg', gia: 320000, km: 0, mt: 'Chất liệu thể thao mỏng nhẹ' },
    
    // SƠ MI NAM
    { ma: 'SOMI_ESS_BLACK', ten: 'Áo Sơ Mi Dài Tay Essentials Cotton Đen', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo Sơ Mi Dài Tay Essentials Cotton_Black.jpg', gia: 450000, km: 0, mt: 'Form tiêu chuẩn thanh lịch' },
    { ma: 'SOMI_ESS_BLUE', ten: 'Áo Sơ Mi Dài Tay Essentials Cotton Xanh', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo Sơ Mi Dài Tay Essentials Cotton_Blue.jpg', gia: 450000, km: 0, mt: 'Form tiêu chuẩn thanh lịch' },
    { ma: 'SOMI_ESS_WHITE', ten: 'Áo Sơ Mi Dài Tay Essentials Cotton Trắng', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo Sơ Mi Dài Tay Essentials Cotton_White.jpg', gia: 450000, km: 0, mt: 'Form tiêu chuẩn thanh lịch' },
    { ma: 'SOMI_MODAL_BLACK', ten: 'Áo Sơ Mi Dài Tay Modal Essential Đen', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi dài tay Modal Essential_Black.jpg', gia: 490000, km: 15, mt: 'Vải sợi sồi Modal siêu mềm' },
    { ma: 'SOMI_MODAL_BLUE', ten: 'Áo Sơ Mi Dài Tay Modal Essential Xanh', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi dài tay Modal Essential_Blue.jpg', gia: 490000, km: 15, mt: 'Vải sợi sồi Modal siêu mềm' },
    { ma: 'SOMI_MODAL_WHITE', ten: 'Áo Sơ Mi Dài Tay Modal Essential Trắng', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi dài tay Modal Essential_White.jpg', gia: 490000, km: 15, mt: 'Vải sợi sồi Modal siêu mềm' },
    { ma: 'SOMI_FLAN_BE', ten: 'Áo Sơ Mi Flannel 100 Cotton Be', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi Flannel 100 Cotton_Be.jpg', gia: 399000, km: 0, mt: 'Caro phong cách đường phố' },
    { ma: 'SOMI_FLAN_BLACK', ten: 'Áo Sơ Mi Flannel 100 Cotton Đen', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi Flannel 100 Cotton_Black.jpg', gia: 399000, km: 0, mt: 'Caro phong cách đường phố' },
    { ma: 'SOMI_FLAN_RED', ten: 'Áo Sơ Mi Flannel 100 Cotton Đỏ', dm: idDanhMucMap.aoSoMiNam, gt: 'Nam', anh: 'images/Nam/Áo sơ mi Flannel 100 Cotton_Red.jpg', gia: 399000, km: 0, mt: 'Caro phong cách đường phố' },

    // THUN NAM
    { ma: 'THUN_JACQ_BE', ten: 'Áo Thun Cổ V Jacquard Exdry Be', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun cổ V Jacquard Exdry ProActive World Cup_Be.jpg', gia: 250000, km: 0, mt: 'Vải Exdry khô nhanh' },
    { ma: 'THUN_JACQ_BLACK', ten: 'Áo Thun Cổ V Jacquard Exdry Đen', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun cổ V Jacquard Exdry ProActive World Cup_Black.jpg', gia: 250000, km: 0, mt: 'Vải Exdry khô nhanh' },
    { ma: 'THUN_JACQ_RED', ten: 'Áo Thun Cổ V Jacquard Exdry Đỏ', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun cổ V Jacquard Exdry ProActive World Cup_Red.jpg', gia: 250000, km: 0, mt: 'Vải Exdry khô nhanh' },
    { ma: 'THUN_JACQ_WHITE', ten: 'Áo Thun Cổ V Jacquard Exdry Trắng', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun cổ V Jacquard Exdry ProActive World Cup_White.jpg', gia: 250000, km: 0, mt: 'Vải Exdry khô nhanh' },
    { ma: 'THUN_GRAPHIC_BLUE', ten: 'Áo Thun Nam Chạy Bộ Graphic Dot Xanh', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo Thun Nam Chạy Bộ Graphic Dot_Blue.jpg', gia: 199000, km: 0, mt: 'Áo tập siêu nhẹ' },
    { ma: 'THUN_GRAPHIC_GREEN', ten: 'Áo Thun Nam Chạy Bộ Graphic Dot Xanh Lá', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo Thun Nam Chạy Bộ Graphic Dot_Green.jpg', gia: 199000, km: 0, mt: 'Áo tập siêu nhẹ' },
    { ma: 'THUN_GRAPHIC_RED', ten: 'Áo Thun Nam Chạy Bộ Graphic Dot Đỏ', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo Thun Nam Chạy Bộ Graphic Dot_Red.jpg', gia: 199000, km: 0, mt: 'Áo tập siêu nhẹ' },
    { ma: 'THUN_DINK_BLACK', ten: 'Áo Thun Pickleball Dinkshot Đen', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun Pickleball Dinkshot Essentials_Black.jpg', gia: 220000, km: 0, mt: 'Chuyên dụng Pickleball' },
    { ma: 'THUN_DINK_BLUE', ten: 'Áo Thun Pickleball Dinkshot Xanh', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun Pickleball Dinkshot Essentials_Blue.jpg', gia: 220000, km: 0, mt: 'Chuyên dụng Pickleball' },
    { ma: 'THUN_DINK_WHITE', ten: 'Áo Thun Pickleball Dinkshot Trắng', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Áo thun Pickleball Dinkshot Essentials_White.jpg', gia: 220000, km: 0, mt: 'Chuyên dụng Pickleball' },
    { ma: 'SET_PICKLE_BLACK', ten: 'Đồ Tập Pickleball 1 Đen', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Đồ tập Pickleball 1_Black.jpg', gia: 450000, km: 10, mt: 'Nguyên set tập cao cấp' },
    { ma: 'SET_PICKLE_BLUE', ten: 'Đồ Tập Pickleball 1 Xanh', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Đồ tập Pickleball 1_Blue.jpg', gia: 450000, km: 10, mt: 'Nguyên set tập cao cấp' },
    { ma: 'SET_PICKLE_WHITE', ten: 'Đồ Tập Pickleball 1 Trắng', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Đồ tập Pickleball 1_White.jpg', gia: 450000, km: 10, mt: 'Nguyên set tập cao cấp' },
    { ma: 'TSHIRT_FLEX_BLACK', ten: 'T-shirt Thể Thao Nam FlexLine Đen', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/T-shirt thể thao nam FlexLine Active_Black.jpg', gia: 250000, km: 0, mt: 'Co giãn 4 chiều' },
    { ma: 'TSHIRT_FLEX_BLUE', ten: 'T-shirt Thể Thao Nam FlexLine Xanh', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/T-shirt thể thao nam FlexLine Active_Blue.jpg', gia: 250000, km: 0, mt: 'Co giãn 4 chiều' },
    { ma: 'TSHIRT_FLEX_GREEN', ten: 'T-shirt Thể Thao Nam FlexLine Xanh Lá', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/T-shirt thể thao nam FlexLine Active_Green.jpg', gia: 250000, km: 0, mt: 'Co giãn 4 chiều' },
    { ma: 'TSHIRT_PROMAX_BLUE', ten: 'Tshirt Thể Thao Promax Flexline Xanh', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Tshirt thể thao Promax Flexline Active_Blue.jpg', gia: 280000, km: 0, mt: 'Mẫu mới cực chất' },
    { ma: 'TSHIRT_PROMAX_RED', ten: 'Tshirt Thể Thao Promax Flexline Đỏ', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Tshirt thể thao Promax Flexline Active_Red.jpg', gia: 280000, km: 0, mt: 'Mẫu mới cực chất' },
    { ma: 'TSHIRT_PROMAX_WHITE', ten: 'Tshirt Thể Thao Promax Flexline Trắng', dm: idDanhMucMap.aoThunNam, gt: 'Nam', anh: 'images/Nam/Tshirt thể thao Promax Flexline Active_White.jpg', gia: 280000, km: 0, mt: 'Mẫu mới cực chất' },

    // QUẦN DÀI / SHORT NỮ
    { ma: 'PANT_TRACK_BE', ten: 'Quần Dài Nữ Track Pants Windbreaker Be', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần dài nữ Track Pants Windbreaker_Be.jpg', gia: 380000, km: 0, mt: 'Phong cách thể thao đường phố' },
    { ma: 'PANT_TRACK_BLACK', ten: 'Quần Dài Nữ Track Pants Windbreaker Đen', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần dài nữ Track Pants Windbreaker_Black.jpg', gia: 380000, km: 0, mt: 'Phong cách thể thao đường phố' },
    { ma: 'PANT_TRACK_GREEN', ten: 'Quần Dài Nữ Track Pants Windbreaker Xanh Lá', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần dài nữ Track Pants Windbreaker_Green.jpg', gia: 380000, km: 0, mt: 'Phong cách thể thao đường phố' },
    { ma: 'JEAN_NU1_SUONG', ten: 'Quần Jean Nữ Ống Suông', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần jean ống suông.jpg', gia: 450000, km: 0, mt: 'Che khuyết điểm chân' },
    { ma: 'JEAN_NU2_BLUE', ten: 'Quần Jean Xanh Phối Chỉ Xám', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần jean xanh phối chỉ xám.jpg', gia: 480000, km: 0, mt: 'Thiết kế độc đáo' },
    { ma: 'QUAN_SUONG_XEP', ten: 'Quần Suông Xếp Ly Nữ', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần suông xếp ly.jpg', gia: 350000, km: 0, mt: 'Mặc đi làm hay đi chơi đều hợp' },
    { ma: 'SHORT_NU_EXDRY_BLACK', ten: 'Quần Shorts Nữ Exdry Đen', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần shorts nữ Exdry ProActive World Cup_Black.jpg', gia: 190000, km: 0, mt: 'Quần tập cạp cao' },
    { ma: 'SHORT_NU_EXDRY_BLUE', ten: 'Quần Shorts Nữ Exdry Xanh', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần shorts nữ Exdry ProActive World Cup_Blue.jpg', gia: 190000, km: 0, mt: 'Quần tập cạp cao' },
    { ma: 'SHORT_NU_EXDRY_WHITE', ten: 'Quần Shorts Nữ Exdry Trắng', dm: idDanhMucMap.quanNu, gt: 'Nữ', anh: 'images/Nu/Quần shorts nữ Exdry ProActive World Cup_White.jpg', gia: 190000, km: 0, mt: 'Quần tập cạp cao' },

    // VÁY ĐẦM NỮ
    { ma: 'VAY_TIEC_LIGHTBLUE', ten: 'Váy Đi Tiệc Xanh Nhạt', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy đi tiệc.jpg', gia: 650000, km: 20, mt: 'Váy liền thân sang trọng' },
    { ma: 'VAY_TIEC2_V', ten: 'Váy Đi Tiệc Cổ Chữ V', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy đi tiệc2.jpg', gia: 680000, km: 20, mt: 'Thanh lịch và nổi bật' },
    { ma: 'VAY_PICKLE1_BLUE', ten: 'Váy Pickleball LunaFlex Xanh', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy pickleball LunaFlex Exdry_Blue.jpg', gia: 390000, km: 0, mt: 'Váy thể thao kèm quần an toàn' },
    { ma: 'VAY_PICKLE1_WHITE', ten: 'Váy Pickleball LunaFlex Trắng', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy pickleball LunaFlex Exdry_White.jpg', gia: 390000, km: 0, mt: 'Váy thể thao kèm quần an toàn' },
    { ma: 'VAY_PICKLE2_BLACK', ten: 'Váy Polo Pickleball Dink Shot Đen', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy Polo Pickleball Dink Shot_Black.jpg', gia: 420000, km: 0, mt: 'Cổ polo thể thao chuyên nghiệp' },
    { ma: 'VAY_PICKLE2_BLUE', ten: 'Váy Polo Pickleball Dink Shot Xanh', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy Polo Pickleball Dink Shot_Blue.jpg', gia: 420000, km: 0, mt: 'Cổ polo thể thao chuyên nghiệp' },
    { ma: 'VAY_PICKLE2_WHITE', ten: 'Váy Polo Pickleball Dink Shot Trắng', dm: idDanhMucMap.vayDam, gt: 'Nữ', anh: 'images/Nu/Váy Polo Pickleball Dink Shot_White.jpg', gia: 420000, km: 0, mt: 'Cổ polo thể thao chuyên nghiệp' },
    
    // ÁO NỮ
    { ma: 'CROP_EXDRY_BE', ten: 'Áo Crop Cổ V Exdry Be', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo crop cổ V Exdry ProActive World Cup_Be.jpg', gia: 199000, km: 0, mt: 'Áo crop khoe eo thon' },
    { ma: 'CROP_EXDRY_GREEN', ten: 'Áo Crop Cổ V Exdry Xanh Lá', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo crop cổ V Exdry ProActive World Cup_Green.jpg', gia: 199000, km: 0, mt: 'Áo crop khoe eo thon' },
    { ma: 'CROP_EXDRY_WHITE', ten: 'Áo Crop Cổ V Exdry Trắng', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo crop cổ V Exdry ProActive World Cup_White.jpg', gia: 199000, km: 0, mt: 'Áo crop khoe eo thon' },
    { ma: 'LONG_VITAL_BLACK', ten: 'Áo Dài Tay Thể Thao Vital Seamless Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo dài tay thể thao Vital Seamless_Black.jpg', gia: 299000, km: 0, mt: 'Ôm sát body, giữ nhiệt' },
    { ma: 'LONG_VITAL_PINK', ten: 'Áo Dài Tay Thể Thao Vital Seamless Hồng', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo dài tay thể thao Vital Seamless_Pink.jpg', gia: 299000, km: 0, mt: 'Ôm sát body, giữ nhiệt' },
    { ma: 'JACKET_TRACK_BE', ten: 'Áo Khoác Nữ Track Jacket Be', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo khoác nữ Track Jacket Windbreaker khoá kéo_Be.jpg', gia: 550000, km: 15, mt: 'Chống gió cực đỉnh' },
    { ma: 'JACKET_TRACK_BLACK', ten: 'Áo Khoác Nữ Track Jacket Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo khoác nữ Track Jacket Windbreaker khoá kéo_Black.jpg', gia: 550000, km: 15, mt: 'Chống gió cực đỉnh' },
    { ma: 'JACKET_TRACK_GREEN', ten: 'Áo Khoác Nữ Track Jacket Xanh Lá', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo khoác nữ Track Jacket Windbreaker khoá kéo_Green.jpg', gia: 550000, km: 15, mt: 'Chống gió cực đỉnh' },
    { ma: 'JACKET_STUDIO_BE', ten: 'Áo Khoác Thể Thao Nữ Studio Be', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo khoác thể thao nữ Studio_Be.jpg', gia: 450000, km: 0, mt: 'Thời trang tập Yoga/Gym' },
    { ma: 'JACKET_STUDIO_BLUE', ten: 'Áo Khoác Thể Thao Nữ Studio Xanh', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo khoác thể thao nữ Studio_Blue.jpg', gia: 450000, km: 0, mt: 'Thời trang tập Yoga/Gym' },
    { ma: 'POLO_NU_PRO_BLACK', ten: 'Áo Polo Thể Thao Nữ Promax Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo Polo thể thao nữ Promax Exdry_Black.jpg', gia: 280000, km: 0, mt: 'Phù hợp Golf, Tennis' },
    { ma: 'POLO_NU_PRO_BLUE', ten: 'Áo Polo Thể Thao Nữ Promax Xanh', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo Polo thể thao nữ Promax Exdry_Blue.jpg', gia: 280000, km: 0, mt: 'Phù hợp Golf, Tennis' },
    { ma: 'POLO_NU_PRO_WHITE', ten: 'Áo Polo Thể Thao Nữ Promax Trắng', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo Polo thể thao nữ Promax Exdry_White.jpg', gia: 280000, km: 0, mt: 'Phù hợp Golf, Tennis' },
    { ma: 'THUN_CO_TRON_BLACK', ten: 'Áo Thun Cổ Tròn Exdry Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun cổ tròn Exdry ProActive World Cup_Black.jpg', gia: 180000, km: 0, mt: 'Thoáng mát, dễ phối đồ' },
    { ma: 'THUN_CO_TRON_BLUE', ten: 'Áo Thun Cổ Tròn Exdry Xanh', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun cổ tròn Exdry ProActive World Cup_Blue.jpg', gia: 180000, km: 0, mt: 'Thoáng mát, dễ phối đồ' },
    { ma: 'THUN_CO_TRON_RED', ten: 'Áo Thun Cổ Tròn Exdry Đỏ', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun cổ tròn Exdry ProActive World Cup_Red.jpg', gia: 180000, km: 0, mt: 'Thoáng mát, dễ phối đồ' },
    { ma: 'THUN_COMPACT_BLACK', ten: 'Áo Thun Cotton Compact 7th Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun Cotton Compact_Black.jpg', gia: 220000, km: 0, mt: 'Cotton siêu mát' },
    { ma: 'THUN_COMPACT_WHITE', ten: 'Áo Thun Cotton Compact 7th Trắng', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun Cotton Compact_White.jpg', gia: 220000, km: 0, mt: 'Cotton siêu mát' },
    { ma: 'THUN_CORE_TEE_BLACK', ten: 'Áo Thun Nữ Chạy Bộ Core Tee Slim Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun nữ chạy bộ Core Tee Slim_Black.jpg', gia: 210000, km: 0, mt: 'Dáng slim fit ôm gọn' },
    { ma: 'THUN_CORE_TEE_GREY', ten: 'Áo Thun Nữ Chạy Bộ Core Tee Slim Xám', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun nữ chạy bộ Core Tee Slim_Grey.jpg', gia: 210000, km: 0, mt: 'Dáng slim fit ôm gọn' },
    { ma: 'THUN_CORE_TEE_RED', ten: 'Áo Thun Nữ Chạy Bộ Core Tee Slim Đỏ', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Áo thun nữ chạy bộ Core Tee Slim_Red.jpg', gia: 210000, km: 0, mt: 'Dáng slim fit ôm gọn' },
    { ma: 'THUN_COOLMATE_BLACK', ten: 'Áo T-shirt Chạy Bộ Light Weight Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/NTOXCOOLMATE Áo T-shirt chạy bộ Light Weight_Black.jpg', gia: 190000, km: 0, mt: 'Hợp tác độc quyền' },
    { ma: 'THUN_COOLMATE_GREEN', ten: 'Áo T-shirt Chạy Bộ Light Weight Xanh Lá', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/NTOXCOOLMATE Áo T-shirt chạy bộ Light Weight_Green.jpg', gia: 190000, km: 0, mt: 'Hợp tác độc quyền' },
    { ma: 'TSHIRT_QUICK_BLACK', ten: 'Tshirt Thể Thao Nữ Quick Dry Tight Đen', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Tshirt thể thao nữ Quick Dry Tight_Black.jpg', gia: 250000, km: 0, mt: 'Mau khô, không mùi' },
    { ma: 'TSHIRT_QUICK_RED', ten: 'Tshirt Thể Thao Nữ Quick Dry Tight Đỏ', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Tshirt thể thao nữ Quick Dry Tight_Red.jpg', gia: 250000, km: 0, mt: 'Mau khô, không mùi' },
    { ma: 'TSHIRT_QUICK_WHITE', ten: 'Tshirt Thể Thao Nữ Quick Dry Tight Trắng', dm: idDanhMucMap.aoNu, gt: 'Nữ', anh: 'images/Nu/Tshirt thể thao nữ Quick Dry Tight_White.jpg', gia: 250000, km: 0, mt: 'Mau khô, không mùi' },

    // PHỤ KIỆN
    { ma: 'PK_BOCHAN_WHITE', ten: 'Tất dài Essentials Trắng', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Bó chân Essentials Coolmate.jpg', gia: 150000, km: 0, mt: 'Bảo vệ cơ bắp khi chạy bộ' },
    { ma: 'PK_BAG1_BLUE', ten: 'Coolmate Sporty Bag Xanh', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Coolmate Sporty Bag.jpg', gia: 299000, km: 0, mt: 'Túi thể thao chống nước' },
    { ma: 'PK_GANG_BLACK', ten: 'Găng Tay Chống Tia UV Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Găng tay chống tia UV.jpg', gia: 120000, km: 0, mt: 'Bảo vệ da dưới trời nắng gắt' },
    { ma: 'PK_KHAN_GREY', ten: 'Khăn Tập Gym Siêu Thấm Xám', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Khăn Tập Gym.jpg', gia: 99000, km: 0, mt: 'Vải cotton thấm hút mồ hôi' },
    { ma: 'PK_MU_BLACK', ten: 'Mũ Lưỡi Trai Dáng Thể Thao Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Mũ Lưỡi Trai Dáng Thể Thao.jpg', gia: 150000, km: 0, mt: 'Form đứng, khóa điều chỉnh size' },
    { ma: 'PK_TAT1_BLACK', ten: 'Tất Cổ Trung Cầu Lông Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Tất cổ trung cầu lông.jpg', gia: 50000, km: 0, mt: 'Đệm xù giảm xóc cực tốt' },
    { ma: 'PK_TAT2_BLACK', ten: 'Tất Pickleball Cổ Trung Court Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Tất Pickleball Cổ Trung Court Black.jpg', gia: 60000, km: 0, mt: 'Bám giày, chống trượt' },
    { ma: 'PK_TUIHONG_BLACK', ten: 'Túi Đeo Hông Đa Năng Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Túi đeo hông đa năng.jpg', gia: 250000, km: 0, mt: 'Đựng điện thoại, chìa khóa khi chạy' },
    { ma: 'PK_TOTE_RED', ten: 'Túi Tote Bag Disney Spring Đỏ', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Túi Tote bag Disney Spring Blessing.jpg', gia: 180000, km: 0, mt: 'Họa tiết dễ thương, tiện lợi' },
    { ma: 'PK_TUITRONG1_BLACK', ten: 'Túi Trống Tập Gym Đen', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Túi trống Tập Gym.jpg', gia: 350000, km: 0, mt: 'Ngăn chứa rộng rãi, khóa zip mượt' },
    { ma: 'PK_TUITRONG2_WHITE', ten: 'Túi UT Duffle Size Vừa 18L Trắng', dm: idDanhMucMap.phuKien, gt: 'Unisex', anh: 'images/PhuKien/Túi UT Duffle size vừa 18L.jpg', gia: 420000, km: 0, mt: 'Đựng đồ du lịch ngắn ngày' }
];

const seedAndMigrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('🚀 Đã kết nối MongoDB thành công!');

        // 1. Xóa sạch dữ liệu cũ
        await SanPham.deleteMany({});
        await DonHang.deleteMany({});
        await ChiTietDonHang.deleteMany({});
        console.log(' Đã dọn dẹp dữ liệu cũ của Sản phẩm, Đơn hàng và Chi tiết...');

        const sanPhamsDaLuu = [];

        // 2. Vòng lặp: Đẩy ảnh lên Cloudinary và Lưu Sản phẩm
        for (let sp of danhSachSanPham) {
            const duongDanVatLy = path.join(__dirname, 'public', sp.anh);

            try {
                console.log(`⏳ Đang xử lý: ${sp.ten}...`);
                
                // Đẩy ảnh lên Cloudinary
                const result = await cloudinary.uploader.upload(duongDanVatLy, {
                    folder: 'Quality_Fashion'
                });

                // Tạo đối tượng sản phẩm với link Cloudinary mới
                const sanPhamMoi = new SanPham({
                    maSanPham: sp.ma, 
                    tenSanPham: sp.ten,
                    idDanhMuc: sp.dm,
                    gioiTinh: sp.gt,
                    hinhAnh: result.secure_url, // Lấy link từ Cloudinary
                    giaNhap: Math.round(sp.gia * 0.6),
                    donGia: sp.gia,
                    tiLeGiamGia: sp.km,
                    moTa: sp.mt,
                    luotMua: 0,
                    bienThe: taoBienThe(sp.ten, sp.dm)
                });

                const savedSp = await sanPhamMoi.save();
                sanPhamsDaLuu.push(savedSp);
                console.log(`✅ Đã lưu: ${sp.ma}`);

            } catch (errUpload) {
                console.error(`❌ Lỗi tại ${sp.ten}:`, errUpload.message);
            }
        }

        // 3. Tạo Đơn hàng và Chi tiết mẫu
        if (sanPhamsDaLuu.length > 0) {
            const dh = new DonHang({
                khachHang: { hoTen: "Quân Admin", dienThoai: "0912345678", diaChi: "An Giang" },
                idNguoiDung: new mongoose.Types.ObjectId('69df92a662e2fdb1b5906124'),
                tongTien: sanPhamsDaLuu[0].donGia,
                tinhTrang: 'Đang xử lý',
                ngayDat: new Date()
            });
            const donHangDaLuu = await dh.save();

            const chiTiet = new ChiTietDonHang({
                idDonHang: donHangDaLuu._id,
                idSanPham: sanPhamsDaLuu[0]._id,
                tenSanPham: sanPhamsDaLuu[0].tenSanPham,
                hinhAnh: sanPhamsDaLuu[0].hinhAnh,
                mauSac: sanPhamsDaLuu[0].bienThe[0].mauSac,
                kichThuoc: sanPhamsDaLuu[0].bienThe[0].kichThuoc,
                soLuong: 1,
                giaNhap: sanPhamsDaLuu[0].giaNhap,
                donGia: sanPhamsDaLuu[0].donGia,
                thanhTien: sanPhamsDaLuu[0].donGia
            });
            await chiTiet.save();
            console.log('✅ Đã tạo Đơn hàng mẫu liên kết thành công!');
        }

        console.log('🎉 QUY TRÌNH HOÀN TẤT: DỮ LIỆU ĐÃ SẴN SÀNG TRÊN CLOUD!');
        process.exit();
    } catch (err) {
        console.error('Lỗi hệ thống:', err);
        process.exit(1);
    }
};

seedAndMigrate();
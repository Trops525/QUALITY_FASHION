const SanPham = require('../models/sanpham');

function findMatchingVariant(bienThe = [], { mauSac, kichThuoc }) {
    if (!Array.isArray(bienThe) || bienThe.length === 0) return null;

    return (
        bienThe.find(v => (!mauSac || v.mauSac === mauSac) && (!kichThuoc || v.kichThuoc === kichThuoc)) ||
        bienThe.find(v => !kichThuoc || v.kichThuoc === kichThuoc) ||
        bienThe.find(v => !mauSac || v.mauSac === mauSac) ||
        (bienThe.length === 1 ? bienThe[0] : null)
    );
}

async function updateProductInventoryAndSales({
    productId,
    mauSac,
    kichThuoc,
    stockDelta = 0,
    salesDelta = 0
}) {
    const sanPham = await SanPham.findById(productId);
    if (!sanPham) {
        return null;
    }

    const soLuongKhoThayDoi = Number(stockDelta) || 0;
    const luotMuaThayDoi = Number(salesDelta) || 0;

    if (soLuongKhoThayDoi !== 0) {
        const bienThe = findMatchingVariant(sanPham.bienThe, { mauSac, kichThuoc });

        if (!bienThe) {
            throw new Error(`Không tìm thấy biến thể phù hợp cho sản phẩm ${productId}`);
        }

        const soLuongMoi = (bienThe.soLuong || 0) + soLuongKhoThayDoi;
        if (soLuongMoi < 0) {
            throw new Error(`Sản phẩm ${productId} không đủ tồn kho cho biến thể ${mauSac || 'N/A'} - ${kichThuoc || 'N/A'}`);
        }

        bienThe.soLuong = soLuongMoi;
    }

    if (luotMuaThayDoi !== 0) {
        sanPham.luotMua = Math.max(0, (sanPham.luotMua || 0) + luotMuaThayDoi);
    }

    await sanPham.save();
    return sanPham;
}

module.exports = {
    updateProductInventoryAndSales
};

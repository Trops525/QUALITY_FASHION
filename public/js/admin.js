// Khởi tạo kết nối Socket.io cho tính năng Chat
const socket = typeof io !== 'undefined' ? io() : null;

document.addEventListener('DOMContentLoaded', function () {
    // =========================================
    // 1. CHỨC NĂNG HỘP THOẠI XÁC NHẬN (CONFIRM DIALOG)
    // =========================================
    document.querySelectorAll('a[data-confirm], button[data-confirm]').forEach(function (element) {
        element.addEventListener('click', function (event) {
            const message = element.getAttribute('data-confirm');
            if (!confirm(message)) event.preventDefault();
        });
    });

    // =========================================
    // 2. XỬ LÝ CHECKBOX VÀ XÓA HÀNG LOẠT (BULK ACTIONS)
    // =========================================
    const checkAll = document.getElementById('check-all');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const bulkActions = document.getElementById('bulk-actions');
    const countDisplay = document.getElementById('count');

    // Hàm cập nhật trạng thái hiển thị của thanh công cụ
    function updateBulkActions() {
        if (!bulkActions || !countDisplay) return;
        
        let checkedCount = 0;
        itemCheckboxes.forEach(cb => { if (cb.checked) checkedCount++; });
        
        countDisplay.textContent = checkedCount;
        bulkActions.style.display = checkedCount > 0 ? 'block' : 'none';
        
        // Tự động tích/bỏ tích ô "Chọn tất cả" nếu người dùng chọn hết các ô con
        if (checkAll) {
            checkAll.checked = (checkedCount === itemCheckboxes.length && itemCheckboxes.length > 0);
        }
    }

    // Sự kiện khi bấm ô "Chọn tất cả"
    if (checkAll) {
        checkAll.addEventListener('change', function() {
            itemCheckboxes.forEach(cb => { cb.checked = this.checked; });
            updateBulkActions();
        });
    }

    // Sự kiện khi bấm từng ô checkbox sản phẩm
    itemCheckboxes.forEach(cb => { cb.addEventListener('change', updateBulkActions); });

    // =========================================
    // 3. FORM THÊM/SỬA SẢN PHẨM (XỬ LÝ THÊM BIẾN THỂ & ẢNH PREVIEW)
    // =========================================
    const btnAddVariant = document.getElementById('btn-add-variant');
    const variantContainer = document.getElementById('variant-container');

    if (btnAddVariant && variantContainer) {
        btnAddVariant.addEventListener('click', function() {
            const mauSacInputs = document.querySelectorAll('.input-mau-sac');
            const lastColor = mauSacInputs.length > 0 ? mauSacInputs[mauSacInputs.length - 1].value : "";

            const newRow = document.createElement('div');
            newRow.className = 'variant-row';
            newRow.innerHTML = `
                <div class="form-col form-group" style="margin-bottom: 0;">
                    <label>Màu sắc:</label>
                    <input type="text" name="mau_sac[]" class="input-mau-sac" value="${lastColor}" placeholder="VD: Đen..." required>
                </div>
                <div class="form-col form-group" style="margin-bottom: 0;">
                    <label>Kích thước (Size):</label>
                    <select name="kich_thuoc[]" class="select-kich-thuoc" required>
                        <option value="" selected>-- Chọn Size --</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="Freesize">Freesize</option>
                    </select>
                </div>
                <div class="form-col form-group" style="margin-bottom: 0;">
                    <label>Số lượng kho:</label>
                    <input type="number" name="so_luong[]" class="input-so-luong" value="10" min="0" required>
                </div>
                <button type="button" class="btn-remove-variant" onclick="this.parentElement.remove()"><i class="fa fa-times"></i></button>
            `;
            variantContainer.appendChild(newRow);
        });
    }

    // Tính năng: Xem trước hình ảnh khi upload
    const imageInput = document.getElementById('hinh_anh');
    const imagePreview = document.getElementById('image-preview');
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // =========================================
    // 4. KIỂM TRA TÍNH HỢP LỆ FORM THÊM NGƯỜI DÙNG
    // =========================================
    const formThemNguoiDung = document.getElementById('form-them-nguoi-dung');
    if (formThemNguoiDung) {
        formThemNguoiDung.addEventListener('submit', function(e) {
            const tenDN = document.querySelector('input[name="TenDangNhap"]').value.trim();
            const email = document.querySelector('input[name="Email"]').value.trim();
            const sdt = document.querySelector('input[name="DienThoai"]').value.trim();
            const mk = document.querySelector('input[name="MatKhau"]').value;
            const xacNhanMk = document.querySelector('input[name="XacNhanMatKhau"]').value;

            if (tenDN.length <= 3) { e.preventDefault(); return alert('Tên đăng nhập phải dài hơn 3 ký tự!'); }
            if (!email.includes('@')) { e.preventDefault(); return alert('Vui lòng nhập đúng địa chỉ Email!'); }
            if (!/^[0-9]{10}$/.test(sdt)) { e.preventDefault(); return alert('Số điện thoại phải gồm đúng 10 chữ số!'); }
            if (mk.length <= 4) { e.preventDefault(); return alert('Mật khẩu phải dài hơn 4 ký tự!'); }
            if (mk !== xacNhanMk) { e.preventDefault(); return alert('Xác nhận mật khẩu không khớp!'); }
        });
    }

// =========================================
    // 5. XỬ LÝ TRANG THỐNG KÊ (Lọc theo thời gian)
    // =========================================
    const formFilterThongKe = document.getElementById('form-filter-thongke');
    if (formFilterThongKe) {
        const filterMonth = document.getElementById('filter-month');
        const filterYear = document.getElementById('filter-year');

        if (filterMonth) filterMonth.addEventListener('change', () => formFilterThongKe.submit());
        if (filterYear) filterYear.addEventListener('change', () => formFilterThongKe.submit());
    }

    // =========================================
    // 6. LOGIC REAL-TIME CHAT CHO ADMIN
    // =========================================
    const receiverIdInput = document.getElementById('receiverId');
    const receiverId = receiverIdInput ? receiverIdInput.value : null;

    if (receiverId && socket) {
        const btnAdminSend = document.getElementById('btnAdminSend');
        const adminInput = document.getElementById('adminInput');
        const chatWindow = document.getElementById('chatWindow');

        // Cuộn xuống cuối ngay khi vừa mở tin nhắn lên
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // --- 1. XỬ LÝ KHI ADMIN BẤM GỬI ---
        const sendAdminMessage = () => {
            const text = adminInput.value.trim();
            if (text) {
                // Gửi thẳng lên Server qua Socket.io
                socket.emit('admin_send_message', { 
                    idKhachHang: receiverId, 
                    noiDung: text 
                });
                
                // Tự in ra màn hình của Admin bên phải (class 'sent')
                appendAdminMessage('sent', text);
                adminInput.value = '';
            }
        };

        if (btnAdminSend) btnAdminSend.addEventListener('click', sendAdminMessage);
        if (adminInput) adminInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendAdminMessage();
        });

        // --- 2. NHẬN TIN NHẮN MỚI TỪ KHÁCH ---
        socket.on('admin_receive_message', (data) => {
            // Chỉ hiện tin nhắn ra nếu khách gửi trùng với người Admin đang mở xem
            if (data.idUser === receiverId) {
                appendAdminMessage('received', data.noiDung);
            }
        });

        // Hàm giúp tự động in tin nhắn và cuộn trang
        function appendAdminMessage(type, text) {
            const div = document.createElement('div');
            div.className = `message ${type}`;
            div.innerText = text;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }
});


// Xử lý sửa tên danh mục
function suaDanhMuc(id, currentName) {
    let newName = prompt("Nhập tên danh mục mới:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
        let form = document.createElement('form'); form.method = 'POST'; form.action = '/admin/danhmuc/sua/' + id;
        let input = document.createElement('input'); input.type = 'hidden'; input.name = 'ten_danh_muc'; input.value = newName;
        form.appendChild(input); document.body.appendChild(form); form.submit();
    }
}

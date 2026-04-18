document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. TRANG ĐĂNG KÝ (Kiểm tra mật khẩu)
    // ==========================================
    const registrationForm = document.querySelector('form[action="/dangky"]');

    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            const hoTen = document.querySelector('input[name="HoTen"]').value.trim();
            const tenDN = document.querySelector('input[name="TenDangNhap"]').value.trim();
            const email = document.querySelector('input[name="Email"]').value.trim();
            const sdt = document.querySelector('input[name="DienThoai"]').value.trim();
            const mk = document.getElementById('MatKhau').value;
            const xnmk = document.getElementById('XacNhanMatKhau').value;

            // Kiểm tra Họ tên 
            if (!hoTen) {
                e.preventDefault();
                return Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập Họ và tên!' });
            }

            // Kiểm tra Tên đăng nhập (Độ dài > 3) 
            if (!tenDN || tenDN.length <= 3) {
                e.preventDefault();
                return Swal.fire({ icon: 'error', title: 'Tên đăng nhập', text: 'Tên đăng nhập phải dài hơn 3 ký tự!' });
            }

            // Kiểm tra định dạng Email 
            if (!email || !email.includes('@')) {
                e.preventDefault();
                return Swal.fire({ icon: 'error', title: 'Email không hợp lệ', text: 'Vui lòng nhập đúng địa chỉ Email!' });
            }

            // Kiểm tra định dạng SĐT (10 số) 
            if (!/^[0-9]{10}$/.test(sdt)) {
                e.preventDefault();
                return Swal.fire({ icon: 'error', title: 'Số điện thoại', text: 'Số điện thoại phải bao gồm 10 chữ số!' });
            }

            // Kiểm tra độ dài mật khẩu 
            if (mk.length <= 4) {
                e.preventDefault();
                return Swal.fire({ icon: 'error', title: 'Mật khẩu yếu', text: 'Mật khẩu phải dài hơn 4 ký tự!' });
            }

            // Kiểm tra khớp mật khẩu 
            if (mk !== xnmk) {
                e.preventDefault();
                return Swal.fire({ icon: 'error', title: 'Mật khẩu không khớp', text: 'Xác nhận mật khẩu phải giống mật khẩu đã nhập!' });
            }
        });
    }

    // ==========================================
    // 1.1 HIỂN THỊ THÔNG BÁO ĐĂNG KÝ/ĐĂNG NHẬP
    // ==========================================
    const authMsgData = document.getElementById('auth-msg-data');
    if (authMsgData) {
        const icon = authMsgData.getAttribute('data-icon');
        const title = authMsgData.getAttribute('data-title');
        const text = authMsgData.getAttribute('data-text');
        const redirect = authMsgData.getAttribute('data-redirect');

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonText: 'OK'
            }).then(() => {
                if (redirect) window.location.href = redirect;
            });
        } else {
            alert(text);
            if (redirect) window.location.href = redirect;
        }
    }

    // ==========================================
    // 2. TRANG CHI TIẾT (Chọn Size Áo)
    // ==========================================
    const sizeRadios = document.querySelectorAll('.radio-size');
    if (sizeRadios.length > 0) {
        sizeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                document.querySelectorAll('.size-btn').forEach(btn => {
                    btn.style.background = '#fff';
                    btn.style.color = '#000';
                    btn.style.borderColor = '#ddd';
                });
                const span = this.nextElementSibling;
                span.style.background = '#000';
                span.style.color = '#fff';
                span.style.borderColor = '#000';
            });
        });
    }

    // ==========================================
    // 3. TRANG CHỦ (Slide Banner)
    // ==========================================
    let slides = document.getElementsByClassName("slide");
    if (slides.length > 0) {
        let slideIndex = 1;
        
        // Đẩy hàm ra window để nút bấm trong HTML gọi được
        window.plusSlides = function(n) {
            showSlides(slideIndex += n);
        }
        
        function showSlides(n) {
            if (n > slides.length) {slideIndex = 1}    
            if (n < 1) {slideIndex = slides.length}
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";  
            }
            slides[slideIndex-1].style.display = "block";  
        }
        
        // 3s tự động chuyển slide
        setInterval(() => { window.plusSlides(1); }, 3000);
    }
});

// ==========================================
// 4. TRANG SẢN PHẨM (Bộ lọc & Phân trang)
// ==========================================
window.applySort = function(sortValue) {
    document.getElementById('hiddenSort').value = sortValue;
    submitFormWithPage(1);
}

window.changePage = function(pageStr) {
    event.preventDefault(); 
    // Lấy số trang tối đa từ thẻ input ẩn trong EJS
    const maxPagesElement = document.getElementById('maxPagesData');
    const maxPages = maxPagesElement ? parseInt(maxPagesElement.value, 10) : 1;
    const page = parseInt(pageStr, 10);
    
    if (isNaN(page) || page < 1 || page > maxPages) return;
    submitFormWithPage(page);
}

window.submitFormWithPage = function(pageNumber) {
    const form = document.getElementById('filterForm');
    if(form) {
        let pageInput = form.querySelector('input[name="page"]');
        if (!pageInput) {
            pageInput = document.createElement('input');
            pageInput.type = 'hidden';
            pageInput.name = 'page';
            form.appendChild(pageInput);
        }
        pageInput.value = pageNumber;
        form.submit();
    }
}

// ==========================================
    // 5. TRANG GIỎ HÀNG (Tính tiền & Chọn món)
// ==========================================
    const cartForm = document.getElementById('cart-form');
    if (cartForm) {
        const checkAll = document.getElementById('check-all');
        const checkItems = document.querySelectorAll('.check-item');
        const displayTotal = document.getElementById('display-total');
        const btnCheckout = document.getElementById('btn-checkout');

        function calculateTotal() {
            let currentTotal = 0;
            checkItems.forEach(item => {
                if (item.checked) {
                    currentTotal += parseFloat(item.getAttribute('data-price'));
                }
            });
            if (displayTotal) {
                displayTotal.innerText = new Intl.NumberFormat('vi-VN').format(currentTotal) + ' đ';
            }
        }

        if (checkAll) {
            checkAll.addEventListener('change', function() {
                checkItems.forEach(item => { item.checked = this.checked; });
                calculateTotal();
            });
        }

        checkItems.forEach(item => {
            item.addEventListener('change', function() {
                const allChecked = Array.from(checkItems).every(i => i.checked);
                if (checkAll) checkAll.checked = allChecked;
                calculateTotal();
            });
        });

        if (btnCheckout) {
            btnCheckout.addEventListener('click', function(e) {
                const hasChecked = Array.from(checkItems).some(i => i.checked);
                if (!hasChecked) {
                    e.preventDefault(); 
                    alert('Vui lòng tích chọn ít nhất 1 sản phẩm trước khi thanh toán!');
                }
            });
        }
    }
  
    
    document.addEventListener('DOMContentLoaded', function() {
    // Xử lý các nút bấm trong trang Đơn hàng
    const orderButtons = document.querySelectorAll('.btn-order');

        orderButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Nếu nút có thuộc tính onclick (xác nhận) thì để HTML lo
                // Ở đây ta có thể thêm hiệu ứng loading khi nhấn
                if (this.innerText.includes('Đã nhận hàng') || this.innerText.includes('Hủy')) {
                    // Hiệu ứng chờ khi đang chuyển hướng
                    setTimeout(() => {
                        this.style.opacity = '0.5';
                        this.style.pointerEvents = 'none';
                        this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xử lý...';
                    }, 100);
                }
            });
        });
    });
// ==========================================
    // 6. TRANG THANH TOÁN (Bản cập nhật tối ưu)
 // ==========================================
    const qrContainer = document.getElementById('qr-payment-container');
    const paymentRadios = document.querySelectorAll('input[name="phuongThuc"]');

    if (qrContainer && paymentRadios.length > 0) {
        // Hàm kiểm tra trạng thái để ẩn/hiện
        function toggleQR() {
            const selected = document.querySelector('input[name="phuongThuc"]:checked');
            if (selected && selected.value === 'BANK') {
                qrContainer.style.display = 'block';
            } else {
                qrContainer.style.display = 'none';
            }
        }
        // Chạy ngay lần đầu khi load trang
        toggleQR();
        // Lắng nghe khi người dùng thay đổi lựa chọn
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', toggleQR);
        });
    }

// ==========================================
// 7. TRANG TT TÀI KHOẢN (Hiệu ứng lật Form & Thông báo)
// ==========================================
const btnShowPwd = document.getElementById('btn-show-pwd');
const btnCancelPwd = document.getElementById('btn-cancel-pwd');
const infoSection = document.getElementById('info-section');
const pwdSection = document.getElementById('password-section');
const msgData = document.getElementById('msg-data');

// 7.1 Xử lý thông báo SweetAlert2
if (msgData) {
    const content = msgData.getAttribute('data-content');
    const type = msgData.getAttribute('data-type');

    Swal.fire({
        icon: type,
        title: type === 'success' ? 'Thành công!' : 'Thất bại!',
        html: content, 
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });

    // 7.2 Logic bổ sung: Nếu đổi mật khẩu thành công, đảm bảo hiện lại Info Section
    if (type === 'success' && content.includes("mật khẩu")) {
        if (infoSection) infoSection.style.display = 'block';
        if (pwdSection) pwdSection.style.display = 'none';
    }
}

// 7.3 Sự kiện MỞ form Đổi mật khẩu
if (btnShowPwd) {
    btnShowPwd.addEventListener('click', function() {
        if (infoSection) infoSection.style.display = 'none';
        if (pwdSection) {
            pwdSection.style.display = 'block';
            // Delay nhẹ để hiệu ứng transition opacity hoạt động
            setTimeout(() => { pwdSection.style.opacity = '1'; }, 10);
        }
    });
}

// 7.4 Sự kiện ĐÓNG form (Bấm Hủy)
if (btnCancelPwd) {
    btnCancelPwd.addEventListener('click', function() {
        if (pwdSection) {
            pwdSection.style.opacity = '0'; 
            setTimeout(() => { 
                pwdSection.style.display = 'none'; 
                if (infoSection) infoSection.style.display = 'block';
                
                // Xóa trắng input sau khi đóng để bảo mật
                const pwdInputs = pwdSection.querySelectorAll('input[type="password"]');
                pwdInputs.forEach(input => input.value = '');
            }, 300); 
        }
    });
}
// ==========================================
    // 8. TRANG CSKH (Lọc câu hỏi FAQ)
    // ==========================================
    const cskhMenuItems = document.querySelectorAll('.cskh-menu-item');
    const faqCards = document.querySelectorAll('.faq-card');

    if (cskhMenuItems.length > 0 && faqCards.length > 0) {
        cskhMenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); // Ngăn trình duyệt load lại trang

                // 1. Tắt màu đang sáng của menu cũ
                cskhMenuItems.forEach(menu => {
                    menu.classList.remove('active');
                    const icon = menu.querySelector('i');
                    if (icon) icon.classList.remove('text-primary');
                });
                
                // 2. Bật màu xanh cho menu vừa bấm
                this.classList.add('active');
                const activeIcon = this.querySelector('i');
                if (activeIcon) activeIcon.classList.add('text-primary');

                // 3. Tiến hành ẩn/hiện thẻ câu hỏi
                const filterValue = this.getAttribute('data-filter');
                faqCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = 'block';
                    } else {
                        // So sánh data-category của thẻ với data-filter của menu
                        if (card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

// ==========================================
// 9. LOGIC CHATBOX (Chỉ Mở/Đóng Giao Diện)
// ==========================================
const chatBox = document.getElementById('chatBox');
const btnHeaderChat = document.getElementById('btn-header-chat');
const btnFooterFeedback = document.getElementById('btn-footer-feedback');
const btnCloseChat = document.getElementById('btnCloseChat');

function openChat() { 
    if(chatBox) {
        chatBox.style.display = 'flex'; 
        setTimeout(() => { chatBox.style.opacity = '1'; }, 10);
    }
}

if (btnHeaderChat) btnHeaderChat.addEventListener('click', openChat);
if (btnFooterFeedback) btnFooterFeedback.addEventListener('click', openChat);
if (btnCloseChat) btnCloseChat.addEventListener('click', () => { chatBox.style.display = 'none'; });

// ==========================================
// 10. KẾT NỐI SOCKET.IO CHO KHÁCH HÀNG
// ==========================================
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const btnSendChat = document.getElementById('btnSendChat'); // Nút gửi của khách
    const inputChat = document.getElementById('inputChat'); // Ô nhập của khách
    const chatMessages = document.getElementById('chatMessages'); // Khung chứa tin
    
    // Lấy Mã người dùng từ EJS (Đã lưu sẵn ở footer.ejs)
    const userIdInput = document.getElementById('currentUserId');
    const userId = userIdInput ? userIdInput.value : null;

    if (userId) {
        // Báo cho Server biết khách này vừa vào trang
        socket.emit('join', userId);

        // --- 1. HÀM TẢI LỊCH SỬ CHAT CŨ ---
        async function loadChatHistory() {
            try {
                const res = await fetch('/admin/chat/history'); // Gọi API
                const data = await res.json();
                
                data.forEach(msg => {
                    // Nếu là admin gửi thì hiện bên trái (msg-bot), khách thì bên phải (msg-user)
                    appendMessage(msg.nguoiGui === 'admin' ? 'bot' : 'user', msg.noiDung);
                });
            } catch (err) { console.log("Lỗi tải lịch sử chat:", err); }
        }
        loadChatHistory(); // Chạy ngay khi mở web

        // --- 2. XỬ LÝ KHI KHÁCH BẤM GỬI ---
        const sendMessage = () => {
            const text = inputChat.value.trim();
            if (text) {
                // Gửi qua mạng bằng Socket
                socket.emit('client_send_message', { 
                    idUser: userId, 
                    noiDung: text 
                });
                
                // Hiện ngay lên màn hình của khách
                appendMessage('user', text);
                inputChat.value = '';
            }
        };

        if (btnSendChat) btnSendChat.addEventListener('click', sendMessage);
        if (inputChat) inputChat.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') sendMessage(); 
        });

        // --- 3. LẮNG NGHE ADMIN TRẢ LỜI ---
        socket.on('client_receive_reply', (data) => {
            appendMessage('bot', data.noiDung);
        });

        // Hàm in tin nhắn ra màn hình
        function appendMessage(type, text) {
            const msg = document.createElement('div');
            msg.className = type === 'user' ? 'msg-user' : 'msg-bot';
            msg.innerText = text;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối
        }
    }
});
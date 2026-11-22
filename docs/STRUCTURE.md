# STRUCTURE.md — Cấu trúc thư mục & Danh mục chức năng

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Thư mục gốc:** `b2306586_ct449_hethongquanlymuonsach/`  
> **Cập nhật lần cuối:** `YYYY-MM-DD`  
> **Quy ước:** Mỗi khi thêm/sửa/xóa file hoặc hàm quan trọng, cần cập nhật lại bảng chú thích tương ứng trong tài liệu này.

---

## 1. Sơ đồ cây thư mục tổng quan

```text
b2306586_ct449_hethongquanlymuonsach/
├── PROJECT.md                  # Tài liệu định hướng nghiệp vụ và quy tắc cho AI Agent
├── README.md                   # Hướng dẫn cài đặt và chạy dự án
├── .gitignore                  # Danh sách file/thư mục bỏ qua khi commit Git
│
├── docs/                       # Tài liệu kỹ thuật, thiết kế & kiểm thử
│   ├── STRUCTURE.md            # Tài liệu cấu trúc thư mục và chú thích hàm (file này)
│   ├── api-spec.md             # Đặc tả RESTful API
│   ├── db-schema.md            # Thiết kế chi tiết các collection MongoDB
│   └── postman/                # Collection & Environment kiểm thử API trên Postman
│
├── backend/                    # Server API (Node.js + Express.js + MongoDB)
│   ├── .env                    # Biến môi trường thực tế (không commit)
│   ├── .env.example            # Mẫu cấu hình biến môi trường
│   ├── package.json            # Danh sách thư viện và scripts chạy Backend
│   └── src/
│       ├── app.js              # Khởi tạo ứng dụng Express, middleware và gắn routes
│       ├── server.js           # Điểm khởi chạy server và kết nối MongoDB
│       ├── config/             # Cấu hình kết nối DB, biến môi trường, chính sách mặc định
│       ├── constants/          # Các hằng số, Enum trạng thái và mã lỗi
│       ├── middlewares/        # Xác thực (JWT), phân quyền (3 vai trò), xử lý lỗi chung
│       ├── models/             # Schema & Model MongoDB (Mongoose)
│       ├── routes/             # Định tuyến các endpoint RESTful API
│       ├── controllers/        # Tiếp nhận request, gọi service, chuẩn hóa response
│       ├── services/           # Chứa toàn bộ logic nghiệp vụ & transaction mượn/trả
│       ├── validators/         # Kiểm tra hợp lệ dữ liệu đầu vào (request body/params)
│       ├── utils/              # Các hàm tiện ích dùng chung
│       └── tests/              # Kiểm thử luồng chính và các trường hợp ngoại lệ
│
└── frontend/                   # Giao diện người dùng (Vue.js + Vite + Pinia + Vue Router)
    ├── .env                    # Biến môi trường thực tế (không commit)
    ├── .env.example            # Mẫu cấu hình biến môi trường (VITE_API_BASE_URL)
    ├── package.json            # Danh sách thư viện và scripts chạy Frontend
    └── src/
        ├── main.js             # Điểm khởi chạy ứng dụng Vue
        ├── App.vue             # Component gốc
        ├── api/                # Cấu hình Axios và các module gọi REST API
        ├── router/             # Cấu hình định tuyến và bảo vệ route theo vai trò
        ├── stores/             # Quản lý state toàn cục bằng Pinia
        ├── layouts/            # Khung giao diện chung (Admin/Librarian, Reader, Auth)
        ├── components/         # Component giao diện tái sử dụng
        ├── views/              # Các trang màn hình chia theo nhóm vai trò
        │   ├── auth/           # Đăng nhập, đăng ký, đổi mật khẩu
        │   ├── admin/          # Quản lý nhân viên, cấu hình chính sách
        │   ├── librarian/      # Quản lý sách, NXB, độc giả, mượn/trả, phạt, thống kê
        │   └── reader/         # Tra cứu sách, lịch sử mượn, hồ sơ cá nhân
        └── utils/              # Hàm hỗ trợ hiển thị (format ngày, tiền tệ, nhãn trạng thái)
```

---

## 2. Chú thích chi tiết: Thư mục gốc & `docs/`

| File / Thư mục | Vai trò / Mục đích | Ghi chú cập nhật |
| :--- | :--- | :--- |
| `PROJECT.md` | Đặc tả nghiệp vụ, phân quyền 3 vai trò và quy tắc làm việc | Tài liệu gốc |
| `docs/STRUCTURE.md` | Mô tả cấu trúc thư mục và danh mục file/hàm | Cập nhật liên tục |
| `docs/api-spec.md` | Danh sách endpoint, request/response và mã lỗi | `[Chưa tạo / Đang cập nhật]` |
| `docs/db-schema.md` | Chi tiết schema, index và quan hệ các collection MongoDB | `[Chưa tạo / Đang cập nhật]` |
| `docs/postman/` | File export bộ test API trên Postman | `[Chưa tạo / Đang cập nhật]` |

---

## 3. Chú thích chi tiết: `backend/`

### 3.1. File khởi chạy (`backend/src/`)

| File | Chức năng chính | Các hàm / biến quan trọng | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/app.js` | Khởi tạo Express, cấu hình CORS, JSON parser, gắn route gốc | `app`, `GET /api/health` | Đã khởi tạo |
| `src/server.js` | Nạp biến môi trường `.env`, kết nối MongoDB, bật server | `mongoose.connect()`, `app.listen()` | Đã khởi tạo |

### 3.2. Cấu hình & Hằng số (`config/`, `constants/`)

| Đường dẫn file | Chức năng chính | Các hàm / hằng số chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/config/...` | *(VD: `db.js` - tách logic kết nối MongoDB)* | `connectDB()` | `[Điền khi tạo file]` |
| `src/constants/...` | *(VD: `enums.js` - trạng thái ACTIVE, OVERDUE, OPEN, UNPAID...)* | `ROLES`, `LOAN_STATUS`, `FINE_STATUS` | `[Điền khi tạo file]` |

### 3.3. Middlewares (`middlewares/`)

| Đường dẫn file | Chức năng chính | Các hàm chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/middlewares/...` | *(VD: `auth.middleware.js` - xác thực JWT)* | `authenticate()`, `authorize(...roles)` | `[Điền khi tạo file]` |
| `src/middlewares/...` | *(VD: `error.middleware.js` - bắt và format lỗi nhất quán)* | `errorHandler()`, `notFoundHandler()` | `[Điền khi tạo file]` |

### 3.4. Models (`models/`)

| Đường dẫn file | Collection MongoDB | Trường / Index / Method đáng chú ý | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/models/...` | `users` | `[Điền khi tạo file]` | Tài khoản & vai trò |
| `src/models/...` | `readers` | `[Điền khi tạo file]` | Hồ sơ độc giả |
| `src/models/...` | `employees` | `[Điền khi tạo file]` | Hồ sơ nhân viên |
| `src/models/...` | `books` | `[Điền khi tạo file]` | Đầu sách & tồn kho |
| `src/models/...` | `publishers` | `[Điền khi tạo file]` | Nhà xuất bản |
| `src/models/...` | `loanReceipts` / `loanItems` | `[Điền khi tạo file]` | Phiếu & chi tiết mượn |
| `src/models/...` | `fines` | `[Điền khi tạo file]` | Khoản phạt & bồi thường |
| `src/models/...` | `auditLogs` | `[Điền khi tạo file]` | Nhật ký thao tác |
| `src/models/...` | `librarySettings` | `[Điền khi tạo file]` | Cấu hình chính sách |

### 3.5. Routes (`routes/`)

| Đường dẫn file | Nhóm API (Base URL) | Các endpoint chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/routes/...` | `/api/auth` | `[VD: POST /register, POST /login...]` | `[Điền khi tạo file]` |
| `src/routes/...` | `/api/books` | `[Điền khi tạo file]` | `[Điền khi tạo file]` |
| `src/routes/...` | `/api/loans` | `[Điền khi tạo file]` | `[Điền khi tạo file]` |

### 3.6. Controllers (`controllers/`)

| Đường dẫn file | Phụ trách nghiệp vụ | Các hàm handler chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/controllers/...` | `[VD: auth.controller.js]` | `[VD: register(), login(), changePassword()]` | `[Điền khi tạo file]` |
| `src/controllers/...` | `[VD: loan.controller.js]` | `[VD: createLoan(), returnBooks()]` | `[Điền khi tạo file]` |

### 3.7. Services (`services/`)

| Đường dẫn file | Logic nghiệp vụ đảm nhiệm | Các hàm nghiệp vụ chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/services/...` | `[VD: loan.service.js - xử lý mượn, trả từng phần, tính phạt]` | `[VD: createLoanReceipt(), processPartialReturn()]` | `[Điền khi tạo file]` |

### 3.8. Validators, Utils & Tests (`validators/`, `utils/`, `tests/`)

| Đường dẫn file | Chức năng chính | Các hàm chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/validators/...` | Kiểm tra dữ liệu đầu vào | `[Điền khi tạo file]` | `[Điền khi tạo file]` |
| `src/utils/...` | Tiện ích (tính ngày trễ, hash mật khẩu, custom error...) | `[Điền khi tạo file]` | `[Điền khi tạo file]` |
| `src/tests/...` | Test case luồng chính & ngoại lệ | `[Điền khi tạo file]` | `[Điền khi tạo file]` |

---

## 4. Chú thích chi tiết: `frontend/`

### 4.1. Cấu hình lõi (`api/`, `router/`, `stores/`, `utils/`)

| Đường dẫn file | Chức năng chính | Các hàm / state / route quan trọng | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/api/...` | *(VD: `axios.js` - cấu hình baseURL, gắn JWT token, bắt lỗi 401)* | `apiClient`, interceptors | `[Điền khi tạo file]` |
| `src/router/index.js` | Định nghĩa route và kiểm tra quyền truy cập theo role | `router`, `beforeEach()` | Đã khởi tạo bởi Vue |
| `src/stores/...` | *(VD: `auth.store.js` - lưu thông tin user, token, role)* | `user`, `token`, `login()`, `logout()` | `[Điền khi tạo file]` |
| `src/utils/...` | Format ngày tháng, tiền tệ VND, mapping màu/nhãn trạng thái | `formatDate()`, `formatCurrency()` | `[Điền khi tạo file]` |

### 4.2. Layouts & Components (`layouts/`, `components/`)

| Đường dẫn file | Chức năng giao diện | Props / Emits chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/layouts/...` | *(VD: `AdminLayout.vue`, `ReaderLayout.vue`)* | `[Điền khi tạo file]` | `[Điền khi tạo file]` |
| `src/components/...` | *(VD: `StatusBadge.vue`, `Pagination.vue`, `ConfirmModal.vue`)* | `[Điền khi tạo file]` | `[Điền khi tạo file]` |

### 4.3. Views theo vai trò (`views/`)

| Nhóm thư mục | Đường dẫn file | Mô tả màn hình & chức năng | API sử dụng |
| :--- | :--- | :--- | :--- |
| `views/auth/` | `[VD: LoginView.vue]` | Đăng nhập hệ thống | `POST /api/auth/login` |
| `views/admin/` | `[Điền khi tạo file]` | Quản lý nhân viên, cấu hình chính sách | `[Điền khi tạo file]` |
| `views/librarian/` | `[Điền khi tạo file]` | Quản lý sách, NXB, độc giả, lập phiếu mượn/trả, phạt | `[Điền khi tạo file]` |
| `views/reader/` | `[Điền khi tạo file]` | Tra cứu sách, xem lịch sử mượn & tiền phạt cá nhân | `[Điền khi tạo file]` |

---

## 5. Mẫu ghi chú chi tiết cho từng file phức tạp (Tùy chọn)

Khi một file có nhiều hàm nghiệp vụ phức tạp (ví dụ `loan.service.js`), bạn có thể copy mẫu dưới đây để ghi chú chi tiết hơn ở cuối tài liệu:

```markdown
### File: `backend/src/services/ten-file.service.js`
- **Mục đích:** Mô tả ngắn gọn trách nhiệm của file.
- **Các hàm chính:**
  1. `tenHam1(thamSo1, thamSo2)`
     - **Chức năng:** Làm gì?
     - **Đầu vào:** Mô tả dữ liệu nhận vào.
     - **Đầu ra / Tác động DB:** Trả về gì, cập nhật collection nào?
     - **Ngoại lệ cần lưu ý:** Hết sách, sai quyền, lỗi transaction...
  2. `tenHam2(...)`
     - ...
```
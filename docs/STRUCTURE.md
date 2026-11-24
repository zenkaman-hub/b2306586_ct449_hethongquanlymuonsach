# STRUCTURE.md — Cấu trúc thư mục & Danh mục chức năng

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Thư mục gốc:** `b2306586_ct449_hethongquanlymuonsach/`  
> **Cập nhật lần cuối:** `2026-11-22`  
> **Quy ước:** Mỗi khi thêm/sửa/xóa file hoặc hàm quan trọng, cần cập nhật lại bảng chú thích tương ứng trong tài liệu này. Toàn bộ tên collection, tên trường và giá trị Enum tuân thủ chuẩn tiếng Việt không dấu theo `docs/db.md`.

---

## 1. Sơ đồ cây thư mục tổng quan

```text
b2306586_ct449_hethongquanlymuonsach/
├── AGENTS.md                   # Điểm đọc đầu tiên & bảng định tuyến context cho AI Agent
├── README.md                   # Hướng dẫn cài đặt và chạy dự án
├── .gitignore                  # Danh sách file/thư mục bỏ qua khi commit Git
│
├── database/                   # Script khởi tạo CSDL MongoDB độc lập
│   └── khoi_tao_csdl.js        # Script tạo 9 collection, $jsonSchema và indexes (idempotent)
│
├── docs/                       # Tài liệu kỹ thuật, thiết kế & kiểm thử
│   ├── PROJECT.md              # Tài liệu định hướng nghiệp vụ và quy tắc cho AI Agent
│   ├── PLAN.md                 # Kế hoạch phát triển dự án trong 3 ngày
│   ├── db.md                   # Thiết kế chi tiết 9 collection MongoDB
│   ├── STRUCTURE.md            # Tài liệu cấu trúc thư mục và chú thích hàm (file này)
│   ├── API.md                  # Quy ước chung, mục lục API theo module và tài khoản seed
│   ├── api/                    # Đặc tả chi tiết RESTful API tách riêng theo từng module
│   │   ├── auth.md             # Module Xác thực & Phân quyền (/api/auth)
│   │   ├── publishers.md       # Module Nhà xuất bản (/api/publishers)
│   │   └── books.md            # Module Sách & Tồn kho (/api/books)
│   └── postman/                # Collection & Environment kiểm thử API trên Postman
│
├── backend/                    # Server API (Node.js + Express.js + MongoDB, CommonJS)
│   ├── .env                    # Biến môi trường thực tế (không commit)
│   ├── .env.example            # Mẫu cấu hình biến môi trường
│   ├── package.json            # Danh sách thư viện và scripts chạy Backend
│   └── src/
│       ├── app.js              # Khởi tạo ứng dụng Express, middleware và gắn routes
│       ├── server.js           # Điểm khởi chạy server và kết nối MongoDB
│       ├── config/             # Cấu hình kết nối DB, biến môi trường
│       ├── constants/          # Các hằng số, Enum trạng thái và tên collection (enums.js)
│       ├── middlewares/        # Xác thực (JWT), phân quyền (3 vai trò), xử lý lỗi chung
│       ├── models/             # 9 Mongoose Schema & Model khớp với docs/db.md
│       ├── routes/             # Định tuyến các endpoint RESTful API
│       ├── controllers/        # Tiếp nhận request, gọi service, chuẩn hóa response
│       ├── services/           # Chứa toàn bộ logic nghiệp vụ & transaction
│       ├── validators/         # Kiểm tra hợp lệ dữ liệu đầu vào (request body/params)
│       ├── utils/              # Các hàm tiện ích dùng chung (AppError.js, seed.js)
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
| `AGENTS.md` | Điểm đọc đầu tiên, quy ước code & bảng định tuyến context cho AI Agent | Mới tạo (chống quá tải ngữ cảnh) |
| `database/khoi_tao_csdl.js` | Script MongoDB khởi tạo 9 collection, `$jsonSchema` và indexes (idempotent) | Tách từ `docs/db.md` |
| `docs/PROJECT.md` | Đặc tả nghiệp vụ, phân quyền 3 vai trò và quy tắc làm việc | Tài liệu gốc |
| `docs/PLAN.md` | Kế hoạch chia task theo 3 ngày (D1, D2, D3) | Tài liệu gốc |
| `docs/db.md` | Chi tiết schema, index, quan hệ 9 collection MongoDB | Chuẩn dữ liệu duy nhất |
| `docs/STRUCTURE.md` | Mô tả cấu trúc thư mục và danh mục file/hàm | Cập nhật liên tục |
| `docs/API.md` | Quy ước chung, mục lục API theo module & tài khoản seed | Hub dẫn tới `docs/api/` |
| `docs/api/` | Đặc tả chi tiết từng module API (`auth.md`, `publishers.md`, `books.md`...) | Tách theo module để tránh conflict |
| `docs/postman/` | File export bộ test API trên Postman | `[Chưa tạo / Đang cập nhật]` |

---

## 3. Chú thích chi tiết: `backend/`

### 3.1. File khởi chạy (`backend/src/`)

| File | Chức năng chính | Các hàm / biến quan trọng | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/app.js` | Khởi tạo Express, cấu hình CORS, JSON parser, gắn `/api/auth`, `notFoundHandler`, `errorHandler` | `app`, `GET /api/health` | Đã cập nhật D1-05 |
| `src/server.js` | Nạp biến môi trường `.env`, kết nối MongoDB, bật server | `mongoose.connect()`, `app.listen()` | Đã khởi tạo |

### 3.2. Cấu hình & Hằng số (`config/`, `constants/`)

| Đường dẫn file | Chức năng chính | Các hàm / hằng số chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/constants/enums.js` | Định nghĩa toàn bộ Enum (`UPPER_SNAKE_CASE` tiếng Việt không dấu) và tên 9 collection theo `docs/db.md` | `VAI_TRO`, `TRANG_THAI_TAI_KHOAN`, `PHAI`, `TRANG_THAI_QUYEN_MUON`, `TRANG_THAI_HO_SO_DOC_GIA`, `TRANG_THAI_LAM_VIEC`, `TRANG_THAI_NXB`, `TRANG_THAI_LUU_THONG_SACH`, `TRANG_THAI_PHIEU_MUON`, `TRANG_THAI_CHI_TIET_MUON`, `TINH_TRANG_KHI_TRA`, `LOAI_PHAT`, `TRANG_THAI_KHOAN_PHAT`, `HANH_DONG_NHAT_KY`, `CACH_CAP_TAI_KHOAN_DOC_GIA`, `MA_CAU_HINH`, `TEN_COLLECTION` | Hoàn thành D1-02 |

### 3.3. Middlewares (`middlewares/`)

| Đường dẫn file | Chức năng chính | Các hàm chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/middlewares/auth.middleware.js` | Xác thực JWT Bearer token, kiểm tra tài khoản bị khóa (`BR-03`) và phân quyền 3 vai trò (`QUAN_TRI`, `THU_THU`, `DOC_GIA`) | `authenticate(req, res, next)`, `authorize(...dsVaiTroChoPhep)` | Hoàn thành D1-05 |
| `src/middlewares/error.middleware.js` | Bắt lỗi 404 route không tồn tại và chuẩn hóa mọi lỗi hệ thống/Mongoose/JWT về JSON thống nhất | `notFoundHandler(req, res, next)`, `errorHandler(err, req, res, next)` | Hoàn thành D1-05 |

### 3.4. Models (`models/`)

| Đường dẫn file | Collection MongoDB | Trường / Index / Method đáng chú ý | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/models/taiKhoan.model.js` | `tai_khoan` | Trường: `tenDangNhap`, `email`, `matKhauHash`, `vaiTro`, `trangThai`, `lyDoKhoa`, `ngayKhoa`, `nguoiKhoaId`, `lanDangNhapCuoi`, `ngayDoiMatKhauCuoi`, `ngayTao`, `ngayCapNhat`. Indexes: `{ tenDangNhap: 1 }` (unique), `{ email: 1 }` (unique, sparse), `{ vaiTro: 1, trangThai: 1 }`. | Hoàn thành D1-02 |
| `src/models/docGia.model.js` | `doc_gia` | Trường: `taiKhoanId`, `maDocGia`, `hoLot`, `ten`, `ngaySinh`, `phai`, `diaChi`, `dienThoai`, `trangThaiQuyenMuon`, `lyDoHanCheMuon`, `soSachDangMuon`, `tongTienPhatChuaTra`, `trangThaiHoSo`, `nguoiTaoId`, `nguoiCapNhatId`, `ngayTao`, `ngayCapNhat`. Indexes: `{ taiKhoanId: 1 }` (unique), `{ maDocGia: 1 }` (unique), `{ dienThoai: 1 }`, `{ hoLot: 1, ten: 1 }`, `{ trangThaiQuyenMuon: 1, trangThaiHoSo: 1 }`. | Hoàn thành D1-02 |
| `src/models/nhanVien.model.js` | `nhan_vien` | Trường: `taiKhoanId`, `msnv`, `hoTenNV`, `chucVu`, `diaChi`, `soDienThoai`, `trangThaiLamViec`, `nguoiTaoId`, `nguoiCapNhatId`, `ngayTao`, `ngayCapNhat`. Indexes: `{ taiKhoanId: 1 }` (unique), `{ msnv: 1 }` (unique), `{ trangThaiLamViec: 1 }`. | Hoàn thành D1-02 |
| `src/models/nhaXuatBan.model.js` | `nha_xuat_ban` | Trường: `maNXB`, `tenNXB`, `diaChi`, `trangThai`, `nguoiTaoId`, `nguoiCapNhatId`, `ngayTao`, `ngayCapNhat`. Indexes: `{ maNXB: 1 }` (unique), `{ tenNXB: 1 }`, `{ trangThai: 1 }`. | Hoàn thành D1-02 |
| `src/models/sach.model.js` | `sach` | Trường: `maSach`, `tenSach`, `donGia`, `tongSoQuyen`, `soQuyenDangMuon`, `soQuyenHuHong`, `soQuyenKhaDung`, `soQuyenDaMat`, `namXuatBan`, `nhaXuatBanId`, `maNXB`, `nguonGocTacGia`, `trangThaiLuuThong`, `nguoiTaoId`, `nguoiCapNhatId`, `ngayTao`, `ngayCapNhat`. Indexes: `{ maSach: 1 }` (unique), `{ nhaXuatBanId: 1 }`, `{ trangThaiLuuThong: 1, soQuyenKhaDung: 1 }`, `{ tenSach: "text", nguonGocTacGia: "text" }` (`default_language: "none"`). | Hoàn thành D1-02 |
| `src/models/phieuMuon.model.js` | `phieu_muon` | Trường: `maPhieuMuon`, `docGiaId`, `maDocGia`, `nhanVienLapId`, `ngayMuon`, `trangThai`, `ghiChu`, `chiTietMuon` (nhúng mảng sách mượn & `lichSuGiaHan`), `nguoiHuyId`, `ngayHuy`, `lyDoHuy`, `ngayTao`, `ngayCapNhat`. Indexes: `{ maPhieuMuon: 1 }` (unique), `{ docGiaId: 1, ngayMuon: -1 }`, `{ trangThai: 1, ngayMuon: -1 }`, `{ "chiTietMuon.sachId": 1, "chiTietMuon.trangThai": 1 }`, `{ "chiTietMuon.trangThai": 1, "chiTietMuon.hanTra": 1 }`. | Hoàn thành D1-02 |
| `src/models/khoanPhat.model.js` | `khoan_phat` | Trường: `maKhoanPhat`, `docGiaId`, `phieuMuonId`, `chiTietMuonId`, `loaiPhat`, `soNgayTre`, `mucPhatApDung`, `soTienPhat`, `soTienDaThanhToan`, `trangThai`, `lyDo`, `nguoiTaoId`, `nguoiXuLyId`, `ngayXuLy`, `ghiChuXuLy`, `ngayTao`, `ngayCapNhat`. Indexes: `{ maKhoanPhat: 1 }` (unique), `{ docGiaId: 1, trangThai: 1 }`, `{ phieuMuonId: 1, chiTietMuonId: 1 }`. | Hoàn thành D1-02 |
| `src/models/nhatKyHeThong.model.js` | `nhat_ky_he_thong` | Trường: `hanhDong`, `doiTuongCollection`, `doiTuongId`, `nguoiThucHienId`, `vaiTroNguoiThucHien`, `duLieuTruoc`, `duLieuSau`, `lyDo`, `thoiDiem`. Indexes: `{ doiTuongCollection: 1, doiTuongId: 1, thoiDiem: -1 }`, `{ nguoiThucHienId: 1, thoiDiem: -1 }`, `{ hanhDong: 1, thoiDiem: -1 }`. | Hoàn thành D1-02 |
| `src/models/cauHinhThuVien.model.js` | `cau_hinh_thu_vien` | Trường: `maCauHinh` (`"MAC_DINH"`), các tham số cấu hình chính sách mượn trả (`PENDING DECISION`), `nguoiCapNhatId`, `ngayCapNhat`. Index: `{ maCauHinh: 1 }` (unique). | Hoàn thành D1-02 |
| `src/models/index.js` | — | Export tập trung 9 Mongoose Models | Hoàn thành D1-02 |

### 3.5. Routes (`routes/`)

| Đường dẫn file | Nhóm API (Base URL) | Các endpoint chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/routes/auth.route.js` | `/api/auth` | `POST /register`, `POST /login`, `POST /logout`, `PUT /change-password`, `GET /me` | Hoàn thành D1-05 |
| `src/routes/nhaXuatBan.route.js` | `/api/publishers` (và `/api/nha-xuat-ban`) | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` | Hoàn thành D1-06 (NXB) |
| `src/routes/sach.route.js` | `/api/books` (và `/api/sach`) | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/inventory`, `PATCH /:id/status`, `DELETE /:id` | Hoàn thành D1-06 (Sách) |
| `src/routes/docGia.route.js` | `/api/readers` (và `/api/doc-gia`) | `GET /me`, `PUT /me`, `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/borrowing-status`, `PATCH /:id/account-status`, `PATCH /:id/profile-status`, `DELETE /:id` | Hoàn thành D1-06 (Độc giả) |
| `src/routes/nhanVien.route.js` | `/api/employees` (và `/api/nhan-vien`) | `GET /me`, `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/work-status`, `PATCH /:id/account-status`, `DELETE /:id` | Hoàn thành D1-06 (Nhân viên) |
| `src/routes/phieuMuon.route.js` | `/api/loans` (và `/api/phieu-muon`) | `GET /my-history`, `GET /overdue-items`, `GET /`, `GET /:id`, `POST /`, `POST /:id/return`, `POST /:id/extend`, `PATCH /:id/cancel` | Hoàn thành D2-02..D2-05 (Mượn/Trả) |
| `src/routes/khoanPhat.route.js` | `/api/fines` (và `/api/khoan-phat`) | `GET /my-fines`, `GET /`, `GET /:id`, `POST /:id/pay`, `PATCH /:id/waive`, `PATCH /:id/cancel` | Hoàn thành D2-04..D2-05 (Khoản phạt) |

### 3.6. Controllers (`controllers/`)

| Đường dẫn file | Phụ trách nghiệp vụ | Các hàm handler chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/controllers/auth.controller.js` | Xác thực & tài khoản cá nhân | `dangKy`, `dangNhap`, `dangXuat`, `doiMatKhau`, `layThongTinMe` | Hoàn thành D1-05 |
| `src/controllers/nhaXuatBan.controller.js` | Quản lý Nhà xuất bản | `layDanhSach`, `layChiTiet`, `taoMoi`, `capNhat`, `doiTrangThai`, `xoa` | Hoàn thành D1-06 (NXB) |
| `src/controllers/sach.controller.js` | Quản lý Đầu sách & Tồn kho | `layDanhSach`, `layChiTiet`, `taoMoi`, `capNhat`, `dieuChinhTonKho`, `doiTrangThai`, `xoa` | Hoàn thành D1-06 (Sách) |
| `src/controllers/docGia.controller.js` | Quản lý Hồ sơ & Tài khoản Độc giả | `layHoSoCaNhan`, `capNhatHoSoCaNhan`, `layDanhSach`, `layChiTiet`, `taoMoi`, `capNhat`, `doiTrangThaiQuyenMuon`, `doiTrangThaiTaiKhoan`, `doiTrangThaiHoSo`, `xoa` | Hoàn thành D1-06 (Độc giả) |
| `src/controllers/nhanVien.controller.js` | Quản lý Hồ sơ & Tài khoản Nhân viên (`QUAN_TRI`) | `layHoSoCaNhan`, `layDanhSach`, `layChiTiet`, `taoMoi`, `capNhat`, `doiTrangThaiLamViec`, `doiTrangThaiTaiKhoan`, `xoa` | Hoàn thành D1-06 (Nhân viên) |
| `src/controllers/phieuMuon.controller.js` | Quản lý Phiếu mượn, Trả sách, Gia hạn & Quá hạn | `layLichSuCaNhan`, `layDanhSachSachQuaHan`, `layDanhSach`, `layChiTiet`, `lapPhieuMuon`, `traSach`, `giaHanMuon`, `huyPhieuMuon` | Hoàn thành D2-02..D2-05 (Mượn/Trả) |
| `src/controllers/khoanPhat.controller.js` | Quản lý Khoản phạt, Thu tiền, Miễn phạt & Hủy phạt | `layDanhSachCaNhan`, `layDanhSach`, `layChiTiet`, `thanhToan`, `mienPhat`, `huyPhat` | Hoàn thành D2-04..D2-05 (Khoản phạt) |

### 3.7. Services (`services/`)

| Đường dẫn file | Logic nghiệp vụ đảm nhiệm | Các hàm nghiệp vụ chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/services/auth.service.js` | Đăng ký độc giả (Transaction), đăng nhập (kiểm tra khóa tài khoản BR-03, phân biệt hạn chế mượn BR-04), đổi mật khẩu, lấy hồ sơ hiện tại | `dangKyDocGia(duLieu)`, `dangNhap({ tenDangNhap, matKhau })`, `doiMatKhau(taiKhoanId, { matKhauHienTai, matKhauMoi })`, `layThongTinHienTai(taiKhoanId)` | Hoàn thành D1-05 |
| `src/services/nhaXuatBan.service.js` | CRUD Nhà xuất bản, tự sinh `maNXB`, kiểm tra trùng `tenNXB` không phân biệt hoa/thường, thống kê `soDauSach`, đồng bộ `maNXB` sang `sach`, chặn xóa vật lý khi có sách tham chiếu (BR-11) | `layDanhSachNXB(query)`, `layChiTietNXB(id)`, `taoNXB(duLieu, nguoiThucHienId)`, `capNhatNXB(id, duLieuCapNhat, nguoiThucHienId)`, `capNhatTrangThaiNXB(id, trangThai, nguoiThucHienId)`, `xoaNXB(id)` | Hoàn thành D1-06 (NXB) |
| `src/services/sach.service.js` | CRUD Đầu sách, tự sinh `maSach`, kiểm tra NXB hoạt động, chống trùng đầu sách, điều chỉnh tồn kho thỏa bất biến `soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon - soQuyenHuHong` kèm ghi `nhat_ky_he_thong` (BR-12), chặn xóa vật lý khi đã phát sinh giao dịch mượn (BR-11) | `layDanhSachSach(query)`, `layChiTietSach(id)`, `taoSach(duLieu, nguoiThucHienId)`, `capNhatSach(id, duLieuCapNhat, nguoiThucHienId)`, `dieuChinhTonKho(id, duLieuDieuChinh, user)`, `capNhatTrangThaiLuuThong(id, trangThaiLuuThong, nguoiThucHienId)`, `xoaSach(id)` | Hoàn thành D1-06 (Sách) |
| `src/services/docGia.service.js` | CRUD Độc giả (Transaction tạo/xóa `tai_khoan` + `doc_gia`), hồ sơ cá nhân Độc giả (BR-02), hạn chế/mở quyền mượn (BR-04, BR-12), khóa/mở tài khoản (BR-03, BR-12), ngừng hoạt động hồ sơ và chặn xóa vật lý khi có giao dịch (BR-11) | `layDanhSachDocGia(query)`, `layChiTietDocGia(id)`, `layHoSoCaNhanDocGia(taiKhoanId)`, `taoDocGia(duLieu, nguoiThucHienId)`, `capNhatDocGia(docGiaId, duLieuCapNhat, nguoiThucHienId)`, `capNhatHoSoCaNhanDocGia(taiKhoanId, duLieuCapNhat)`, `capNhatQuyenMuonDocGia(id, payload, user)`, `capNhatTrangThaiTaiKhoanDocGia(id, payload, user)`, `capNhatTrangThaiHoSoDocGia(id, payload, user)`, `xoaDocGia(id)` | Hoàn thành D1-06 (Độc giả) |
| `src/services/nhanVien.service.js` | CRUD Nhân viên dành cho `QUAN_TRI` (Transaction tạo/xóa `tai_khoan` + `nhan_vien`), chống tự khóa/tự xóa/tự hạ quyền Admin, chuyển `NGHI_VIEC` tự động khóa tài khoản + ghi `nhat_ky_he_thong` (BR-12), chặn xóa vật lý khi đã xử lý giao dịch (BR-11) | `layDanhSachNhanVien(query)`, `layChiTietNhanVien(id)`, `layHoSoCaNhanNhanVien(taiKhoanId)`, `taoNhanVien(duLieu, nguoiThucHienId)`, `capNhatNhanVien(id, duLieuCapNhat, user)`, `capNhatTrangThaiLamViecNhanVien(id, payload, user)`, `capNhatTrangThaiTaiKhoanNhanVien(id, payload, user)`, `xoaNhanVien(id, user)` | Hoàn thành D1-06 (Nhân viên) |
| `src/services/phieuMuon.service.js` | Lập phiếu mượn nhiều sách nguyên tử (Transaction, BR-01, BR-05, BR-06, BR-07, BR-14), trả sách toàn phần/từng phần (BR-08), đồng bộ quá hạn (BR-09), xử lý hư hỏng/mất sách & tự động tạo khoản phạt (BR-10), gia hạn mượn, hủy phiếu lập nhầm, ghi `nhat_ky_he_thong` (BR-12) | `layDanhSachPhieuMuon(query)`, `layLichSuMuonCuaDocGia(user, query)`, `layDanhSachSachQuaHan(query)`, `layChiTietPhieuMuon(id, user)`, `lapPhieuMuon(duLieu, user)`, `traSach(phieuMuonId, duLieuTra, user)`, `giaHanMuon(phieuMuonId, duLieuGiaHan, user)`, `huyPhieuMuon(phieuMuonId, payload, user)` | Hoàn thành D2-02..D2-05 (Mượn/Trả) |
| `src/services/khoanPhat.service.js` | Xem khoản phạt cá nhân (BR-02) & toàn hệ thống, thu tiền phạt toàn bộ/một phần (Transaction), miễn phạt (`DUOC_MIEN`), hủy phạt ghi sai (`DA_HUY` - BR-11), tự động giảm `tongTienPhatChuaTra`, mở lại quyền mượn `DUOC_MUON` khi hết nợ, đồng bộ `chiTietMuon.trangThai = DA_XU_LY`, ghi `nhat_ky_he_thong` (BR-12) | `layDanhSachKhoanPhat(query)`, `layDanhSachKhoanPhatCaNhan(user, query)`, `layChiTietKhoanPhat(id, user)`, `thanhToanKhoanPhat(id, payload, user)`, `mienKhoanPhat(id, payload, user)`, `huyKhoanPhat(id, payload, user)` | Hoàn thành D2-04..D2-05 (Khoản phạt) |

### 3.8. Validators, Utils & Tests (`validators/`, `utils/`, `tests/`)

| Đường dẫn file | Chức năng chính | Các hàm chính | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/validators/auth.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Auth | `validateDangKyDocGia(body)`, `validateDangNhap(body)`, `validateDoiMatKhau(body)` | Hoàn thành D1-05 |
| `src/validators/nhaXuatBan.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Nhà xuất bản | `validateTaoNXB(body)`, `validateCapNhatNXB(body)`, `validateCapNhatTrangThaiNXB(body)` | Hoàn thành D1-06 (NXB) |
| `src/validators/sach.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Sách & Tồn kho | `validateTaoSach(body)`, `validateCapNhatSach(body)`, `validateDieuChinhTonKho(body)`, `validateCapNhatTrangThaiSach(body)` | Hoàn thành D1-06 (Sách) |
| `src/validators/docGia.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Độc giả | `validateTaoDocGia(body)`, `validateCapNhatDocGia(body, choPhepSuaMaDocGia)`, `validateCapNhatQuyenMuon(body)`, `validateCapNhatTrangThaiTaiKhoan(body)`, `validateCapNhatTrangThaiHoSo(body)` | Hoàn thành D1-06 (Độc giả) |
| `src/validators/nhanVien.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Nhân viên | `validateTaoNhanVien(body)`, `validateCapNhatNhanVien(body)`, `validateCapNhatTrangThaiLamViec(body)`, `validateCapNhatTrangThaiTaiKhoanNV(body)` | Hoàn thành D1-06 (Nhân viên) |
| `src/validators/phieuMuon.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Mượn – Trả Sách | `validateLapPhieuMuon(body)`, `validateTraSach(body)`, `validateGiaHanMuon(body)`, `validateHuyPhieuMuon(body)` | Hoàn thành D2-02..D2-05 (Mượn/Trả) |
| `src/validators/khoanPhat.validator.js` | Kiểm tra hợp lệ dữ liệu đầu vào cho module Khoản phạt | `validateThanhToanPhat(body)`, `validateMienHoacHuyPhat(body, tenThaoTac)` | Hoàn thành D2-04..D2-05 (Khoản phạt) |
| `src/utils/AppError.js` | Lớp lỗi nghiệp vụ tùy chỉnh chứa `statusCode`, `errorCode`, `details` | `class AppError` | Hoàn thành D1-05 |
| `src/utils/seed.js` | Script khởi tạo dữ liệu mẫu idempotent (Cấu hình mặc định, Admin, Thủ thư, 2 Độc giả, 3 NXB, 5 Đầu sách) | `seedDatabase()`, chạy bằng `npm run seed` | Hoàn thành D1-02 |

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

# FRONTEND.md — Hướng dẫn Kiến trúc, Luồng Màn hình & Tích hợp API cho AI Agent Frontend

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Stack Frontend:** Vue 3 (Composition API `<script setup>`) + Vite + Pinia + Vue Router + Axios  
> **Thư mục làm việc:** `frontend/`  
> **Mục đích:** Tài liệu điều hướng dành riêng cho các AI Agent xây dựng giao diện, giúp nắm ngay bức tranh tổng thể 8 module Backend, ánh xạ chính xác màn hình ↔ file đặc tả API (`docs/api/*.md`), tránh tự đoán tên field và tránh đọc quá tải tài liệu Backend/Database.

---

## 1. Quy tắc Đọc Tài liệu & Chống Quá tải Ngữ cảnh (Context Routing)

Khi nhận một task Frontend, **KHÔNG** đọc thư mục `backend/` hay `docs/backend/db.md`. Chỉ đọc đúng các tài liệu sau:

1. **Bắt buộc đọc đầu tiên:**
   - [`AGENTS.md`](../../AGENTS.md): Quy ước chung của toàn dự án.
   - `docs/frontend/FRONTEND.md` *(file này)*: Quy tắc code Frontend bắt buộc, kiến trúc thư mục `frontend/`, chuẩn Axios/Pinia/Router, bảng ánh xạ màn hình ↔ API và nhãn hiển thị Enum.
   - [`docs/frontend/UI_DESIGN.md`](./UI_DESIGN.md): Đặc tả chi tiết giao diện, bảng màu, hệ thống button, hiệu ứng `active`/`hover`/`disabled` và từng màn hình cho 4 đối tượng (Khách, Độc giả, Thủ thư, Quản trị viên).
   - [`docs/backend/API.md`](../backend/API.md): Quy ước Header `Authorization`, cấu trúc JSON Response thành công/lỗi chung và tài khoản Seed để đăng nhập test.
2. **Chỉ đọc file API của đúng module đang code:**

| Module giao diện đang làm | File đặc tả API cần đọc (Duy nhất) | Base Endpoint Backend |
| :--- | :--- | :--- |
| **1. Đăng nhập, Đăng ký, Đổi mật khẩu, Hồ sơ phiên** | [`docs/backend/api/auth.md`](../backend/api/auth.md) | `/api/auth` |
| **2. Quản lý Nhà xuất bản** | [`docs/backend/api/publishers.md`](../backend/api/publishers.md) | `/api/publishers` *(hoặc `/api/nha-xuat-ban`)* |
| **3. Quản lý Đầu sách & Điều chỉnh tồn kho / Tra cứu sách** | [`docs/backend/api/books.md`](../backend/api/books.md) | `/api/books` *(hoặc `/api/sach`)* |
| **4. Quản lý Độc giả & Hồ sơ cá nhân Độc giả** | [`docs/backend/api/readers.md`](../backend/api/readers.md) | `/api/readers` *(hoặc `/api/doc-gia`)* |
| **5. Quản lý Nhân viên (Dành riêng cho `QUAN_TRI`)** | [`docs/backend/api/employees.md`](../backend/api/employees.md) | `/api/employees` *(hoặc `/api/nhan-vien`)* |
| **6. Lập phiếu mượn, Trả sách từng phần, Gia hạn, Quá hạn, Lịch sử mượn** | [`docs/backend/api/loans.md`](../backend/api/loans.md) | `/api/loans` *(hoặc `/api/phieu-muon`)* |
| **7. Quản lý Khoản phạt, Thu tiền, Miễn/Hủy phạt & Phạt cá nhân** | [`docs/backend/api/fines.md`](../backend/api/fines.md) | `/api/fines` *(hoặc `/api/khoan-phat`)* |
| **8. Dashboard Thống kê, Cấu hình Thư viện & Nhật ký Hệ thống** | [`docs/backend/api/system.md`](../backend/api/system.md) | `/api/dashboard`, `/api/settings`, `/api/audit-logs` |

---

## 1.5. Quy tắc Code Frontend Bắt buộc (Coding & UI Rules)

Mọi AI Agent khi viết code trong `frontend/` **bắt buộc** tuân thủ các quy ước sau:

1. **Chuẩn Vue 3 & Thư viện UI:**
   - Viết component bằng **Vue 3 Composition API (`<script setup>`)**, tách rõ tầng gọi API trong `src/api/*.api.js` (không gọi `axios` trực tiếp trong file `.vue`).
   - Sử dụng **Bootstrap 5** + **Font Awesome 6** (`@fortawesome/fontawesome-free`) + biến CSS toàn cục định nghĩa đúng theo bảng màu trong [`UI_DESIGN.md`](./UI_DESIGN.md) (`--color-primary: #3C8DBC`, `--sidebar-bg: #222D32`...). **Không hardcode mã màu rời rạc** trong từng màn hình.
2. **Không hardcode nhãn Enum hay format thủ công:**
   - Mọi nhãn trạng thái và màu Badge phải đọc tập trung từ `src/utils/constants.js` và hiển thị qua `StatusBadge.vue`.
   - Mọi định dạng ngày (`DD/MM/YYYY`) và tiền tệ (`VNĐ`) phải gọi từ `src/utils/format.js`.
3. **Bắt buộc đủ 4 trạng thái UI trên mọi màn hình & nút bấm:**
   - **Loading & Chống Double-Submit:** Mọi nút gọi `POST`/`PUT`/`PATCH`/`DELETE` phải chuyển `disabled` + hiện spinner trong khi chờ API.
   - **Active & Highlight:** Đảm bảo hiệu ứng `active` đúng cho Sidebar Accordion, Top Navbar, Tab nội bộ, dòng bảng chọn checkbox và Pagination theo [`UI_DESIGN.md`](./UI_DESIGN.md).
   - **Empty & Error:** Bảng rỗng hiển thị Empty State rõ ràng; lỗi API hiển thị `error.response?.data?.message` qua `AlertToast.vue` hoặc bôi đỏ đúng ô input theo `details`.
   - **Disabled có Tooltip:** Các nút bị khóa theo nghiệp vụ (`BR-11` không xóa NXB/Sách có tham chiếu, Admin không tự khóa/tự xóa/tự hạ quyền) phải `disabled` kèm `title`/Tooltip giải thích lý do.
4. **Cập nhật tài liệu sau mỗi task:** Khi thêm/sửa file trong `frontend/src/`, cập nhật bảng Mục 4 của [`docs/STRUCTURE.md`](../STRUCTURE.md) và kiểm tra `npm run build` không lỗi.

---

## 2. Quy ước Dữ liệu Bất di Bất dịch giữa Frontend & Backend

### 2.1. Tên trường (`camelCase` tiếng Việt không dấu) & Enum (`UPPER_SNAKE_CASE`)
- **Tuyệt đối không tự đổi tên field sang tiếng Anh** khi gửi Request Body, Query Params hoặc khi đọc Response từ Backend.
  - Đúng: `tenDangNhap`, `matKhau`, `vaiTro`, `hoLot`, `ten`, `dienThoai`, `maNXB`, `tenNXB`, `maSach`, `tenSach`, `soQuyenKhaDung`, `danhSachSach`, `danhSachTra`, `tinhTrangKhiTra`...
  - Sai: `username`, `password`, `role`, `bookName`, `availableCopies`...
- **Cấu trúc phân trang trả về thống nhất ở tất cả các API `GET` danh sách:**
```json
{
  "success": true,
  "message": "...",
  "data": {
    "danhSach": [ ... ],
    "phanTrang": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```
- **Tham số Query lọc & tìm kiếm chuẩn trên các API danh sách:**
  - `page` (mặc định `1`), `limit` (mặc định `10`), `tuKhoa` (hoặc `search`).
  - Lưu ý: Khi một bộ lọc Enum (VD: `trangThai`, `trangThaiLuuThong`, `trangThaiQuyenMuon`, `loaiPhat`...) ở trạng thái **"Tất cả"**, **không gửi** query param đó lên (hoặc xóa khỏi object `params`), không gửi giá trị lạ vì Backend kiểm tra chặt và sẽ trả lỗi `400 DU_LIEU_KHONG_HOP_LE`.

### 2.2. Chuẩn xử lý lỗi từ Backend
Mọi lỗi HTTP (`400`, `401`, `403`, `404`, `409`, `500`) từ Backend đều có cấu trúc:
```json
{
  "success": false,
  "errorCode": "MA_LOI_NGHIEP_VU",
  "message": "Thông báo lỗi hiển thị cho người dùng",
  "details": [
    { "field": "tenTruong", "message": "Chi tiết lỗi của trường" }
  ]
}
```
- Trên giao diện, luôn ưu tiên hiển thị `error.response?.data?.message` cho người dùng, và có thể dùng `error.response?.data?.details` hoặc `errorCode` để bôi đỏ đúng ô input bị lỗi.

---

## 3. Cấu trúc Thư mục Chuẩn của `frontend/`

Tuân thủ cấu trúc đã quy định trong [`docs/STRUCTURE.md`](../STRUCTURE.md):

```text
frontend/
├── .env                        # VITE_API_BASE_URL=http://localhost:5000/api
├── .env.example
├── package.json
└── src/
    ├── main.js                 # Khởi tạo Vue App, Pinia, Vue Router
    ├── App.vue                 # Root component (<RouterView />)
    ├── assets/                 # CSS toàn cục, biến màu sắc, font
    │
    ├── api/                    # Tầng giao tiếp REST API (Axios)
    │   ├── axios.js            # Axios instance, Request/Response Interceptors
    │   ├── auth.api.js         # Gọi /api/auth/*
    │   ├── publisher.api.js    # Gọi /api/publishers/*
    │   ├── book.api.js         # Gọi /api/books/*
    │   ├── reader.api.js       # Gọi /api/readers/*
    │   ├── employee.api.js     # Gọi /api/employees/*
    │   ├── loan.api.js         # Gọi /api/loans/*
    │   ├── fine.api.js         # Gọi /api/fines/*
    │   └── system.api.js       # Gọi /api/dashboard/*, /api/settings/*, /api/audit-logs/*
    │
    ├── stores/                 # Quản lý State toàn cục bằng Pinia
    │   └── auth.store.js       # Lưu token, taiKhoan, hoSo, vaiTro, login/logout/fetchMe
    │
    ├── router/
    │   └── index.js            # Định tuyến & Navigation Guards phân quyền 3 vai trò
    │
    ├── layouts/                # Khung giao diện theo nhóm vai trò
    │   ├── AuthLayout.vue      # Khung trang Đăng nhập / Đăng ký
    │   ├── StaffLayout.vue     # Sidebar + Header cho QUAN_TRI và THU_THU
    │   └── ReaderLayout.vue    # Navbar + Footer cho DOC_GIA (và Khách tra cứu sách)
    │
    ├── components/             # Component dùng chung
    │   ├── StatusBadge.vue     # Hiển thị nhãn màu cho các giá trị Enum
    │   ├── PaginationBar.vue   # Thanh phân trang dùng chung cho mọi bảng (page, totalPages)
    │   ├── ConfirmModal.vue    # Modal xác nhận (kèm ô nhập lyDo bắt buộc cho thao tác nhạy cảm)
    │   └── AlertToast.vue      # Thông báo thành công / lỗi
    │
    ├── views/                  # Các màn hình chia theo vai trò
    │   ├── auth/
    │   │   ├── LoginView.vue           # Đăng nhập (cả 3 vai trò)
    │   │   ├── RegisterView.vue        # Đăng ký tài khoản Độc giả
    │   │   └── ChangePasswordView.vue  # Đổi mật khẩu
    │   ├── librarian/                  # Dùng chung cho cả QUAN_TRI và THU_THU
    │   │   ├── DashboardView.vue       # Thống kê tổng quan thư viện
    │   │   ├── PublisherListView.vue   # CRUD Nhà xuất bản
    │   │   ├── BookListView.vue        # CRUD Đầu sách & Modal điều chỉnh tồn kho
    │   │   ├── ReaderListView.vue      # Quản lý Độc giả, khóa quyền mượn, khóa tài khoản
    │   │   ├── LoanListView.vue        # Danh sách phiếu mượn & Tab sách đang quá hạn
    │   │   ├── LoanCreateView.vue      # Lập phiếu mượn nhiều đầu sách
    │   │   ├── LoanDetailView.vue      # Chi tiết phiếu, trả sách từng phần, gia hạn, hủy phiếu
    │   │   └── FineListView.vue        # Quản lý khoản phạt, thu tiền, miễn phạt, hủy phạt
    │   ├── admin/                      # Chỉ dành riêng cho QUAN_TRI
    │   │   ├── EmployeeListView.vue    # Quản lý Nhân viên (Tạo, sửa, nghỉ việc, khóa TK)
    │   │   ├── SettingsView.vue        # Cấu hình chính sách mượn trả (cau_hinh_thu_vien)
    │   │   └── AuditLogListView.vue    # Tra cứu Nhật ký hệ thống (nhat_ky_he_thong)
    │   └── reader/                     # Dành cho DOC_GIA
    │       ├── BookCatalogView.vue     # Tra cứu & xem chi tiết sách
    │       ├── MyLoansView.vue         # Lịch sử mượn trả cá nhân & hạn trả
    │       ├── MyFinesView.vue         # Khoản phạt cá nhân & tổng nợ phạt
    │       └── MyProfileView.vue       # Xem & cập nhật hồ sơ cá nhân độc giả
    │
    └── utils/
        ├── format.js           # Format ngày (DD/MM/YYYY), tiền tệ (VNĐ)
        └── constants.js        # Bản đồ ánh xạ Enum -> Nhãn tiếng Việt có dấu & màu sắc Badge
```

---

## 4. Thiết kế Chi tiết Tầng Core (`axios`, `auth.store`, `router`)

### 4.1. Cấu hình Axios (`src/api/axios.js`)
- `baseURL`: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`
- **Request Interceptor:** Tự động đọc `token` từ `localStorage` và gắn header `Authorization: Bearer ${token}`.
- **Response Interceptor:**
  - Nếu nhận mã `401` với `errorCode` thuộc `['TOKEN_KHONG_HOP_LE', 'TOKEN_HET_HAN', 'TOKEN_HET_HIEU_LUC', 'TAI_KHOAN_KHONG_TON_TAI']` hoặc `403` với `errorCode === 'TAI_KHOAN_BI_KHOA'` (khi đang ở trong phiên): Tự động xóa `token` khỏi `localStorage` và điều hướng về `/login`.

### 4.2. Quản lý Trạng thái Đăng nhập (`src/stores/auth.store.js`)
Khi gọi `POST /api/auth/login` thành công, Backend trả về:
```json
{
  "token": "<jwt_token>",
  "taiKhoan": {
    "_id": "...",
    "tenDangNhap": "admin",
    "email": "...",
    "vaiTro": "QUAN_TRI",
    "trangThai": "HOAT_DONG"
  },
  "hoSo": { ... }
}
```
*(Lưu ý: Với `POST /api/auth/register`, trường hồ sơ trả về có tên `hoSoDocGia`; khi lưu vào store nên thống nhất gán `this.hoSo = data.hoSo || data.hoSoDocGia`).*
- Các getter cần có trong `useAuthStore`:
  - `isAuthenticated`: `Boolean(token && taiKhoan)`
  - `vaiTro`: `taiKhoan?.vaiTro` (`'QUAN_TRI'` | `'THU_THU'` | `'DOC_GIA'`)
  - `isAdmin`: `taiKhoan?.vaiTro === 'QUAN_TRI'`
  - `isLibrarian`: `taiKhoan?.vaiTro === 'THU_THU'`
  - `isStaff`: `['QUAN_TRI', 'THU_THU'].includes(taiKhoan?.vaiTro)`
  - `isReader`: `taiKhoan?.vaiTro === 'DOC_GIA'`
  - `isReaderRestricted`: `isReader && hoSo?.trangThaiQuyenMuon === 'BI_HAN_CHE'` (Dùng để hiển thị thanh cảnh báo màu vàng cho độc giả biết mình đang bị hạn chế quyền mượn kèm `hoSo.lyDoHanCheMuon` theo **BR-04**).

### 4.3. Phân quyền Điều hướng (`src/router/index.js`)
Mỗi route gắn `meta: { requiresAuth: true, roles: [...] }`:
- Sau khi đăng nhập thành công:
  - Nếu `vaiTro` là `QUAN_TRI` hoặc `THU_THU` → Điều hướng tới `/staff/dashboard`.
  - Nếu `vaiTro` là `DOC_GIA` → Điều hướng tới `/reader/books`.
- Nếu người dùng cố truy cập route không thuộc `meta.roles` của mình → Điều hướng về trang chủ tương ứng với vai trò hoặc trang thông báo `403 Không đủ quyền truy cập`.

---

## 5. Hướng dẫn Nghiệp vụ Quan trọng trên từng Màn hình (Không được làm sai)

### 5.1. Quản lý Nhà xuất bản (`PublisherListView.vue` — Xem [`docs/backend/api/publishers.md`](../backend/api/publishers.md))
- Hiển thị cột `soDauSach` (do Backend trả sẵn trong mỗi phần tử).
- **Quy tắc nút Xóa / Ngừng hoạt động (BR-11):**
  - Nếu `soDauSach > 0`: Ẩn hoặc disable nút "Xóa vật lý", chỉ hiển thị nút **"Ngừng hoạt động" / "Kích hoạt lại"** (`PATCH /api/publishers/:id/status` với `{ trangThai: 'NGUNG_HOAT_DONG' | 'HOAT_DONG' }`).
  - Nếu `soDauSach === 0`: Cho phép bấm nút "Xóa" (`DELETE /api/publishers/:id`).

### 5.2. Quản lý Đầu sách & Tồn kho (`BookListView.vue` — Xem [`docs/backend/api/books.md`](../backend/api/books.md))
- **Tạo mới đầu sách (`POST /api/books`):**
  - Dropdown chọn Nhà xuất bản lấy từ `GET /api/publishers?trangThai=HOAT_DONG&limit=100` (chỉ cho chọn NXB đang hoạt động).
  - Các trường: `maSach` (có thể để trống để Backend tự sinh `S0001`...), `tenSach`, `nguonGocTacGia`, `nhaXuatBanId`, `namXuatBan`, `donGia`, `tongSoQuyen`, `soQuyenHuHong` (mặc định `0`).
- **Tách riêng 2 thao tác Sửa thông tin và Điều chỉnh tồn kho:**
  1. **Modal "Sửa thông tin sách" (`PUT /api/books/:id`):** Chỉ gửi `maSach`, `tenSach`, `donGia`, `namXuatBan`, `nhaXuatBanId`, `nguonGocTacGia`, `trangThaiLuuThong`. **Không** gửi các trường số lượng tồn kho vào API `PUT` này (Backend sẽ chặn bằng mã lỗi `400 KHONG_SUA_TRUC_TIEP_TON_KHO`).
  2. **Modal "Điều chỉnh tồn kho" (`PATCH /api/books/:id/inventory`):** Hiển thị `soQuyenDangMuon` hiện tại, cho nhập `tongSoQuyen` mới, `soQuyenHuHong` mới và **bắt buộc nhập `lyDo`** (để Backend ghi `nhat_ky_he_thong` theo **BR-12**). Ràng buộc giao diện: `tongSoQuyen >= soQuyenDangMuon + soQuyenHuHong`.

### 5.3. Quản lý Độc giả (`ReaderListView.vue` — Xem [`docs/backend/api/readers.md`](../backend/api/readers.md))
Phân biệt rõ **3 nút thao tác trạng thái** trên mỗi dòng độc giả:
1. **Hạn chế / Mở quyền mượn (`PATCH /api/readers/:id/borrowing-status`):**
   - Đổi `trangThaiQuyenMuon` giữa `DUOC_MUON` và `BI_HAN_CHE`. Khi chọn `BI_HAN_CHE`, mở modal bắt buộc nhập `lyDoHanCheMuon`. (Độc giả vẫn đăng nhập tra cứu được theo **BR-04**).
2. **Khóa / Mở khóa tài khoản đăng nhập (`PATCH /api/readers/:id/account-status`):**
   - Đổi `taiKhoanId.trangThai` giữa `HOAT_DONG` và `BI_KHOA`. Khi chọn `BI_KHOA`, bắt buộc nhập `lyDoKhoa`. (Độc giả bị chặn đăng nhập hoàn toàn theo **BR-03**).
3. **Ngừng hoạt động hồ sơ (`PATCH /api/readers/:id/profile-status`):**
   - Chuyển `trangThaiHoSo` sang `NGUNG_HOAT_DONG` (chỉ thực hiện được khi `soSachDangMuon === 0` và `tongTienPhatChuaTra === 0`).

### 5.4. Quản lý Nhân viên (`EmployeeListView.vue` — Chỉ `QUAN_TRI` — Xem [`docs/backend/api/employees.md`](../backend/api/employees.md))
- Chỉ hiển thị trên menu Sidebar khi `authStore.isAdmin === true`.
- Trên dòng nhân viên trùng với tài khoản Admin đang đăng nhập (`nhanVien.taiKhoanId._id === authStore.taiKhoan._id`): Disable các nút "Khóa tài khoản", "Chuyển nghỉ việc", "Xóa" và không cho tự hạ quyền xuống `THU_THU`.

### 5.5. Lập Phiếu mượn & Trả sách Từng phần (`LoanCreateView.vue`, `LoanDetailView.vue` — Xem [`docs/backend/api/loans.md`](../backend/api/loans.md))
- **Màn hình Lập phiếu mượn (`POST /api/loans`):**
  1. Tìm/chọn Độc giả (`GET /api/readers?tuKhoa=...&trangThaiHoSo=HOAT_DONG`): Hiển thị ngay trạng thái quyền mượn (`DUOC_MUON` / `BI_HAN_CHE`), `soSachDangMuon` hiện tại và `tongTienPhatChuaTra`. Nếu độc giả đang bị `BI_HAN_CHE` hoặc còn nợ phạt thì cảnh báo ngay trên UI.
  2. Tìm/chọn nhiều Đầu sách (`GET /api/books?trangThaiLuuThong=DANG_LUU_THONG&conSachKhaDung=true`): Mỗi đầu sách chỉ thêm tối đa 1 cuốn trong phiếu, cho phép chọn `hanTra` riêng cho từng cuốn (hoặc để trống để lấy hạn trả mặc định của thư viện).
- **Màn hình Chi tiết phiếu & Trả sách (`POST /api/loans/:id/return`):**
  - Hiển thị danh sách từng cuốn sách trong `phieuMuon.chiTietMuon`.
  - Với các cuốn đang ở trạng thái `DANG_MUON` hoặc `QUA_HAN`:
    - Có **Checkbox** để thủ thư tích chọn **1 cuốn, nhiều cuốn hoặc tất cả cuốn** muốn nhận trả trong lượt này (**BR-08: Trả từng phần**).
    - Với mỗi cuốn được tích chọn, hiển thị dropdown chọn `tinhTrangKhiTra`:
      - `NGUYEN_VEN`: Trả sách tốt.
      - `HU_HONG_NHE`: Hư hỏng nhẹ vẫn lưu thông được *(bắt buộc nhập `moTaHuHong`)*.
      - `HU_HONG_NANG`: Hư hỏng nặng không thể lưu thông *(bắt buộc nhập `moTaHuHong`, có thể nhập `soTienBoiThuong` hoặc để trống để tính theo cấu hình)*.
      - `MAT`: Độc giả làm mất sách *(có thể nhập `moTaHuHong` / `soTienBoiThuong`)*.
    - Nút **"Gia hạn"** (`POST /api/loans/:id/extend`) trên từng cuốn đang `DANG_MUON` (chưa quá hạn).
  - Nút **"Hủy phiếu mượn"** (`PATCH /api/loans/:id/cancel` kèm `lyDoHuy`) chỉ hiển thị khi phiếu đang `DANG_MO` và **chưa có cuốn nào trong phiếu được trả**.

### 5.6. Quản lý Khoản phạt (`FineListView.vue` — Xem [`docs/backend/api/fines.md`](../backend/api/fines.md))
- Hiển thị `maKhoanPhat`, thông tin độc giả, mã phiếu mượn, tên sách (`chiTietSach.tenSach`), `loaiPhat` (`TRA_TRE`, `HU_HONG`, `MAT_SACH`), `soTienPhat`, `soTienDaThanhToan`, `soTienConNo` và `trangThai`.
- Với khoản phạt đang `CHUA_THANH_TOAN` hoặc `THANH_TOAN_MOT_PHAN`:
  - **Nút "Thu tiền" (`POST /api/fines/:id/pay`):** Mở modal mặc định điền sẵn `soTienThu = soTienConNo` (cho phép sửa số tiền nhỏ hơn nếu độc giả nộp một phần) + `ghiChuXuLy`.
  - **Nút "Miễn phạt" (`PATCH /api/fines/:id/waive`):** Mở modal bắt buộc nhập `ghiChuXuLy`.
  - **Nút "Hủy phạt" (`PATCH /api/fines/:id/cancel`):** Chỉ hiển thị khi `soTienDaThanhToan === 0`, bắt buộc nhập `ghiChuXuLy`.

---

## 6. Bảng Ánh xạ Nhãn Hiển thị Tiếng Việt & Màu sắc Trạng thái (`src/utils/constants.js`)

Frontend sử dụng bảng ánh xạ chuẩn dưới đây để hiển thị nhãn tiếng Việt có dấu đẹp mắt cho mọi giá trị Enum từ Backend:

| Nhóm Enum | Giá trị từ Backend | Nhãn hiển thị Tiếng Việt | Màu Badge gợi ý |
| :--- | :--- | :--- | :--- |
| **`vaiTro`** | `QUAN_TRI` | Quản trị viên | Purple / Indigo |
| | `THU_THU` | Thủ thư | Blue |
| | `DOC_GIA` | Độc giả | Green / Teal |
| **`tai_khoan.trangThai`** | `HOAT_DONG` | Đang hoạt động | Success (Green) |
| | `BI_KHOA` | Đã bị khóa | Danger (Red) |
| | `CHO_XAC_MINH` | Chờ xác minh | Warning (Amber) |
| **`trangThaiQuyenMuon`** | `DUOC_MUON` | Được phép mượn | Success (Green) |
| | `BI_HAN_CHE` | Bị hạn chế mượn | Danger (Red) |
| **`trangThaiHoSo` / NXB** | `HOAT_DONG` | Đang hoạt động | Success (Green) |
| | `NGUNG_HOAT_DONG` | Ngừng hoạt động | Secondary (Gray) |
| **`trangThaiLamViec`** | `DANG_LAM_VIEC` | Đang làm việc | Success (Green) |
| | `NGHI_VIEC` | Đã nghỉ việc | Secondary (Gray) |
| **`trangThaiLuuThong`** | `DANG_LUU_THONG` | Đang lưu thông | Success (Green) |
| | `TAM_NGUNG` | Tạm ngưng | Warning (Amber) |
| | `NGUNG_LUU_THONG` | Ngừng lưu thông | Secondary (Gray) |
| **`phieu_muon.trangThai`** | `DANG_MO` | Đang mở (Đang mượn) | Primary (Blue) |
| | `HOAN_TAT` | Đã hoàn tất | Success (Green) |
| | `DA_HUY` | Đã hủy | Secondary (Gray) |
| **`chiTietMuon.trangThai`** | `DANG_MUON` | Đang mượn | Primary (Blue) |
| | `QUA_HAN` | Đang quá hạn | Danger (Red) |
| | `DA_TRA_DUNG_HAN` | Đã trả đúng hạn | Success (Green) |
| | `DA_TRA_TRE` | Đã trả trễ | Warning (Amber) |
| | `HU_HONG` | Sách hư hỏng | Danger (Orange/Red) |
| | `MAT_SACH` | Mất sách | Danger (Dark Red) |
| | `DA_XU_LY` | Đã xử lý xong | Secondary (Gray) |
| **`tinhTrangKhiTra`** | `NGUYEN_VEN` | Nguyên vẹn | Success (Green) |
| | `HU_HONG_NHE` | Hư hỏng nhẹ | Warning (Amber) |
| | `HU_HONG_NANG` | Hư hỏng nặng | Danger (Red) |
| | `MAT` | Mất sách | Danger (Dark Red) |
| **`loaiPhat`** | `TRA_TRE` | Phạt trả trễ | Warning (Amber) |
| | `HU_HONG` | Bồi thường hư hỏng | Danger (Orange) |
| | `MAT_SACH` | Bồi thường mất sách | Danger (Red) |
| **`khoan_phat.trangThai`** | `CHUA_THANH_TOAN` | Chưa thanh toán | Danger (Red) |
| | `THANH_TOAN_MOT_PHAN` | Thanh toán một phần | Warning (Amber) |
| | `DA_THANH_TOAN` | Đã thanh toán | Success (Green) |
| | `DUOC_MIEN` | Được miễn phạt | Info (Cyan/Blue) |
| | `DA_HUY` | Đã hủy | Secondary (Gray) |

---

## 7. Thứ tự Triển khai Khuyến nghị cho Agent Frontend

Khi chia việc hoặc triển khai lần lượt trên `frontend/`, nên đi theo 4 chặng để mỗi chặng đều chạy và test được ngay:

1. **Chặng 1 — Khung nền tảng & Xác thực (Task D1-04 & D1-05):**
   - Tạo `.env` (`VITE_API_BASE_URL=http://localhost:5000/api`), `src/api/axios.js`, `src/utils/constants.js`, `src/utils/format.js`.
   - Tạo `src/stores/auth.store.js`, `src/router/index.js` và 3 Layouts (`AuthLayout`, `StaffLayout`, `ReaderLayout`).
   - Xây dựng `LoginView.vue`, `RegisterView.vue`, `ChangePasswordView.vue`.
2. **Chặng 2 — Giao diện Quản lý Danh mục & Tra cứu Sách (Task D1-06):**
   - `PublisherListView.vue` (Nhà xuất bản) & `BookListView.vue` (Sách + Modal điều chỉnh tồn kho).
   - `ReaderListView.vue` (Quản lý độc giả) & `EmployeeListView.vue` (Quản lý nhân viên - chỉ Admin).
   - `BookCatalogView.vue` & `MyProfileView.vue` (Giao diện Độc giả tra cứu sách & sửa hồ sơ cá nhân).
3. **Chặng 3 — Giao diện Nghiệp vụ Mượn – Trả & Khoản phạt (Task D2-06):**
   - `LoanCreateView.vue` (Lập phiếu mượn nhiều sách).
   - `LoanListView.vue` & `LoanDetailView.vue` (Danh sách phiếu, tab sách quá hạn, trả sách từng phần, ghi nhận hư hỏng/mất, gia hạn, hủy phiếu).
   - `FineListView.vue` (Thu tiền phạt, miễn phạt, hủy phạt).
   - `MyLoansView.vue` & `MyFinesView.vue` (Lịch sử mượn & khoản phạt của Độc giả).
4. **Chặng 4 — Dashboard, Cấu hình & Nhật ký Hệ thống (Task D3-01 & D3-02):**
   - `DashboardView.vue` (Hiển thị các thẻ chỉ số thống kê từ `GET /api/dashboard/summary`).
   - `SettingsView.vue` (Cấu hình chính sách thư viện cho Admin).
   - `AuditLogListView.vue` (Tra cứu nhật ký hệ thống).

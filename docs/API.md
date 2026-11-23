# API.md — Đặc tả RESTful API (WEBQUANLYMUONSACH)

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Base URL mặc định:** `http://localhost:5000/api`  
> **Chuẩn dữ liệu:** Toàn bộ tên trường (field) và giá trị Enum tuân thủ chuẩn tiếng Việt không dấu trong `docs/db.md`.

---

## 1. Quy ước chung

### 1.1. Header xác thực
Với các API yêu cầu đăng nhập, đính kèm JWT token trong header:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 1.2. Cấu trúc Response thành công
```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": {}
}
```

### 1.3. Cấu trúc Response lỗi tập trung
Mọi lỗi từ hệ thống đều trả về định dạng JSON thống nhất:
```json
{
  "success": false,
  "errorCode": "MA_LOI_UPPER_SNAKE_CASE",
  "message": "Thông báo lỗi dễ hiểu cho người dùng",
  "details": []
}
```

### 1.4. Các vai trò người dùng (`vaiTro`)
- `QUAN_TRI`: Quản trị viên hệ thống (Admin)
- `THU_THU`: Nhân viên thư viện / Thủ thư (Librarian)
- `DOC_GIA`: Độc giả (Reader)

---

## 2. Health Check

### `GET /api/health`
- **Quyền truy cập:** Công khai (Public)
- **Response `200 OK`:**
```json
{
  "success": true,
  "status": "OK",
  "message": "Backend WEBQUANLYMUONSACH is running"
}
```

---

## 3. Module Xác thực & Phân quyền (`/api/auth`)

### 3.1. Đăng ký tài khoản Độc giả
- **Endpoint:** `POST /api/auth/register`
- **Quyền truy cập:** Công khai (Public - tùy theo cấu hình `cachCapTaiKhoanDocGia` trong `cau_hinh_thu_vien`)
- **Mô tả nghiệp vụ:** Tạo đồng thời tài khoản (`tai_khoan`) với `vaiTro = "DOC_GIA"` và hồ sơ độc giả (`doc_gia`) trong một **MongoDB Transaction** (BR-14). Tự động sinh mã độc giả `maDocGia` tăng dần (`DG0001`, `DG0002`, ...).
- **Request Body:**
```json
{
  "tenDangNhap": "docgia03",
  "matKhau": "DocGia@123",
  "email": "docgia03@student.ctu.edu.vn",
  "hoLot": "Nguyen Thi",
  "ten": "Mai",
  "ngaySinh": "2005-10-12",
  "phai": "NU",
  "diaChi": "Quan Ninh Kieu, TP. Can Tho",
  "dienThoai": "0912000003"
}
```
- **Quy tắc Validate:**
  - `tenDangNhap` *(bắt buộc)*: 3–30 ký tự chữ/số/`_`/`.`/`-`, tự động chuyển về chữ thường, duy nhất.
  - `matKhau` *(bắt buộc)*: tối thiểu 6 ký tự.
  - `hoLot`, `ten` *(bắt buộc)*: chuỗi không rỗng.
  - `dienThoai` *(bắt buộc)*: 8–15 ký tự số; kiểm tra duy nhất nếu `yeuCauDienThoaiDuyNhat = true`.
  - `email` *(tùy chọn)*: đúng định dạng email và duy nhất nếu có cung cấp.
  - `phai` *(tùy chọn)*: `"NAM"` | `"NU"` | `"KHAC"`.
  - `ngaySinh` *(tùy chọn)*: chuỗi ngày ISO hợp lệ (`YYYY-MM-DD`).
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Dang ky tai khoan doc gia thanh cong",
  "data": {
    "token": "<jwt_token>",
    "taiKhoan": {
      "_id": "67408a...",
      "tenDangNhap": "docgia03",
      "email": "docgia03@student.ctu.edu.vn",
      "vaiTro": "DOC_GIA",
      "trangThai": "HOAT_DONG",
      "ngayTao": "2026-11-22T08:40:00.000Z"
    },
    "hoSoDocGia": {
      "_id": "67408a...",
      "maDocGia": "DG0003",
      "hoLot": "Nguyen Thi",
      "ten": "Mai",
      "ngaySinh": "2005-10-12T00:00:00.000Z",
      "phai": "NU",
      "diaChi": "Quan Ninh Kieu, TP. Can Tho",
      "dienThoai": "0912000003",
      "trangThaiQuyenMuon": "DUOC_MUON",
      "soSachDangMuon": 0,
      "tongTienPhatChuaTra": 0,
      "trangThaiHoSo": "HOAT_DONG"
    }
  }
}
```
- **Các mã lỗi có thể gặp:**
  - `400 DU_LIEU_KHONG_HOP_LE`: Thiếu trường bắt buộc hoặc sai định dạng.
  - `403 KHONG_CHO_PHEP_TU_DANG_KY`: Chính sách thư viện chỉ cho phép nhân viên tạo tài khoản.
  - `409 TEN_DANG_NHAP_DA_TON_TAI` / `EMAIL_DA_TON_TAI` / `DIEN_THOAI_DA_TON_TAI`: Trùng thông tin đã đăng ký.

---

### 3.2. Đăng nhập
- **Endpoint:** `POST /api/auth/login`
- **Quyền truy cập:** Công khai (Public)
- **Mô tả nghiệp vụ:**
  - Kiểm tra `tenDangNhap` và `matKhau`.
  - Chặn đăng nhập nếu `tai_khoan.trangThai === "BI_KHOA"` (BR-03) hoặc `"CHO_XAC_MINH"`.
  - Độc giả bị hạn chế quyền mượn (`doc_gia.trangThaiQuyenMuon === "BI_HAN_CHE"`) vẫn đăng nhập được bình thường để tra cứu sách và xem lịch sử cá nhân (BR-04).
- **Request Body:**
```json
{
  "tenDangNhap": "admin",
  "matKhau": "Admin@123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Dang nhap thanh cong",
  "data": {
    "token": "<jwt_token>",
    "taiKhoan": {
      "_id": "67408a...",
      "tenDangNhap": "admin",
      "email": "admin@thuviendhct.edu.vn",
      "vaiTro": "QUAN_TRI",
      "trangThai": "HOAT_DONG",
      "lanDangNhapCuoi": "2026-11-22T08:45:00.000Z"
    },
    "hoSo": {
      "_id": "67408a...",
      "taiKhoanId": "67408a...",
      "msnv": "NV0001",
      "hoTenNV": "Nguyen Quan Tri",
      "chucVu": "Quan tri vien he thong",
      "soDienThoai": "0901000001",
      "trangThaiLamViec": "DANG_LAM_VIEC"
    }
  }
}
```
- **Các mã lỗi có thể gặp:**
  - `400 DU_LIEU_KHONG_HOP_LE`: Thiếu `tenDangNhap` hoặc `matKhau`.
  - `401 SAI_THONG_TIN_DANG_NHAP`: Sai tên đăng nhập hoặc mật khẩu.
  - `403 TAI_KHOAN_BI_KHOA`: Tài khoản đã bị khóa (kèm lý do khóa).
  - `403 TAI_KHOAN_CHO_XAC_MINH`: Tài khoản đang chờ xác minh.

---

### 3.3. Lấy thông tin tài khoản hiện tại
- **Endpoint:** `GET /api/auth/me`
- **Quyền truy cập:** Yêu cầu đăng nhập (`QUAN_TRI`, `THU_THU`, `DOC_GIA`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay thong tin tai khoan thanh cong",
  "data": {
    "taiKhoan": {
      "_id": "67408a...",
      "tenDangNhap": "docgia01",
      "email": "docgia01@student.ctu.edu.vn",
      "vaiTro": "DOC_GIA",
      "trangThai": "HOAT_DONG"
    },
    "hoSo": {
      "_id": "67408a...",
      "maDocGia": "DG0001",
      "hoLot": "Le Van",
      "ten": "An",
      "dienThoai": "0912000001",
      "trangThaiQuyenMuon": "DUOC_MUON",
      "soSachDangMuon": 0,
      "tongTienPhatChuaTra": 0,
      "trangThaiHoSo": "HOAT_DONG"
    }
  }
}
```

---

### 3.4. Đổi mật khẩu
- **Endpoint:** `PUT /api/auth/change-password`
- **Quyền truy cập:** Yêu cầu đăng nhập (`QUAN_TRI`, `THU_THU`, `DOC_GIA`)
- **Request Body:**
```json
{
  "matKhauHienTai": "DocGia@123",
  "matKhauMoi": "DocGiaNew@123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Doi mat khau thanh cong",
  "data": {
    "ngayDoiMatKhauCuoi": "2026-11-22T08:50:00.000Z"
  }
}
```
- **Các mã lỗi có thể gặp:**
  - `400 DU_LIEU_KHONG_HOP_LE`: Mật khẩu mới ngắn hơn 6 ký tự hoặc trùng mật khẩu hiện tại.
  - `400 MAT_KHAU_HIEN_TAI_KHONG_DUNG`: Nhập sai mật khẩu hiện tại.
  - `401 CHUA_XAC_THUC`: Chưa đăng nhập hoặc token hết hạn.

---

### 3.5. Đăng xuất
- **Endpoint:** `POST /api/auth/logout`
- **Quyền truy cập:** Yêu cầu đăng nhập (`QUAN_TRI`, `THU_THU`, `DOC_GIA`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Dang xuat thanh cong"
}
```

---

## 4. Module Nhà xuất bản (`/api/publishers` hoặc `/api/nha-xuat-ban`)

### 4.1. Lấy danh sách Nhà xuất bản
- **Endpoint:** `GET /api/publishers` (hoặc `GET /api/nha-xuat-ban`)
- **Quyền truy cập:** Công khai (Public)
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `maNXB`, `tenNXB`, `diaChi`
  - `trangThai`: Lọc theo trạng thái (`HOAT_DONG` | `NGUNG_HOAT_DONG`)
  - `page`: Trang hiện tại (mặc định `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định `10`, tối đa `100`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay danh sach nha xuat ban thanh cong",
  "data": {
    "danhSach": [
      {
        "_id": "67408a...",
        "maNXB": "NXB001",
        "tenNXB": "Nha xuat ban Tre",
        "diaChi": "161B Ly Chinh Thang, Quan 3, TP. Ho Chi Minh",
        "trangThai": "HOAT_DONG",
        "nguoiTaoId": "67408a...",
        "nguoiCapNhatId": "67408a...",
        "ngayTao": "2026-11-22T08:00:00.000Z",
        "ngayCapNhat": "2026-11-22T08:00:00.000Z",
        "soDauSach": 2
      }
    ],
    "phanTrang": {
      "page": 1,
      "limit": 10,
      "totalItems": 3,
      "totalPages": 1
    }
  }
}
```

---

### 4.2. Lấy chi tiết 1 Nhà xuất bản
- **Endpoint:** `GET /api/publishers/:id`
- **Quyền truy cập:** Công khai (Public)
- **Response `200 OK`:** Trả về object `nha_xuat_ban` kèm trường `soDauSach`.
- **Mã lỗi:** `404 KHONG_TIM_THAY_NXB`, `400 DINH_DANG_ID_KHONG_HOP_LE`.

---

### 4.3. Tạo mới Nhà xuất bản
- **Endpoint:** `POST /api/publishers`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Request Body:**
```json
{
  "maNXB": "NXB004",
  "tenNXB": "Nha xuat ban Khoa hoc va Ky thuat",
  "diaChi": "70 Tran Hung Dao, Hoan Kiem, Ha Noi",
  "trangThai": "HOAT_DONG"
}
```
*(Ghi chú: `maNXB` là tùy chọn; nếu bỏ trống hệ thống tự sinh mã tăng dần `NXB001`, `NXB002`... `tenNXB` được chuẩn hóa khoảng trắng và kiểm tra không được trùng lặp, không phân biệt chữ hoa hay chữ thường).*
- **Response `201 Created`:** Trả về thông tin NXB vừa tạo.
- **Mã lỗi:** `400 DU_LIEU_KHONG_HOP_LE`, `403 KHONG_DU_QUYEN`, `409 MA_NXB_DA_TON_TAI`, `409 TEN_NXB_DA_TON_TAI`.

---

### 4.4. Cập nhật thông tin Nhà xuất bản
- **Endpoint:** `PUT /api/publishers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Mô tả nghiệp vụ:** Cập nhật `maNXB`, `tenNXB`, `diaChi`, `trangThai`. Nếu `maNXB` thay đổi, tự động đồng bộ trường snapshot `maNXB` trong collection `sach`.
- **Request Body:**
```json
{
  "tenNXB": "Nha xuat ban Khoa hoc & Ky thuat",
  "diaChi": "70 Tran Hung Dao, Ha Noi",
  "trangThai": "HOAT_DONG"
}
```
- **Response `200 OK`:** Trả về thông tin NXB sau khi cập nhật.

---

### 4.5. Đổi trạng thái hoạt động Nhà xuất bản (Soft Delete — BR-11)
- **Endpoint:** `PATCH /api/publishers/:id/status`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Request Body:**
```json
{
  "trangThai": "NGUNG_HOAT_DONG"
}
```
- **Response `200 OK`:** Trả về thông tin NXB với `trangThai` mới.

---

### 4.6. Xóa Nhà xuất bản
- **Endpoint:** `DELETE /api/publishers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (BR-11 & Mục 5.2 `docs/db.md`):**
  - Nếu có ít nhất 1 đầu sách trong collection `sach` đang tham chiếu `nhaXuatBanId` → **Cấm xóa vật lý**, trả về lỗi `409 NXB_DANG_CO_SACH_THAM_CHIEU` và yêu cầu chuyển sang `NGUNG_HOAT_DONG`.
  - Chỉ xóa vật lý khi `soDauSach === 0`.

---

## 5. Tài khoản Seed Mẫu để Kiểm thử (`npm run seed`)

| Vai trò (`vaiTro`) | `tenDangNhap` | Mật khẩu | Mã hồ sơ | Trạng thái đặc biệt |
| :--- | :--- | :--- | :--- | :--- |
| `QUAN_TRI` | `admin` | `Admin@123` | `msnv: "NV0001"` | Đầy đủ quyền quản trị |
| `THU_THU` | `thuthu` | `ThuThu@123` | `msnv: "NV0002"` | Quyền nghiệp vụ thư viện |
| `DOC_GIA` | `docgia01` | `DocGia@123` | `maDocGia: "DG0001"` | `trangThaiQuyenMuon: "DUOC_MUON"` |
| `DOC_GIA` | `docgia02` | `DocGia@123` | `maDocGia: "DG0002"` | `trangThaiQuyenMuon: "BI_HAN_CHE"` (dùng test BR-04) |

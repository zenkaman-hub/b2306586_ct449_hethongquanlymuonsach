# Module Xác thực & Phân quyền (`/api/auth`)

> Xem quy ước Header, Response thành công/lỗi và tài khoản seed mẫu tại [`docs/API.md`](../API.md).

---

## 1. Đăng ký tài khoản Độc giả
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

## 2. Đăng nhập
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

## 3. Lấy thông tin tài khoản hiện tại
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

## 4. Đổi mật khẩu
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

## 5. Đăng xuất
- **Endpoint:** `POST /api/auth/logout`
- **Quyền truy cập:** Yêu cầu đăng nhập (`QUAN_TRI`, `THU_THU`, `DOC_GIA`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Dang xuat thanh cong"
}
```

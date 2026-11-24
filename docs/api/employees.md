# Module Quản lý Nhân viên (`/api/employees` hoặc `/api/nhan-vien`)

> **Base Endpoint:** `/api/employees` (hỗ trợ song song alias `/api/nhan-vien`)  
> **Chuẩn dữ liệu:** Tên trường `camelCase` và Enum `UPPER_SNAKE_CASE` tiếng Việt không dấu theo `docs/db.md`.  
> **Phân quyền:** Toàn bộ thao tác quản lý nhân viên chỉ dành cho **`QUAN_TRI`** (Mục 3.1, 3.2, 3.4 `docs/PROJECT.md`). Riêng `/me` cho phép cả `QUAN_TRI` và `THU_THU` xem hồ sơ nhân sự của chính mình.

---

## 1. Nhân viên xem hồ sơ nhân sự của chính mình
- **Endpoint:** `GET /api/employees/me`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Response `200 OK`:** Trả về object `nhan_vien` kèm thông tin `taiKhoanId` đã populate.

---

## 2. Lấy danh sách Nhân viên
- **Endpoint:** `GET /api/employees` (hoặc `GET /api/nhan-vien`)
- **Quyền truy cập:** `QUAN_TRI`
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `msnv`, `hoTenNV`, `chucVu`, `soDienThoai`, `diaChi`
  - `trangThaiLamViec`: Lọc theo trạng thái làm việc (`DANG_LAM_VIEC` | `NGHI_VIEC`)
  - `vaiTro`: Lọc theo vai trò tài khoản (`QUAN_TRI` | `THU_THU`)
  - `trangThai`: Lọc theo trạng thái tài khoản (`HOAT_DONG` | `BI_KHOA` | `CHO_XAC_MINH`)
  - `page`: Trang hiện tại (mặc định `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định `10`, tối đa `100`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay danh sach nhan vien thanh cong",
  "data": {
    "danhSach": [
      {
        "_id": "67408a...",
        "taiKhoanId": {
          "_id": "67408a...",
          "tenDangNhap": "thuthu",
          "email": "thuthu@thuviendhct.edu.vn",
          "vaiTro": "THU_THU",
          "trangThai": "HOAT_DONG",
          "lyDoKhoa": null,
          "ngayKhoa": null,
          "lanDangNhapCuoi": null,
          "ngayTao": "2026-11-22T08:00:00.000Z"
        },
        "msnv": "NV0002",
        "hoTenNV": "Tran Thi Thu Thu",
        "chucVu": "Thu thu",
        "diaChi": "Quan Ninh Kieu, TP. Can Tho",
        "soDienThoai": "0901000002",
        "trangThaiLamViec": "DANG_LAM_VIEC",
        "ngayTao": "2026-11-22T08:00:00.000Z",
        "ngayCapNhat": "2026-11-22T08:00:00.000Z"
      }
    ],
    "phanTrang": {
      "page": 1,
      "limit": 10,
      "totalItems": 2,
      "totalPages": 1
    }
  }
}
```

---

## 3. Lấy chi tiết 1 Nhân viên
- **Endpoint:** `GET /api/employees/:id`
- **Quyền truy cập:** `QUAN_TRI`
- **Response `200 OK`:** Trả về hồ sơ chi tiết nhân viên kèm `taiKhoanId`.
- **Mã lỗi:** `404 KHONG_TIM_THAY_NHAN_VIEN`.

---

## 4. Tạo mới Tài khoản & Hồ sơ Nhân viên
- **Endpoint:** `POST /api/employees`
- **Quyền truy cập:** `QUAN_TRI`
- **Quy tắc nghiệp vụ:**
  - Tạo đồng thời `tai_khoan` (`vaiTro`: `"THU_THU"` hoặc `"QUAN_TRI"`, mặc định `"THU_THU"`, `trangThai = "HOAT_DONG"`) và `nhan_vien` (`trangThaiLamViec = "DANG_LAM_VIEC"`) trong **MongoDB Transaction** (BR-14).
  - `msnv` tùy chọn (nếu bỏ trống hệ thống tự sinh `NV0001`, `NV0002`...).
  - Kiểm tra không trùng `tenDangNhap`, `email`, `msnv`, `soDienThoai`.
- **Request Body:**
```json
{
  "tenDangNhap": "thuthu02",
  "matKhau": "ThuThu@123",
  "vaiTro": "THU_THU",
  "email": "thuthu02@thuviendhct.edu.vn",
  "msnv": "NV0003",
  "hoTenNV": "Nguyen Van Minh",
  "chucVu": "Thu thu",
  "diaChi": "Quan Binh Thuy, TP. Can Tho",
  "soDienThoai": "0901000003"
}
```
- **Response `201 Created`:** Trả về hồ sơ nhân viên vừa tạo.
- **Mã lỗi:** `400 DU_LIEU_KHONG_HOP_LE`, `403 KHONG_DU_QUYEN`, `409 TEN_DANG_NHAP_DA_TON_TAI`, `409 EMAIL_DA_TON_TAI`, `409 MSNV_DA_TON_TAI`, `409 DIEN_THOAI_DA_TON_TAI`.

---

## 5. Cập nhật thông tin Hồ sơ Nhân viên
- **Endpoint:** `PUT /api/employees/:id`
- **Quyền truy cập:** `QUAN_TRI`
- **Quy tắc nghiệp vụ:**
  - Cập nhật `msnv`, `hoTenNV`, `chucVu`, `diaChi`, `soDienThoai`, `email`, `vaiTro` (`QUAN_TRI` | `THU_THU`).
  - Không cho phép Quản trị viên tự hạ `vaiTro` của chính mình xuống `THU_THU` (`400 KHONG_THE_TU_HA_QUYEN_QUAN_TRI`).
  - Không cho phép sửa trực tiếp `trangThaiLamViec` hoặc `trangThai` tài khoản qua endpoint này (`400 KHONG_SUA_TRUC_TIEP_TRANG_THAI`).
- **Request Body:**
```json
{
  "hoTenNV": "Nguyen Van Minh",
  "chucVu": "Thu thu chinh",
  "diaChi": "Quan Ninh Kieu, TP. Can Tho",
  "soDienThoai": "0901000003",
  "vaiTro": "THU_THU"
}
```
- **Response `200 OK`:** Trả về hồ sơ nhân viên sau khi cập nhật.

---

## 6. Đổi trạng thái làm việc của Nhân viên (Soft Delete — BR-11 & BR-12)
- **Endpoint:** `PATCH /api/employees/:id/work-status`
- **Quyền truy cập:** `QUAN_TRI`
- **Quy tắc nghiệp vụ (Mục 5.2 `docs/db.md`):**
  - Chuyển `trangThaiLamViec` giữa `DANG_LAM_VIEC` và `NGHI_VIEC`.
  - Không cho phép Quản trị viên tự chuyển chính mình sang `NGHI_VIEC` (`400 KHONG_THE_TU_KHOA_CHINH_MINH`).
  - Khi chuyển sang `NGHI_VIEC`, hệ thống **tự động khóa `tai_khoan` liên kết (`trangThai = "BI_KHOA"`)** và ghi `nhat_ky_he_thong` (`hanhDong = "KHOA_TAI_KHOAN"`).
  - Khi chuyển lại về `DANG_LAM_VIEC`, hệ thống tự động mở khóa `tai_khoan` và ghi `nhat_ky_he_thong` (`hanhDong = "MO_KHOA_TAI_KHOAN"`).
- **Request Body:**
```json
{
  "trangThaiLamViec": "NGHI_VIEC",
  "lyDo": "Nhan vien nghi viec theo quyet dinh nhan su"
}
```
- **Response `200 OK`:** Trả về hồ sơ nhân viên sau khi đổi trạng thái.

---

## 7. Khóa hoặc Mở khóa tài khoản đăng nhập của Nhân viên (BR-03 & BR-12)
- **Endpoint:** `PATCH /api/employees/:id/account-status`
- **Quyền truy cập:** `QUAN_TRI`
- **Quy tắc nghiệp vụ:**
  - Không cho phép Quản trị viên tự khóa tài khoản của chính mình (`400 KHONG_THE_TU_KHOA_CHINH_MINH`).
  - Không cho phép mở khóa tài khoản nếu nhân viên đang có `trangThaiLamViec === "NGHI_VIEC"` (`409 NHAN_VIEN_DANG_NGHI_VIEC`).
  - Khi `trangThai = "BI_KHOA"`, bắt buộc phải cung cấp `lyDoKhoa` (hoặc `lyDo`).
  - Tự động ghi `nhat_ky_he_thong` với `hanhDong = "KHOA_TAI_KHOAN"` hoặc `"MO_KHOA_TAI_KHOAN"`.
- **Request Body:**
```json
{
  "trangThai": "BI_KHOA",
  "lyDoKhoa": "Tam khoa tai khoan trong thoi gian ban giao cong viec"
}
```
- **Response `200 OK`:** Trả về hồ sơ nhân viên kèm trạng thái tài khoản mới.

---

## 8. Xóa Nhân viên
- **Endpoint:** `DELETE /api/employees/:id`
- **Quyền truy cập:** `QUAN_TRI`
- **Quy tắc nghiệp vụ (BR-11 & Mục 5.2 `docs/db.md`):**
  - Không cho phép Quản trị viên tự xóa chính mình (`400 KHONG_THE_TU_XOA_CHINH_MINH`).
  - **Cấm xóa vật lý** nếu nhân viên đã từng lập phiếu mượn, hủy phiếu, xác nhận trả sách, duyệt gia hạn, tạo/xử lý khoản phạt hoặc phát sinh nhật ký trong `nhat_ky_he_thong` → trả lỗi `409 NHAN_VIEN_DA_PHAT_SINH_GIAO_DICH` và hướng dẫn chuyển `trangThaiLamViec` sang `NGHI_VIEC`.
  - Chỉ xóa vật lý (cả `nhan_vien` và `tai_khoan` trong Transaction) khi nhân viên mới tạo nhầm và chưa từng thực hiện giao dịch nào.

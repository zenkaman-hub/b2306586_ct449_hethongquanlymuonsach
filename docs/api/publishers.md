# Module Nhà xuất bản (`/api/publishers` hoặc `/api/nha-xuat-ban`)

> Xem quy ước Header, Response thành công/lỗi và tài khoản seed mẫu tại [`docs/API.md`](../API.md).

---

## 1. Lấy danh sách Nhà xuất bản
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

## 2. Lấy chi tiết 1 Nhà xuất bản
- **Endpoint:** `GET /api/publishers/:id`
- **Quyền truy cập:** Công khai (Public)
- **Response `200 OK`:** Trả về object `nha_xuat_ban` kèm trường `soDauSach`.
- **Mã lỗi:** `404 KHONG_TIM_THAY_NXB`, `400 DINH_DANG_ID_KHONG_HOP_LE`.

---

## 3. Tạo mới Nhà xuất bản
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

## 4. Cập nhật thông tin Nhà xuất bản
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

## 5. Đổi trạng thái hoạt động Nhà xuất bản (Soft Delete — BR-11)
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

## 6. Xóa Nhà xuất bản
- **Endpoint:** `DELETE /api/publishers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (BR-11 & Mục 5.2 `docs/db.md`):**
  - Nếu có ít nhất 1 đầu sách trong collection `sach` đang tham chiếu `nhaXuatBanId` → **Cấm xóa vật lý**, trả về lỗi `409 NXB_DANG_CO_SACH_THAM_CHIEU` và yêu cầu chuyển sang `NGUNG_HOAT_DONG`.
  - Chỉ xóa vật lý khi `soDauSach === 0`.

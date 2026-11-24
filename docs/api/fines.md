# Module Quản lý Khoản Phạt & Bồi Thường (`/api/fines` hoặc `/api/khoan-phat`)

> **Base Endpoint:** `/api/fines` (hỗ trợ song song alias `/api/khoan-phat`)  
> **Chuẩn dữ liệu:** Tên trường `camelCase` và Enum `UPPER_SNAKE_CASE` tiếng Việt không dấu theo `docs/db.md`.

---

## 1. Độc giả xem danh sách khoản phạt và tổng nợ phạt cá nhân (BR-02)
- **Endpoint:** `GET /api/fines/my-fines`
- **Quyền truy cập:** `DOC_GIA`
- **Query Parameters:** `trangThai` (`CHUA_THANH_TOAN` | `THANH_TOAN_MOT_PHAN` | `DA_THANH_TOAN` | `DUOC_MIEN` | `DA_HUY`), `loaiPhat` (`TRA_TRE` | `HU_HONG` | `MAT_SACH`), `page`, `limit`
- **Response `200 OK`:** Trả về `{ tongTienPhatChuaTra, trangThaiQuyenMuon, lyDoHanCheMuon, danhSach, phanTrang }` của chính độc giả đang đăng nhập.

---

## 2. Lấy danh sách toàn bộ Khoản phạt
- **Endpoint:** `GET /api/fines` (hoặc `GET /api/khoan-phat`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `maKhoanPhat`, `lyDo`, `ghiChuXuLy`
  - `trangThai`: Lọc theo trạng thái (`CHUA_THANH_TOAN` | `THANH_TOAN_MOT_PHAN` | `DA_THANH_TOAN` | `DUOC_MIEN` | `DA_HUY`)
  - `loaiPhat`: Lọc theo loại phạt (`TRA_TRE` | `HU_HONG` | `MAT_SACH`)
  - `docGiaId`: Lọc theo `_id` độc giả
  - `phieuMuonId`: Lọc theo `_id` phiếu mượn
  - `page`, `limit`: Phân trang

---

## 3. Xem chi tiết 1 Khoản phạt
- **Endpoint:** `GET /api/fines/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`, `DOC_GIA` *(Độc giả chỉ được xem khoản phạt của chính mình theo BR-02)*
- **Response `200 OK`:** Trả về chi tiết khoản phạt kèm thông tin `docGiaId`, `phieuMuonId`, `chiTietSach`, `soTienConNo`, `nguoiTaoId`, `nguoiXuLyId`.

---

## 4. Xác nhận Thu tiền phạt (Toàn bộ hoặc Một phần — BR-12 & BR-14)
- **Endpoint:** `POST /api/fines/:id/pay`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chỉ áp dụng cho khoản phạt có `trangThai` là `CHUA_THANH_TOAN` hoặc `THANH_TOAN_MOT_PHAN`.
  - Nếu không truyền `soTienThu`, mặc định thu toàn bộ số tiền còn nợ (`soTienConNo = soTienPhat - soTienDaThanhToan`). Nếu truyền `soTienThu`, kiểm tra `0 < soTienThu <= soTienConNo`.
  - Trong **MongoDB Transaction**:
    - Tăng `soTienDaThanhToan += soTienThu`. Cập nhật `trangThai` sang `DA_THANH_TOAN` (nếu đã thu đủ) hoặc `THANH_TOAN_MOT_PHAN`.
    - Giảm `doc_gia.tongTienPhatChuaTra -= soTienThu`.
    - Nếu độc giả đã hết nợ phạt (`tongTienPhatChuaTra === 0`) và không còn sách quá hạn chưa trả → tự động mở lại `doc_gia.trangThaiQuyenMuon = "DUOC_MUON"`.
    - Nếu tất cả khoản phạt của dòng sách `HU_HONG` / `MAT_SACH` đã xử lý xong → chuyển `chiTietMuon.trangThai = "DA_XU_LY"`.
    - Ghi `nhat_ky_he_thong` (`hanhDong = "XAC_NHAN_THANH_TOAN_PHAT"`).
- **Request Body:**
```json
{
  "soTienThu": 20000,
  "ghiChuXuLy": "Doc gia nop tien mat tai quay thu vien"
}
```
- **Response `200 OK`:** Trả về chi tiết khoản phạt sau khi thu tiền.

---

## 5. Miễn Khoản phạt (`DUOC_MIEN` — BR-12)
- **Endpoint:** `PATCH /api/fines/:id/waive`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chỉ áp dụng cho khoản phạt đang `CHUA_THANH_TOAN` hoặc `THANH_TOAN_MOT_PHAN`.
  - **Bắt buộc** phải có `ghiChuXuLy` (hoặc `lyDo`).
  - Giảm `doc_gia.tongTienPhatChuaTra` đúng bằng phần tiền còn nợ được miễn (`soTienPhat - soTienDaThanhToan`), kiểm tra mở lại quyền mượn `DUOC_MUON`, đồng bộ `chiTietMuon.trangThai = "DA_XU_LY"` và ghi `nhat_ky_he_thong` (`hanhDong = "MIEN_PHAT"`).
- **Request Body:**
```json
{
  "ghiChuXuLy": "Mien phat do sinh vien co giay xac nhan nhap vien"
}
```
- **Response `200 OK`:** Trả về chi tiết khoản phạt đã được miễn.

---

## 6. Hủy Khoản phạt ghi nhận sai (`DA_HUY` — BR-11 & BR-12)
- **Endpoint:** `PATCH /api/fines/:id/cancel`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Theo **BR-11** & Mục 5.2 `docs/db.md`: Không xóa vật lý khoản phạt; dùng trạng thái `DA_HUY` kèm lý do và người xử lý.
  - Chỉ cho phép hủy khi khoản phạt chưa thu tiền (`soTienDaThanhToan === 0`). Nếu đã thu một phần tiền, trả lỗi `409 KHOAN_PHAT_DA_THU_TIEN_KHONG_THE_HUY`.
  - **Bắt buộc** phải có `ghiChuXuLy` (hoặc `lyDo`).
  - Giảm `doc_gia.tongTienPhatChuaTra`, kiểm tra mở lại quyền mượn `DUOC_MUON` và ghi `nhat_ky_he_thong` (`hanhDong = "HUY_PHAT"`).
- **Request Body:**
```json
{
  "ghiChuXuLy": "Huy khoan phat do thu thu chon nham tinh trang sach khi nhan tra"
}
```
- **Response `200 OK`:** Trả về chi tiết khoản phạt đã hủy.

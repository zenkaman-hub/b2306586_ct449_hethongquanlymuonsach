# Module Quản lý Độc giả (`/api/readers` hoặc `/api/doc-gia`)

> **Base Endpoint:** `/api/readers` (hỗ trợ song song alias `/api/doc-gia`)  
> **Chuẩn dữ liệu:** Tên trường `camelCase` và Enum `UPPER_SNAKE_CASE` tiếng Việt không dấu theo `docs/db.md`.

---

## 1. Độc giả xem hồ sơ cá nhân của chính mình (BR-02)
- **Endpoint:** `GET /api/readers/me`
- **Quyền truy cập:** `DOC_GIA`
- **Response `200 OK`:** Trả về object `doc_gia` kèm thông tin `taiKhoanId` đã populate.

---

## 2. Độc giả tự cập nhật thông tin cá nhân được phép
- **Endpoint:** `PUT /api/readers/me`
- **Quyền truy cập:** `DOC_GIA`
- **Quy tắc nghiệp vụ:**
  - Độc giả chỉ được sửa các trường cá nhân: `hoLot`, `ten`, `ngaySinh`, `phai` (`NAM` | `NU` | `KHAC`), `diaChi`, `dienThoai`, `email`.
  - Chặn độc giả tự sửa `maDocGia`, `trangThaiQuyenMuon`, `soSachDangMuon`, `tongTienPhatChuaTra`, `trangThaiHoSo`.
- **Request Body:**
```json
{
  "hoLot": "Le Van",
  "ten": "An",
  "ngaySinh": "2005-05-15",
  "phai": "NAM",
  "diaChi": "Ky tuc xa A, Dai hoc Can Tho",
  "dienThoai": "0912000001",
  "email": "docgia01@student.ctu.edu.vn"
}
```
- **Response `200 OK`:** Trả về hồ sơ độc giả sau khi cập nhật.

---

## 3. Lấy danh sách Độc giả
- **Endpoint:** `GET /api/readers` (hoặc `GET /api/doc-gia`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `maDocGia`, `hoLot`, `ten`, `dienThoai`, `diaChi`
  - `trangThaiQuyenMuon`: Lọc theo quyền mượn (`DUOC_MUON` | `BI_HAN_CHE`)
  - `trangThaiHoSo`: Lọc theo trạng thái hồ sơ (`HOAT_DONG` | `NGUNG_HOAT_DONG`)
  - `coSachDangMuon`: `"true"` (`soSachDangMuon > 0`) hoặc `"false"` (`soSachDangMuon === 0`)
  - `coNoPhat`: `"true"` (`tongTienPhatChuaTra > 0`) hoặc `"false"` (`tongTienPhatChuaTra === 0`)
  - `page`: Trang hiện tại (mặc định `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định `10`, tối đa `100`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay danh sach doc gia thanh cong",
  "data": {
    "danhSach": [
      {
        "_id": "67408a...",
        "taiKhoanId": {
          "_id": "67408a...",
          "tenDangNhap": "docgia01",
          "email": "docgia01@student.ctu.edu.vn",
          "vaiTro": "DOC_GIA",
          "trangThai": "HOAT_DONG",
          "lyDoKhoa": null,
          "ngayKhoa": null,
          "lanDangNhapCuoi": null,
          "ngayTao": "2026-11-22T08:00:00.000Z"
        },
        "maDocGia": "DG0001",
        "hoLot": "Le Van",
        "ten": "An",
        "ngaySinh": "2005-05-15T00:00:00.000Z",
        "phai": "NAM",
        "diaChi": "Ky tuc xa B, Dai hoc Can Tho",
        "dienThoai": "0912000001",
        "trangThaiQuyenMuon": "DUOC_MUON",
        "lyDoHanCheMuon": null,
        "soSachDangMuon": 0,
        "tongTienPhatChuaTra": 0,
        "trangThaiHoSo": "HOAT_DONG",
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

## 4. Lấy chi tiết 1 Độc giả
- **Endpoint:** `GET /api/readers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Response `200 OK`:** Trả về hồ sơ chi tiết độc giả kèm `taiKhoanId`.
- **Mã lỗi:** `404 KHONG_TIM_THAY_DOC_GIA`.

---

## 5. Nhân viên tạo mới Tài khoản & Hồ sơ Độc giả tại quầy
- **Endpoint:** `POST /api/readers`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Tạo đồng thời `tai_khoan` (`vaiTro = "DOC_GIA"`, `trangThai = "HOAT_DONG"`) và `doc_gia` trong **MongoDB Transaction** (BR-14).
  - `maDocGia` tùy chọn (nếu bỏ trống hệ thống tự sinh `DG0001`, `DG0002`...).
  - Kiểm tra chính sách `cachCapTaiKhoanDocGia` và `yeuCauDienThoaiDuyNhat` trong `cau_hinh_thu_vien`.
- **Request Body:**
```json
{
  "tenDangNhap": "docgia04",
  "matKhau": "DocGia@123",
  "email": "docgia04@student.ctu.edu.vn",
  "hoLot": "Vo Minh",
  "ten": "Khoa",
  "ngaySinh": "2004-11-20",
  "phai": "NAM",
  "diaChi": "Quan Cai Rang, TP. Can Tho",
  "dienThoai": "0912000004"
}
```
- **Response `201 Created`:** Trả về hồ sơ độc giả vừa tạo.
- **Mã lỗi:** `400 DU_LIEU_KHONG_HOP_LE`, `403 KHONG_CHO_PHEP_NHAN_VIEN_TAO_DOC_GIA`, `409 TEN_DANG_NHAP_DA_TON_TAI`, `409 EMAIL_DA_TON_TAI`, `409 MA_DOC_GIA_DA_TON_TAI`, `409 DIEN_THOAI_DA_TON_TAI`.

---

## 6. Nhân viên cập nhật thông tin Hồ sơ Độc giả
- **Endpoint:** `PUT /api/readers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Mô tả:** Cập nhật `maDocGia`, `hoLot`, `ten`, `ngaySinh`, `phai`, `diaChi`, `dienThoai`, `email`. Nếu `maDocGia` thay đổi sẽ tự động đồng bộ snapshot `maDocGia` trong `phieu_muon`.

---

## 7. Hạn chế hoặc Mở lại quyền mượn sách (BR-04 & BR-12)
- **Endpoint:** `PATCH /api/readers/:id/borrowing-status`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Theo **BR-04**: Khi chuyển sang `BI_HAN_CHE`, độc giả vẫn đăng nhập và tra cứu được bình thường nhưng bị chặn lập phiếu mượn mới.
  - Khi `trangThaiQuyenMuon = "BI_HAN_CHE"`, bắt buộc phải cung cấp `lyDoHanCheMuon` (hoặc `lyDo`).
  - Tự động ghi `nhat_ky_he_thong` với `hanhDong = "HAN_CHE_QUYEN_MUON"` hoặc `"MO_QUYEN_MUON"`.
- **Request Body:**
```json
{
  "trangThaiQuyenMuon": "BI_HAN_CHE",
  "lyDoHanCheMuon": "Qua han tra sach 2 lan lien tiep chua thanh toan phat"
}
```
- **Response `200 OK`:** Trả về hồ sơ độc giả sau khi cập nhật quyền mượn.

---

## 8. Khóa hoặc Mở khóa tài khoản đăng nhập của Độc giả (BR-03 & BR-12)
- **Endpoint:** `PATCH /api/readers/:id/account-status`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Theo **BR-03**: Tài khoản ở trạng thái `BI_KHOA` bị từ chối đăng nhập và từ chối mọi request dùng JWT token cũ.
  - Khi `trangThai = "BI_KHOA"`, bắt buộc phải có `lyDoKhoa` (hoặc `lyDo`).
  - Không cho phép mở khóa tài khoản (`HOAT_DONG`) khi hồ sơ độc giả đang ở trạng thái `NGUNG_HOAT_DONG` → trả lỗi `409 HO_SO_DOC_GIA_NGUNG_HOAT_DONG` (phải kích hoạt lại hồ sơ trước qua `PATCH /api/readers/:id/profile-status`).
  - Tự động ghi `nhat_ky_he_thong` với `hanhDong = "KHOA_TAI_KHOAN"` hoặc `"MO_KHOA_TAI_KHOAN"`.
- **Request Body:**
```json
{
  "trangThai": "BI_KHOA",
  "lyDoKhoa": "Vi pham noi quy thu vien nghiem trong"
}
```
- **Response `200 OK`:** Trả về hồ sơ độc giả kèm trạng thái tài khoản mới.

---

## 9. Ngừng hoạt động hoặc Kích hoạt lại Hồ sơ Độc giả (Soft Delete — BR-11)
- **Endpoint:** `PATCH /api/readers/:id/profile-status`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (Mục 5.2 `docs/db.md`):**
  - Chặn chuyển sang `NGUNG_HOAT_DONG` nếu độc giả vẫn còn sách đang mượn (`soSachDangMuon > 0`) hoặc còn nợ tiền phạt (`tongTienPhatChuaTra > 0`) → trả lỗi `409 DOC_GIA_CON_NGHIA_VU_CHUA_HOAN_TAT`.
  - Khi chuyển sang `NGUNG_HOAT_DONG`, hệ thống tự động khóa `tai_khoan` liên kết và ghi `nhat_ky_he_thong`.
- **Request Body:**
```json
{
  "trangThaiHoSo": "NGUNG_HOAT_DONG",
  "lyDo": "Sinh vien da tot nghiep ra truong va hoan tat thu tuc thu vien"
}
```
- **Response `200 OK`:** Trả về hồ sơ độc giả sau khi đổi trạng thái.

---

## 10. Xóa Độc giả
- **Endpoint:** `DELETE /api/readers/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (BR-11 & Mục 5.2 `docs/db.md`):**
  - **Cấm xóa vật lý** nếu độc giả còn sách chưa trả (`soSachDangMuon > 0`), còn nợ phạt (`tongTienPhatChuaTra > 0`), hoặc đã từng phát sinh lịch sử trong `phieu_muon` / `khoan_phat` → trả lỗi `409 DOC_GIA_DA_PHAT_SINH_GIAO_DICH`.
  - Chỉ xóa vật lý (cả `doc_gia` và `tai_khoan` trong Transaction) khi hồ sơ vừa tạo nhầm và chưa có bất kỳ giao dịch nào.

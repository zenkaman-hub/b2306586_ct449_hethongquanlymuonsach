# Module Sách & Quản lý Tồn kho (`/api/books` hoặc `/api/sach`)

> Xem quy ước Header, Response thành công/lỗi và tài khoản seed mẫu tại [`docs/API.md`](../API.md).

---

## 1. Lấy danh sách Đầu sách
- **Endpoint:** `GET /api/books` (hoặc `GET /api/sach`)
- **Quyền truy cập:** Công khai (Public — hỗ trợ Độc giả và Khách tra cứu sách)
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `maSach`, `tenSach`, `nguonGocTacGia`, `maNXB`
  - `nhaXuatBanId`: Lọc theo `_id` của Nhà xuất bản
  - `maNXB`: Lọc theo mã Nhà xuất bản (VD: `NXB001`)
  - `trangThaiLuuThong`: Lọc theo trạng thái lưu thông (`DANG_LUU_THONG` | `TAM_NGUNG` | `NGUNG_LUU_THONG`)
  - `conSachKhaDung`: `"true"` (`soQuyenKhaDung > 0`) hoặc `"false"` (`soQuyenKhaDung === 0`)
  - `page`: Trang hiện tại (mặc định `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định `10`, tối đa `100`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay danh sach sach thanh cong",
  "data": {
    "danhSach": [
      {
        "_id": "67408a...",
        "maSach": "S0001",
        "tenSach": "Lap trinh Web voi Node.js va Express",
        "donGia": 120000,
        "tongSoQuyen": 10,
        "soQuyenDangMuon": 0,
        "soQuyenHuHong": 0,
        "soQuyenKhaDung": 10,
        "soQuyenDaMat": 0,
        "namXuatBan": 2024,
        "nhaXuatBanId": {
          "_id": "67408a...",
          "maNXB": "NXB003",
          "tenNXB": "Nha xuat ban Giao Duc Viet Nam",
          "diaChi": "81 Tran Hung Dao, Hoan Kiem, Ha Noi",
          "trangThai": "HOAT_DONG"
        },
        "maNXB": "NXB003",
        "nguonGocTacGia": "Nguyen Van A",
        "trangThaiLuuThong": "DANG_LUU_THONG",
        "ngayTao": "2026-11-22T08:00:00.000Z",
        "ngayCapNhat": "2026-11-22T08:00:00.000Z"
      }
    ],
    "phanTrang": {
      "page": 1,
      "limit": 10,
      "totalItems": 5,
      "totalPages": 1
    }
  }
}
```

---

## 2. Lấy chi tiết 1 Đầu sách
- **Endpoint:** `GET /api/books/:id`
- **Quyền truy cập:** Công khai (Public)
- **Response `200 OK`:** Trả về object `sach` kèm thông tin `nhaXuatBanId` đã populate.
- **Mã lỗi:** `404 KHONG_TIM_THAY_SACH`, `400 DINH_DANG_ID_KHONG_HOP_LE`.

---

## 3. Tạo mới Đầu sách
- **Endpoint:** `POST /api/books`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - `maSach` tùy chọn (nếu bỏ trống hệ thống tự sinh `S0001`, `S0002`...).
  - Kiểm tra Nhà xuất bản (`nhaXuatBanId`) tồn tại và phải đang ở trạng thái `HOAT_DONG` (chặn thêm sách mới vào NXB đã `NGUNG_HOAT_DONG`).
  - Kiểm tra chống trùng lặp đầu sách theo bộ `(tenSach, nguonGocTacGia, nhaXuatBanId, namXuatBan)` không phân biệt chữ hoa/thường.
  - Tự động tính `soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon (0) - soQuyenHuHong`.
- **Request Body:**
```json
{
  "maSach": "S0006",
  "tenSach": "Cau truc du lieu va Giai thuat",
  "donGia": 115000,
  "tongSoQuyen": 15,
  "soQuyenHuHong": 0,
  "namXuatBan": 2024,
  "nhaXuatBanId": "67408a...",
  "nguonGocTacGia": "Tran Van D",
  "trangThaiLuuThong": "DANG_LUU_THONG"
}
```
- **Response `201 Created`:** Trả về đầu sách vừa tạo.
- **Mã lỗi:** `400 DU_LIEU_KHONG_HOP_LE`, `400 NXB_NGUNG_HOAT_DONG`, `404 KHONG_TIM_THAY_NXB`, `409 MA_SACH_DA_TON_TAI`, `409 DAU_SACH_DA_TON_TAI`.

---

## 4. Cập nhật thông tin cơ bản của Đầu sách
- **Endpoint:** `PUT /api/books/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chỉ cập nhật thông tin mô tả (`maSach`, `tenSach`, `donGia`, `namXuatBan`, `nhaXuatBanId`, `nguonGocTacGia`, `trangThaiLuuThong`).
  - **Không** cho phép sửa trực tiếp các trường số lượng tồn kho (`tongSoQuyen`, `soQuyenDangMuon`, `soQuyenHuHong`, `soQuyenKhaDung`, `soQuyenDaMat`) qua API này để tránh làm lệch tồn kho mà không có nhật ký truy vết (nếu truyền lên sẽ trả lỗi `400 KHONG_SUA_TRUC_TIEP_TON_KHO`).
- **Request Body:**
```json
{
  "tenSach": "Cau truc du lieu & Giai thuat (Tai ban)",
  "donGia": 125000,
  "namXuatBan": 2025,
  "nguonGocTacGia": "Tran Van D"
}
```
- **Response `200 OK`:** Trả về đầu sách sau khi cập nhật.

---

## 5. Điều chỉnh số lượng tồn kho thủ công (Ghi `nhat_ky_he_thong` — BR-12)
- **Endpoint:** `PATCH /api/books/:id/inventory`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (Mục 4.5 `docs/db.md` & Mục 5.10 `PROJECT.md`):**
  - Chỉ cho phép điều chỉnh khi thỏa bất biến: `tongSoQuyenMoi >= soQuyenDangMuon + soQuyenHuHongMoi`. Nếu vi phạm sẽ trả lỗi `400 VI_PHAM_BAT_BIEN_TON_KHO`.
  - Tự động tính lại: `soQuyenKhaDung = tongSoQuyenMoi - soQuyenDangMuon - soQuyenHuHongMoi`.
  - **Bắt buộc** phải có `lyDo` và tự động ghi 1 bản ghi vào `nhat_ky_he_thong` với `hanhDong = "DIEU_CHINH_SO_LUONG_SACH"`, lưu đầy đủ `duLieuTruoc`, `duLieuSau`, `nguoiThucHienId`, `vaiTroNguoiThucHien` và `lyDo`.
- **Request Body:**
```json
{
  "tongSoQuyen": 20,
  "soQuyenHuHong": 1,
  "lyDo": "Nhap bo sung 5 quyen moi va phat hien 1 quyen rach bia khi kiem ke kho"
}
```
- **Response `200 OK`:** Trả về đầu sách với bộ số lượng tồn kho mới.

---

## 6. Đổi trạng thái lưu thông Sách (Soft Delete — BR-11)
- **Endpoint:** `PATCH /api/books/:id/status`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Request Body:**
```json
{
  "trangThaiLuuThong": "NGUNG_LUU_THONG"
}
```
- **Response `200 OK`:** Trả về đầu sách với `trangThaiLuuThong` mới.

---

## 7. Xóa Đầu sách
- **Endpoint:** `DELETE /api/books/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ (BR-11 & Mục 5.2 `docs/db.md`):**
  - Nếu sách đang có `soQuyenDangMuon > 0` hoặc đã từng xuất hiện trong bất kỳ `phieu_muon.chiTietMuon` nào → **Cấm xóa vật lý**, trả lỗi `409 SACH_DA_PHAT_SINH_GIAO_DICH` và hướng dẫn chuyển `trangThaiLuuThong` sang `NGUNG_LUU_THONG`.
  - Chỉ cho phép xóa vật lý khi sách mới tạo nhầm và chưa từng tham gia bất kỳ phiếu mượn nào.

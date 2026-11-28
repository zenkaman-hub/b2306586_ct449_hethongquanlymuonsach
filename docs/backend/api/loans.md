# Module Quản lý Phiếu Mượn & Nghiệp vụ Trả Sách (`/api/loans` hoặc `/api/phieu-muon`)

> **Base Endpoint:** `/api/loans` (hỗ trợ song song alias `/api/phieu-muon`)  
> **Chuẩn dữ liệu:** Tên trường `camelCase` và Enum `UPPER_SNAKE_CASE` tiếng Việt không dấu theo `docs/db.md`.

---

## 1. Độc giả xem lịch sử mượn trả cá nhân (BR-02)
- **Endpoint:** `GET /api/loans/my-history`
- **Quyền truy cập:** `DOC_GIA`
- **Query Parameters:** `trangThai` (`DANG_MO` | `HOAN_TAT` | `DA_HUY`), `coSachQuaHan` (`true` | `false`), `tuNgay`, `denNgay`, `tuKhoa`, `page`, `limit`
- **Response `200 OK`:** Trả về `{ danhSach, phanTrang }` chỉ bao gồm các phiếu mượn của chính độc giả đang đăng nhập.

---

## 2. Lấy danh sách các cuốn sách đang quá hạn chưa trả trên toàn hệ thống
- **Endpoint:** `GET /api/loans/overdue-items`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Mô tả:** Tự động đồng bộ trạng thái `QUA_HAN` cho các cuốn sách `DANG_MUON` đã quá hạn trả, kèm theo `soNgayTreTamTinh` và `tienPhatTamTinh` tính đến ngày hiện tại.
- **Query Parameters:** `page`, `limit`

---

## 3. Lấy danh sách Phiếu mượn
- **Endpoint:** `GET /api/loans` (hoặc `GET /api/phieu-muon`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Query Parameters:**
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm theo `maPhieuMuon`, `maDocGia`, `chiTietMuon.maSach`, `chiTietMuon.tenSach`
  - `trangThai`: Lọc theo trạng thái phiếu (`DANG_MO` | `HOAN_TAT` | `DA_HUY`)
  - `docGiaId`: Lọc theo `_id` độc giả
  - `maDocGia`: Lọc theo mã độc giả (VD: `DG0001`)
  - `coSachQuaHan`: `"true"` hoặc `"false"`
  - `tuNgay`, `denNgay`: Lọc theo khoảng ngày mượn (`YYYY-MM-DD`)
  - `page`, `limit`: Phân trang

---

## 4. Xem chi tiết 1 Phiếu mượn
- **Endpoint:** `GET /api/loans/:id`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`, `DOC_GIA` *(Độc giả chỉ được xem phiếu của chính mình theo BR-02)*
- **Response `200 OK`:** Trả về chi tiết phiếu mượn kèm mảng `chiTietMuon` và mảng `danhSachKhoanPhat` đã phát sinh của phiếu đó.

---

## 5. Lập Phiếu mượn mới (BR-01, BR-05, BR-06, BR-07, BR-12, BR-14)
- **Endpoint:** `POST /api/loans`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Kiểm tra độc giả tồn tại, `trangThaiHoSo = "HOAT_DONG"`, tài khoản `"HOAT_DONG"`, quyền mượn `"DUOC_MUON"`.
  - Nếu cấu hình `hanCheMuonKhiCoViPham = true`: chặn mượn mới nếu độc giả đang còn nợ phạt (`tongTienPhatChuaTra > 0`) hoặc có sách quá hạn chưa trả.
  - Kiểm tra giới hạn số sách: `docGia.soSachDangMuon + danhSachSach.length <= soSachMuonToiDa` (mặc định `5`).
  - Không cho mượn trùng 2 cuốn của cùng 1 đầu sách trong cùng phiếu hoặc khi độc giả đang giữ cuốn đó chưa trả.
  - Trừ tồn kho nguyên tử trong **MongoDB Transaction** (`soQuyenDangMuon += 1, soQuyenKhaDung -= 1`). Nếu bất kỳ đầu sách nào hết bản khả dụng (`soQuyenKhaDung < 1`) hoặc ngừng lưu thông thì rollback toàn bộ phiếu.
  - Tự động ghi nhận `nhanVienLapId`, tăng `doc_gia.soSachDangMuon` và ghi `nhat_ky_he_thong` (`hanhDong = "LAP_PHIEU_MUON"`).
- **Request Body:**
```json
{
  "docGiaId": "67408a...",
  "ghiChu": "Sinh vien muon giao trinh hoc ky 1",
  "danhSachSach": [
    {
      "sachId": "67408a...",
      "hanTra": "2026-12-08"
    },
    {
      "maSach": "S0002"
    }
  ]
}
```
*(Ghi chú: Có thể truyền `docGiaId` hoặc `maDocGia`; trong `danhSachSach` mỗi phần tử có thể truyền `sachId` hoặc `maSach`, và `hanTra` riêng từng cuốn; nếu không truyền `hanTra` sẽ tự động tính `ngayMuon + soNgayMuonMacDinh`).*
- **Response `201 Created`:** Trả về phiếu mượn vừa lập.
- **Mã lỗi:** `400 VUOT_GIOI_HAN_SO_SACH_MUON`, `400 SACH_KHONG_DUOC_LUU_THONG`, `403 DOC_GIA_BI_HAN_CHE_MUON`, `403 DOC_GIA_CON_NO_PHAT`, `403 DOC_GIA_CO_SACH_QUA_HAN_CHUA_TRA`, `409 SACH_HET_SO_LUONG_KHA_DUNG`, `409 DOC_GIA_DANG_MUON_DAU_SACH_NAY`.

---

## 6. Xác nhận Trả sách Toàn phần hoặc Từng phần (BR-08, BR-09, BR-10, BR-12)
- **Endpoint:** `POST /api/loans/:id/return`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chặn xác nhận trả trùng đối với các cuốn đã trả/xử lý (`409 CHI_TIET_MUON_DA_DUOC_XU_LY`).
  - Xử lý tồn kho & trạng thái theo `tinhTrangKhiTra`:
    - `NGUYEN_VEN` hoặc `HU_HONG_NHE`: `chiTietMuon.trangThai` = `DA_TRA_DUNG_HAN` (hoặc `DA_TRA_TRE` nếu `soNgayTre > 0`). Tồn kho `sach`: `soQuyenDangMuon -= 1, soQuyenKhaDung += 1`.
    - `HU_HONG_NANG` *(bắt buộc có `moTaHuHong`)*: `chiTietMuon.trangThai = "HU_HONG"`. Tồn kho `sach`: `soQuyenDangMuon -= 1, soQuyenHuHong += 1` (`soQuyenKhaDung` không tăng). Tạo `khoan_phat` (`loaiPhat = "HU_HONG"`).
    - `MAT`: `chiTietMuon.trangThai = "MAT_SACH"`. Tồn kho `sach`: `soQuyenDangMuon -= 1, tongSoQuyen -= 1, soQuyenDaMat += 1` (`soQuyenKhaDung` không tăng). Tạo `khoan_phat` (`loaiPhat = "MAT_SACH"`).
  - Nếu trả trễ (`soNgayTre > 0`): Tự động tạo thêm `khoan_phat` (`loaiPhat = "TRA_TRE"`, `soTienPhat = soNgayTre * tienPhatTraTreMoiNgay`).
  - Cập nhật `doc_gia.soSachDangMuon`, cộng `doc_gia.tongTienPhatChuaTra`, và nếu phát sinh phạt mới khi `hanCheMuonKhiCoViPham = true` thì chuyển `doc_gia.trangThaiQuyenMuon = "BI_HAN_CHE"`.
  - Cập nhật trạng thái phiếu: Còn sách chưa trả thì giữ `"DANG_MO"`, đã trả/xử lý hết tất cả cuốn thì chuyển sang `"HOAN_TAT"`.
  - Ghi `nhat_ky_he_thong` (`XAC_NHAN_TRA_SACH`, `GHI_NHAN_HU_HONG`, `GHI_NHAN_MAT_SACH`).
- **Request Body:**
```json
{
  "ghiChu": "Doc gia tra truoc 1 cuon",
  "danhSachTra": [
    {
      "chiTietMuonId": "67408b...",
      "tinhTrangKhiTra": "NGUYEN_VEN"
    }
  ]
}
```
- **Response `200 OK`:** Trả về chi tiết phiếu mượn kèm danh sách khoản phạt mới (nếu có).

---

## 7. Gia hạn mượn cho 1 cuốn sách trong phiếu (Mục 5.9 `PROJECT.md`)
- **Endpoint:** `POST /api/loans/:id/extend`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chỉ gia hạn cuốn sách đang ở trạng thái `DANG_MUON`, chưa quá hạn, độc giả đang `DUOC_MUON` và `soLanDaGiaHan < soLanGiaHanToiDa`.
  - Lưu vào mảng nhúng `lichSuGiaHan` (`hanTraCu`, `hanTraMoi`, `nguoiDuyetId`, `ngayDuyet`, `lyDo`) và ghi `nhat_ky_he_thong` (`hanhDong = "GIA_HAN_MUON"`).
- **Request Body:**
```json
{
  "chiTietMuonId": "67408b...",
  "soNgayGiaHan": 7,
  "lyDo": "Sinh vien xin gia han de on thi cuoi ky"
}
```
- **Response `200 OK`:** Trả về chi tiết phiếu mượn sau khi gia hạn.

---

## 8. Hủy Phiếu mượn lập nhầm (BR-11)
- **Endpoint:** `PATCH /api/loans/:id/cancel`
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Quy tắc nghiệp vụ:**
  - Chỉ cho phép hủy khi phiếu đang `DANG_MO` và chưa có cuốn sách nào được trả/xử lý (`409 PHIEU_MUON_DA_CO_SACH_TRA`).
  - Hoàn lại `soQuyenKhaDung` cho các đầu sách, giảm `doc_gia.soSachDangMuon` và chuyển phiếu sang `trangThai = "DA_HUY"` kèm `nguoiHuyId`, `ngayHuy`, `lyDoHuy`.
- **Request Body:**
```json
{
  "lyDoHuy": "Thu thu chon nham ma doc gia khi lap phieu"
}
```
- **Response `200 OK`:** Trả về chi tiết phiếu mượn đã hủy.

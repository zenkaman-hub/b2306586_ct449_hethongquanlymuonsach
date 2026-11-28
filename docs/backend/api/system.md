# Module Cấu hình Thư viện, Nhật ký Hệ thống & Thống kê Dashboard

> **Base Endpoints:**  
> - Cấu hình thư viện: `/api/settings` (alias `/api/cau-hinh`)  
> - Nhật ký hệ thống: `/api/audit-logs` (alias `/api/nhat-ky`)  
> - Thống kê tổng quan: `/api/dashboard` (alias `/api/thong-ke`)  
> **Chuẩn dữ liệu:** Tên trường `camelCase` và Enum `UPPER_SNAKE_CASE` tiếng Việt không dấu theo `docs/db.md`.

---

## 1. Xem Cấu hình chính sách thư viện hiện tại
- **Endpoint:** `GET /api/settings` (hoặc `GET /api/cau-hinh`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`, `DOC_GIA`
- **Mô tả:** Trả về bản ghi cấu hình duy nhất (`maCauHinh: "MAC_DINH"`). Nếu chưa có trong CSDL, hệ thống tự động khởi tạo giá trị mặc định.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay cau hinh thu vien thanh cong",
  "data": {
    "_id": "67408a...",
    "maCauHinh": "MAC_DINH",
    "soNgayMuonMacDinh": 14,
    "soSachMuonToiDa": 5,
    "tienPhatTraTreMoiNgay": 2000,
    "soLanGiaHanToiDa": 1,
    "soNgayGiaHanMoiLan": null,
    "hanCheMuonKhiCoViPham": true,
    "choPhepDatTruoc": false,
    "cachCapTaiKhoanDocGia": "TU_DANG_KY_VA_NHAN_VIEN_TAO",
    "yeuCauXacMinhTaiKhoanDocGia": false,
    "yeuCauDienThoaiDuyNhat": true,
    "soNgayNhacTraTruocHan": null,
    "nguongSoNgayQuaHanKhoaMuon": null,
    "tyLeBoiThuongSachMat": null,
    "tyLeBoiThuongSachHuHong": null,
    "nguoiCapNhatId": null,
    "ngayCapNhat": "2026-11-24T16:00:00.000Z"
  }
}
```

---

## 2. Quản trị viên cập nhật Cấu hình chính sách thư viện (BR-12)
- **Endpoint:** `PUT /api/settings` (hoặc `PUT /api/cau-hinh`)
- **Quyền truy cập:** Chỉ **`QUAN_TRI`**
- **Quy tắc nghiệp vụ:**
  - Cập nhật các tham số chính sách mượn trả trong `cau_hinh_thu_vien`.
  - Tự động ghi vào `nhat_ky_he_thong` với `hanhDong = "CAP_NHAT_CAU_HINH"`, lưu rõ `duLieuTruoc`, `duLieuSau` và `lyDo`.
- **Request Body:**
```json
{
  "soNgayMuonMacDinh": 14,
  "soSachMuonToiDa": 5,
  "tienPhatTraTreMoiNgay": 3000,
  "soLanGiaHanToiDa": 1,
  "soNgayGiaHanMoiLan": 7,
  "hanCheMuonKhiCoViPham": true,
  "tyLeBoiThuongSachMat": 1.5,
  "tyLeBoiThuongSachHuHong": 1.0,
  "lyDo": "Dieu chinh muc phat tra tre va ty le boi thuong theo quy dinh hoc ky moi"
}
```
- **Response `200 OK`:** Trả về cấu hình thư viện sau khi cập nhật.

---

## 3. Xem danh sách Nhật ký hệ thống (`nhat_ky_he_thong` — BR-12)
- **Endpoint:** `GET /api/audit-logs` (hoặc `GET /api/nhat-ky`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Query Parameters:**
  - `hanhDong`: Lọc theo 1 trong 14 hành động (`LAP_PHIEU_MUON`, `XAC_NHAN_TRA_SACH`, `GHI_NHAN_HU_HONG`, `GHI_NHAN_MAT_SACH`, `GIA_HAN_MUON`, `DIEU_CHINH_SO_LUONG_SACH`, `KHOA_TAI_KHOAN`, `MO_KHOA_TAI_KHOAN`, `HAN_CHE_QUYEN_MUON`, `MO_QUYEN_MUON`, `XAC_NHAN_THANH_TOAN_PHAT`, `MIEN_PHAT`, `HUY_PHAT`, `CAP_NHAT_CAU_HINH`)
  - `doiTuongCollection`: Lọc theo tên collection bị tác động (`tai_khoan`, `doc_gia`, `nhan_vien`, `nha_xuat_ban`, `sach`, `phieu_muon`, `khoan_phat`, `cau_hinh_thu_vien`)
  - `doiTuongId`: Lọc theo `_id` của bản ghi bị tác động
  - `nguoiThucHienId`: Lọc theo `_id` tài khoản người thực hiện
  - `vaiTroNguoiThucHien`: `QUAN_TRI` | `THU_THU` | `DOC_GIA`
  - `tuNgay`, `denNgay`: Lọc theo khoảng thời điểm (`YYYY-MM-DD`)
  - `tuKhoa` *(hoặc `search`)*: Tìm kiếm trong trường `lyDo`
  - `page`, `limit`: Phân trang (mặc định `limit = 20`)
- **Response `200 OK`:** Trả về `{ danhSach, phanTrang }` trong đó mỗi bản ghi đã populate `nguoiThucHienId`.

---

## 4. Xem chi tiết 1 bản ghi Nhật ký hệ thống
- **Endpoint:** `GET /api/audit-logs/:id` (hoặc `GET /api/nhat-ky/:id`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Response `200 OK`:** Trả về chi tiết bản ghi nhật ký bao gồm `duLieuTruoc` và `duLieuSau`.

---

## 5. Thống kê tổng quan Dashboard (Task D3-02 `docs/PLAN.md`)
- **Endpoint:** `GET /api/dashboard/summary` (hoặc `GET /api/dashboard`, `GET /api/thong-ke`)
- **Quyền truy cập:** `QUAN_TRI`, `THU_THU`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lay thong ke tong quan thu vien thanh cong",
  "data": {
    "sach": {
      "tongSoDauSach": 5,
      "tongSoQuyen": 41,
      "soQuyenKhaDung": 40,
      "soQuyenDangMuon": 0,
      "soQuyenHuHong": 1,
      "soQuyenDaMat": 0,
      "tongSoNhaXuatBan": 3
    },
    "docGia": {
      "tongSoDocGia": 2,
      "soDocGiaDuocMuon": 1,
      "soDocGiaBiHanChe": 1
    },
    "nhanVien": {
      "tongSoNhanVien": 2
    },
    "muonTra": {
      "soPhieuMuonDangMo": 0,
      "soPhieuMuonHoanTat": 0,
      "soPhieuMuonDaHuy": 0,
      "soSachDangMuon": 0,
      "soSachQuaHan": 0
    },
    "khoanPhat": {
      "tongSoKhoanPhat": 0,
      "soKhoanPhatChuaXuLy": 0,
      "tongTienPhatDaThu": 0,
      "tongTienPhatChuaThu": 0
    },
    "hoatDongGanDay": {
      "phieuMuonMoiNhat": [],
      "nhatKyMoiNhat": []
    }
  }
}
```

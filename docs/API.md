# API.md — Đặc tả RESTful API (WEBQUANLYMUONSACH)

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Base URL mặc định:** `http://localhost:5000/api`  
> **Chuẩn dữ liệu:** Toàn bộ tên trường (field) và giá trị Enum tuân thủ chuẩn tiếng Việt không dấu trong `docs/db.md`.  
> **Lưu ý cho AI Agent:** Tài liệu chi tiết từng module được tách riêng trong `docs/api/`. Chỉ đọc đúng file module bạn đang làm để tiết kiệm ngữ cảnh và tránh xung đột khi nhiều Agent cùng cập nhật.

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

## 3. Mục lục API theo Module (`docs/api/`)

| STT | Module | Base Endpoint | Tài liệu chi tiết | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Xác thực & Phân quyền | `/api/auth` | [`docs/api/auth.md`](./api/auth.md) | Đã hoàn thành |
| 2 | Nhà xuất bản | `/api/publishers` (alias `/api/nha-xuat-ban`) | [`docs/api/publishers.md`](./api/publishers.md) | Đã hoàn thành |
| 3 | Sách & Quản lý Tồn kho | `/api/books` (alias `/api/sach`) | [`docs/api/books.md`](./api/books.md) | Đã hoàn thành |

*(Khi xây dựng module mới, tạo file `docs/api/<ten-module>.md` và thêm 1 dòng vào bảng trên.)*

---

## 4. Tài khoản Seed Mẫu để Kiểm thử (`npm run seed`)

| Vai trò (`vaiTro`) | `tenDangNhap` | Mật khẩu | Mã hồ sơ | Trạng thái đặc biệt |
| :--- | :--- | :--- | :--- | :--- |
| `QUAN_TRI` | `admin` | `Admin@123` | `msnv: "NV0001"` | Đầy đủ quyền quản trị |
| `THU_THU` | `thuthu` | `ThuThu@123` | `msnv: "NV0002"` | Quyền nghiệp vụ thư viện |
| `DOC_GIA` | `docgia01` | `DocGia@123` | `maDocGia: "DG0001"` | `trangThaiQuyenMuon: "DUOC_MUON"` |
| `DOC_GIA` | `docgia02` | `DocGia@123` | `maDocGia: "DG0002"` | `trangThaiQuyenMuon: "BI_HAN_CHE"` (dùng test BR-04) |

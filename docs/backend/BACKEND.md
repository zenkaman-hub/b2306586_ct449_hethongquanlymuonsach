# BACKEND.md — Quy tắc Kiến trúc, Nghiệp vụ & Hướng dẫn cho AI Agent Backend

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Stack Backend:** Node.js + Express.js + MongoDB (Mongoose, CommonJS)  
> **Thư mục làm việc:** `backend/`  
> **Mục đích:** Tài liệu quy tắc dùng chung dành riêng cho các AI Agent xây dựng, bảo trì hoặc kiểm thử Backend, giúp tuân thủ kiến trúc 4 tầng, giữ nguyên chuẩn dữ liệu MongoDB và chống quá tải ngữ cảnh.

---

## 1. Quy tắc Đọc Tài liệu trong `docs/backend/`

Khi nhận một task Backend, **KHÔNG** đọc thư mục `docs/frontend/` hay `frontend/`. Chỉ đọc đúng phạm vi sau:

1. **Bắt buộc đọc đầu tiên:**
   - [`AGENTS.md`](../../AGENTS.md): Quy ước chung của toàn dự án.
   - `docs/backend/BACKEND.md` *(file này)*: Quy tắc code 4 tầng, chuẩn lỗi, transaction và kiểm thử Backend.
   - [`docs/backend/API.md`](./API.md): Quy ước Header, cấu trúc Response chung, mục lục 8 module API và tài khoản Seed.
2. **Đọc theo đúng phạm vi task:**
   - **CRUD / Schema / Index:** Chỉ đọc mục collection liên quan trong [`docs/backend/db.md`](./db.md) + 1 module mẫu (`nhaXuatBan.*` hoặc `sach.*`).
   - **Nghiệp vụ phức tạp (Mượn/Trả/Phạt/Gia hạn):** Đọc thêm mục quy trình tương ứng trong [`docs/PROJECT.md`](../PROJECT.md).
   - **Đặc tả API & Kiểm thử:** Chỉ đọc đúng file trong [`docs/backend/api/`](./api/) và bộ Postman tương ứng trong [`docs/backend/KiemthuAPI/`](./KiemthuAPI/).

---

## 2. Kiến trúc 4 Tầng Bắt buộc (`backend/src/`)

Mọi module nghiệp vụ phải đi theo đúng 4 tầng tách biệt:

```text
routes/*.route.js  →  controllers/*.controller.js  →  validators/*.validator.js  →  services/*.service.js
```

1. **Routes (`src/routes/*.route.js`):**
   - Khai báo endpoint, gắn middleware `authenticate` và `authorize(...dsVaiTro)` từ `src/middlewares/auth.middleware.js`.
   - Không viết logic xử lý dữ liệu hay truy vấn DB trong route.
2. **Controllers (`src/controllers/*.controller.js`):**
   - Chỉ nhận `req`, gọi hàm `validate*` và hàm `service*`, trả JSON chuẩn `{ success: true, message, data }` và chuyển mọi lỗi sang `next(error)`.
3. **Validators (`src/validators/*.validator.js`):**
   - Kiểm tra dữ liệu đầu vào (`body`, `params`, `query`), ép kiểu, kiểm tra Enum từ `src/constants/enums.js`.
   - Khi sai dữ liệu, ném `new AppError(message, 400, 'DU_LIEU_KHONG_HOP_LE', details)`.
4. **Services (`src/services/*.service.js`):**
   - Chứa toàn bộ logic nghiệp vụ, bất biến dữ liệu, MongoDB Transaction (`mongoose.startSession()`) và ghi nhật ký `nhat_ky_he_thong`.
   - Mọi lỗi nghiệp vụ phải ném qua `new AppError(message, statusCode, errorCode, details)`.

---

## 3. Quy ước Đặt tên & Dữ liệu Bất di Bất dịch

- **CommonJS:** Sử dụng `require(...)` và `module.exports` thống nhất trong toàn bộ `backend/`.
- **Ngôn ngữ định danh:**
  - Tên collection: `snake_case` tiếng Việt không dấu (`tai_khoan`, `doc_gia`, `nhan_vien`, `nha_xuat_ban`, `sach`, `phieu_muon`, `khoan_phat`, `nhat_ky_he_thong`, `cau_hinh_thu_vien`).
  - Tên field & hàm nghiệp vụ: `camelCase` tiếng Việt không dấu (`tenDangNhap`, `soQuyenKhaDung`, `lapPhieuMuon`, `dieuChinhTonKho`...).
  - Enum & `errorCode`: `UPPER_SNAKE_CASE` tiếng Việt không dấu, định nghĩa tập trung duy nhất tại `src/constants/enums.js` (không hardcode chuỗi rời rạc).
- **Chuẩn phân trang cho mọi API `GET` danh sách:**
  - Trả về `{ danhSach, phanTrang: { page, limit, totalItems, totalPages } }`.
  - Hỗ trợ query `page`, `limit`, `tuKhoa` (alias `search`).

---

## 4. Quy tắc Nghiệp vụ & Bảo mật Cốt lõi

- **Phân quyền 3 vai trò (`QUAN_TRI`, `THU_THU`, `DOC_GIA`):** Backend luôn là nguồn kiểm tra quyền cuối cùng, không tin vào việc Frontend ẩn nút.
- **BR-03 / BR-04:** Tài khoản `BI_KHOA` bị chặn đăng nhập và chặn mọi API đã xác thực; độc giả `BI_HAN_CHE` quyền mượn vẫn đăng nhập tra cứu & xem lịch sử, chỉ bị chặn khi lập phiếu mượn mới.
- **BR-08 (Trả sách từng phần) & Bất biến tồn kho:** Luôn đảm bảo `soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon - soQuyenHuHong >= 0`; mọi cập nhật tồn kho / mượn / trả / phạt liên quan nhiều collection phải bọc trong Transaction.
- **BR-11 (Soft Delete):** Không xóa vật lý dữ liệu đã phát sinh tham chiếu hoặc giao dịch; chuyển sang `NGUNG_HOAT_DONG` / `NGUNG_LUU_THONG` / `NGHI_VIEC`.
- **BR-12 (Nhật ký hệ thống):** Mọi thao tác nhạy cảm (điều chỉnh tồn kho, khóa/mở tài khoản, hạn chế quyền mượn, thu/miễn/hủy phạt, cập nhật cấu hình...) bắt buộc ghi `nhat_ky_he_thong` kèm `duLieuTruoc`, `duLieuSau` và `lyDo`.
- **Chính sách động (`cau_hinh_thu_vien`):** Không hardcode số ngày mượn, giới hạn sách hay mức phạt — đọc từ bản ghi `maCauHinh: "MAC_DINH"`.

---

## 5. Danh mục Tài liệu Backend (`docs/backend/`)

| Đường dẫn | Mục đích |
| :--- | :--- |
| [`docs/backend/BACKEND.md`](./BACKEND.md) | Quy tắc code 4 tầng & nghiệp vụ cho AI Agent Backend *(file này)* |
| [`docs/backend/db.md`](./db.md) | Thiết kế chi tiết 9 collection MongoDB, `$jsonSchema` và indexes |
| [`docs/backend/API.md`](./API.md) | Quy ước REST API chung, mục lục 8 module & tài khoản Seed |
| [`docs/backend/api/*.md`](./api/) | Đặc tả chi tiết từng endpoint theo 8 module (`auth`, `publishers`, `books`, `readers`, `employees`, `loans`, `fines`, `system`) |
| [`docs/backend/KiemthuAPI/`](./KiemthuAPI/) | Bộ Postman Collection kiểm thử API theo từng module |

---

## 6. Checklist Trước khi Hoàn thành Task Backend

1. Đã thêm/cập nhật đặc tả endpoint trong đúng file `docs/backend/api/<module>.md` (và 1 dòng trong `docs/backend/API.md` nếu là module mới).
2. Đã cập nhật bảng chú thích file/hàm trong [`docs/STRUCTURE.md`](../STRUCTURE.md).
3. Đã kiểm thử luồng chính và các mã lỗi nghiệp vụ (`400`, `401`, `403`, `404`, `409`) bằng script test hoặc Postman.

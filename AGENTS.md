# AGENTS.md — Hướng dẫn nhanh & Điều phối Context cho AI Agent

> **Mục đích:** Điểm đọc đầu tiên cho mọi AI Agent tham gia dự án **WEBQUANLYMUONSACH** nhằm đảm bảo code thống nhất, tránh xung đột giữa nhiều Agent và **chống quá tải ngữ cảnh (context overload)**.

---

## 1. Bảng định tuyến đọc tài liệu (CHỈ đọc đúng phần cần thiết)

**Không** đọc toàn bộ thư mục `docs/` khi bắt đầu một task nhỏ. Chỉ đọc theo đúng phạm vi dưới đây:

| Vai trò / Loại task | Tài liệu BẮT BUỘC đọc | Tài liệu KHÔNG cần đọc hết |
| :--- | :--- | :--- |
| **Backend CRUD / Module mới** | `AGENTS.md` + mục collection liên quan trong `docs/db.md` + 1 module mẫu (VD: `nhaXuatBan.*` hoặc `sach.*`) | Không đọc toàn bộ `docs/PLAN.md`, `docs/PROJECT.md`, hay các `docs/api/*.md` khác |
| **Backend Nghiệp vụ phức tạp** (Mượn/Trả/Phạt/Gia hạn) | `AGENTS.md` + mục quy trình tương ứng ở Mục 5 & 6 `docs/PROJECT.md` + mục collection trong `docs/db.md` | Không đọc `docs/PLAN.md`, `database/khoi_tao_csdl.js` |
| **Frontend màn hình / tích hợp API** | `AGENTS.md` + `docs/API.md` (quy ước chung) + đúng file `docs/api/<module>.md` cần gọi | Không đọc `docs/db.md`, `docs/PLAN.md`, code backend |
| **Review / QA / Viết test** | `AGENTS.md` + `git diff` / file vừa đổi + file `docs/api/<module>.md` tương ứng | Không đọc toàn bộ `docs/` |
| **Khởi tạo / Sửa DB** | `docs/db.md` + `database/khoi_tao_csdl.js` + `backend/src/models/` | Không đọc `docs/api/*.md`, `frontend/` |

---

## 2. Công nghệ & Quy ước bất di bất dịch

- **Stack:** Backend `Node.js + Express.js + MongoDB (Mongoose, CommonJS)` | Frontend `Vue.js + Vite + Pinia + Vue Router`.
- **3 vai trò (`vaiTro`):** `QUAN_TRI`, `THU_THU`, `DOC_GIA`. Backend luôn là nguồn quyết định cuối cùng về phân quyền và nghiệp vụ.
- **Đặt tên:**
  - Collection, tên field, tên hàm nghiệp vụ: tiếng Việt không dấu (`camelCase` cho field/hàm, `snake_case` cho tên collection).
  - Enum & mã lỗi (`errorCode`): `UPPER_SNAKE_CASE` tiếng Việt không dấu (định nghĩa tập trung ở `backend/src/constants/enums.js`).
- **Kiến trúc 4 tầng Backend:** `routes/*.route.js` → `controllers/*.controller.js` → `validators/*.validator.js` → `services/*.service.js`.
  - Controller chỉ nhận `req`, gọi validator + service, trả JSON và đẩy lỗi qua `next(error)`.
  - Mọi lỗi nghiệp vụ ném bằng `new AppError(message, statusCode, errorCode, details)`.
  - Bảo vệ route bằng `authenticate` và `authorize(...)` trong `backend/src/middlewares/auth.middleware.js`.
- **Chuẩn JSON Response:**
  - Thành công: `{ "success": true, "message": "...", "data": ... }`
  - Lỗi: `{ "success": false, "errorCode": "MA_LOI", "message": "...", "details": ... }`
- **Quy tắc nghiệp vụ cốt lõi không được phá vỡ:**
  - **BR-03 / BR-04:** Tài khoản `BI_KHOA` không đăng nhập được; độc giả `BI_HAN_CHE` quyền mượn vẫn đăng nhập để tra cứu & xem lịch sử.
  - **BR-11:** Không xóa vật lý dữ liệu đã phát sinh tham chiếu/giao dịch — dùng soft delete (`NGUNG_HOAT_DONG` / `NGUNG_LUU_THONG` / `NGHI_VIEC`).
  - **BR-12:** Các thao tác nhạy cảm (điều chỉnh tồn kho, khóa tài khoản, xử lý phạt...) phải ghi `nhat_ky_he_thong`.
  - **PENDING DECISION:** Chính sách chưa được chủ dự án chốt ở Mục 10 `docs/PROJECT.md` không được tự coi là cố định (đọc từ `cau_hinh_thu_vien` nếu có).

---

## 3. Quy tắc phối hợp nhiều Agent (Chống xung đột)

1. **Tài liệu API tách theo module:** Khi thêm/sửa API của module `<X>`, viết chi tiết vào file riêng `docs/api/<X>.md` và chỉ cập nhật 1 dòng trong bảng mục lục của `docs/API.md`. Không dồn toàn bộ đặc tả vào `docs/API.md`.
2. **Hạn chế chạm file dùng chung:** Chỉ sửa tối thiểu phần liên quan ở `backend/src/app.js`, `docs/API.md` và `docs/STRUCTURE.md` để tránh conflict Git.
3. **FE tuân thủ Contract:** Frontend chỉ gọi đúng endpoint, field và mã lỗi ghi trong `docs/api/<module>.md`, không tự đoán tên field.
4. **Báo cáo khi hoàn thành task:** Luôn liệt kê:
   - Danh sách file đã tạo / sửa.
   - Danh sách hàm / endpoint mới kèm mô tả ngắn.
   - Cách kiểm thử & các điểm còn tồn tại (nếu có).

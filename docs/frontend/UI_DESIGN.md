# UI_DESIGN.md — Đặc tả Chi tiết Giao diện & Tương tác Người dùng (UI/UX Specification)

> **Dự án:** WEBQUANLYMUONSACH — Website quản lý thư viện và nghiệp vụ mượn trả sách  
> **Công nghệ Frontend:** Vue 3 (`<script setup>`) + Vite + Pinia + Vue Router + Axios + Bootstrap 5 + Font Awesome 6  
> **Phong cách thiết kế:** Quản trị viên & Thủ thư theo bố cục **Admin Dashboard cổ điển (Sidebar tối + Header xanh dương + Bảng dữ liệu trực quan)**; Độc giả & Khách theo bố cục **Cổng tra cứu hiện đại, thoáng sáng**.  
> **Phạm vi tài liệu:** Đặc tả đầy đủ bố cục, bảng màu, hệ thống nút bấm (Button), hiệu ứng tương tác (`default`, `hover`, `active`, `focus`, `disabled`, `loading`), trạng thái rỗng/lỗi và chi tiết từng màn hình cho **4 đối tượng sử dụng**.

---

## 1. Tổng quan Phân nhóm Giao diện & Ma trận Truy cập

Hệ thống Backend quản lý **3 vai trò chính thức (`vaiTro`)** gồm `QUAN_TRI`, `THU_THU`, `DOC_GIA` cùng trạng thái **Khách chưa đăng nhập**. Để rõ ràng khi thiết kế và lập trình Frontend, tài liệu chia thành **4 lớp giao diện** sử dụng **3 khung bố cục (Layouts)**:

| STT | Đối tượng giao diện | Vai trò Backend (`vaiTro`) | Layout sử dụng | Trang mặc định sau khi vào / đăng nhập |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Khách chưa đăng nhập** *(Guest)* | `null` *(Chưa có JWT)* | `ReaderLayout` *(chế độ Công khai)* & `AuthLayout` | `/books` *(Tra cứu sách công khai)* |
| **2** | **Độc giả đã đăng nhập** *(Reader)* | `DOC_GIA` | `ReaderLayout` *(chế độ Thành viên)* | `/reader/books` *(Tra cứu sách)* |
| **3** | **Nhân viên / Thủ thư** *(Librarian)* | `THU_THU` | `StaffLayout` *(Sidebar nghiệp vụ)* | `/staff/dashboard` *(Tổng quan thư viện)* |
| **4** | **Quản trị viên** *(Admin)* | `QUAN_TRI` | `StaffLayout` *(Full Sidebar + Quản trị hệ thống)* | `/staff/dashboard` *(Tổng quan thư viện)* |

### 1.1. Ma trận Phân quyền Màn hình & Điều hướng

| Nhóm màn hình | Đường dẫn (Route) | Khách | Độc giả (`DOC_GIA`) | Thủ thư (`THU_THU`) | Quản trị (`QUAN_TRI`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Đăng nhập / Đăng ký | `/login`, `/register` | ✅ | ↪️ Về `/reader/books` | ↪️ Về `/staff/dashboard` | ↪️ Về `/staff/dashboard` |
| Đổi mật khẩu | `/change-password` | ↪️ `/login` | ✅ | ✅ | ✅ |
| Tra cứu & Chi tiết sách | `/books` hoặc `/reader/books` | ✅ *(Chỉ xem)* | ✅ *(Xem + trạng thái mượn)* | ✅ *(Xem nhanh)* | ✅ *(Xem nhanh)* |
| Phiếu mượn cá nhân | `/reader/loans` | ❌ | ✅ | ❌ | ❌ |
| Khoản phạt cá nhân | `/reader/fines` | ❌ | ✅ | ❌ | ❌ |
| Hồ sơ cá nhân độc giả | `/reader/profile` | ❌ | ✅ | ❌ | ❌ |
| Dashboard thống kê | `/staff/dashboard` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Quản lý Nhà xuất bản | `/staff/publishers` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Quản lý Đầu sách & Tồn kho | `/staff/books` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Quản lý Độc giả | `/staff/readers` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Quản lý Phiếu mượn & Quá hạn | `/staff/loans`, `/staff/loans/create`, `/staff/loans/:id` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Quản lý Khoản phạt | `/staff/fines` | ❌ | ❌ *(403)* | ✅ | ✅ |
| Tra cứu Nhật ký hệ thống | `/staff/audit-logs` | ❌ | ❌ *(403)* | ✅ *(Chỉ xem)* | ✅ *(Chỉ xem)* |
| Quản lý Nhân viên | `/admin/employees` | ❌ | ❌ *(403)* | ❌ *(403 / Ẩn menu)* | ✅ |
| Cấu hình chính sách thư viện | `/admin/settings` | ❌ | ❌ *(403)* | 👁️ *(Chỉ xem)* | ✅ *(Xem & Sửa)* |

---

## 2. Hệ thống Thiết kế (Design System) & Quy ước Tương tác

### 2.1. Bảng màu chuẩn (CSS Variables)

Lấy cảm hứng trực tiếp từ phong cách Web Admin chuyên nghiệp (Header xanh dương, Sidebar tối tương phản cao, Bảng trắng sạch sẽ, nút thao tác phân biệt rõ bằng màu sắc):

| Nhóm màu | Biến CSS | Mã màu Hex | Ứng dụng cụ thể |
| :--- | :--- | :--- | :--- |
| **Chủ đạo (Primary)** | `--color-primary` | `#3C8DBC` | Thanh Top Header Staff, Header bảng (`<thead>`), nút `+ Thêm mới`, nút `Lưu`, viền trên Card |
| **Chủ đạo đậm** | `--color-primary-dark` | `#367FA9` | Khối Logo góc trái Header, trạng thái `:hover` / `:active` nút Primary |
| **Sidebar nền chính** | `--sidebar-bg` | `#222D32` | Nền cột Sidebar bên trái (`StaffLayout`) |
| **Sidebar tiêu đề / tối** | `--sidebar-dark` | `#1A2226` | Nhãn phân nhóm `MAIN NAVIGATION`, đường phân cách |
| **Sidebar mục con** | `--sidebar-submenu-bg` | `#2C3B41` | Nền danh sách menu cấp 2 khi mở rộng |
| **Sidebar Active** | `--sidebar-active-bg` | `#1E282C` | Nền mục cha/con đang chọn, kèm viền trái `3px solid #3C8DBC` |
| **Nền trang (Canvas)** | `--bg-canvas` | `#ECF0F5` | Nền khu vực nội dung chính (`StaffLayout`) |
| **Nền thẻ (Surface)** | `--bg-surface` | `#FFFFFF` | Card, Modal, Bảng dữ liệu, Form |
| **Thành công (Success)** | `--color-success` | `#00A65A` | Nút `Thu tiền`, `Kích hoạt lại`, `Mở khóa`, chấm `● Online`, Badge `HOAT_DONG` |
| **Cảnh báo / Sửa (Warning)** | `--color-warning` | `#F39C12` | Nút Sửa (`fa-pen-to-square`), nút `Gia hạn`, nút `Hạn chế mượn`, Banner cảnh báo `BI_HAN_CHE` |
| **Nguy hiểm / Xóa (Danger)** | `--color-danger` | `#DD4B39` | Nút Xóa (`fa-xmark` / `fa-trash`), nút `Khóa tài khoản`, `Hủy phiếu`, Badge đếm quá hạn trên Sidebar |
| **Thông tin (Info)** | `--color-info` | `#00C0EF` | Nút `Xem chi tiết`, nút `Điều chỉnh tồn kho`, nút `Miễn phạt` |
| **Quản trị (Admin Accent)** | `--color-admin` | `#605CA8` | Badge vai trò `QUAN_TRI`, thẻ KPI nhân viên |
| **Chữ chính / phụ** | `--text-main` / `--text-muted` | `#2C3E50` / `#6C757D` | Tiêu đề, nội dung bảng / nhãn phụ, breadcrumb |
| **Viền bảng / input** | `--border-color` | `#DDE2E6` | Đường kẻ ô bảng, viền ô nhập liệu, thanh công cụ |

### 2.2. Typography & Iconography
- **Font chữ:** `'Inter', 'Segoe UI', Roboto, Arial, sans-serif` (hỗ trợ đầy đủ dấu tiếng Việt, `font-variant-numeric: tabular-nums` cho cột số tiền, số lượng, mã phiếu để căn thẳng hàng).
- **Thang kích thước:**
  - Tiêu đề trang (`h1.page-title`): `20px–22px`, `font-weight: 700`, chữ in hoa nhẹ hoặc tiêu đề rõ ràng.
  - Tiêu đề Card / Modal (`h2.card-title`): `16px`, `font-weight: 600`.
  - Nội dung bảng & form: `14px`, `line-height: 1.5`.
  - Nhãn phụ / Breadcrumb / Badge: `12px–13px`, `font-weight: 500–600`.
- **Bộ biểu tượng:** Font Awesome 6 Free (`fas` / `far`), kích thước chuẩn `14px` trong nút bấm và `16px` trong Sidebar.

---

### 2.3. Hệ thống Button & Quy ước Trạng thái Tương tác

Mọi nút bấm trong hệ thống đều có `transition: all 0.18s ease-in-out`, `border-radius: 4px`, con trỏ `cursor: pointer` khi khả dụng và `cursor: not-allowed` khi vô hiệu hóa.

| Loại Button | Class / Kiểu dáng | Trạng thái `Default` | Trạng thái `:hover` | Trạng thái `:active` (Nhấn giữ) | Trạng thái `:focus-visible` | Trạng thái `:disabled` / `Loading` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chính (Primary)** | `.btn-primary` (`+ Thêm mới`, `Lưu`, `Lập phiếu`) | Nền `#3C8DBC`, chữ `#FFF`, viền `#367FA9` | Nền `#357CA5`, đổ bóng nhẹ `0 2px 6px rgba(60,141,188,0.35)` | Nền `#2B6688`, co nhẹ `transform: scale(0.98)` | Vòng sáng `0 0 0 3px rgba(60,141,188,0.35)` | `opacity: 0.6`, không đổ bóng; khi Loading hiện `<i class="fas fa-spinner fa-spin">` + chữ *"Đang xử lý..."* |
| **Thành công (Success)** | `.btn-success` (`Thu tiền`, `Trả sách`, `Mở khóa`) | Nền `#00A65A`, chữ `#FFF` | Nền `#008D4C`, bóng nhẹ xanh lá | Nền `#00733E`, `scale(0.98)` | Vòng sáng `rgba(0,166,90,0.35)` | `opacity: 0.6`, chặn click lặp (chống double-submit) |
| **Cảnh báo / Sửa (Warning)** | `.btn-warning` (Sửa, Gia hạn, Hạn chế mượn) | Nền `#F39C12`, chữ `#FFF` | Nền `#E08E0B`, bóng nhẹ vàng cam | Nền `#C87F0A`, `scale(0.98)` | Vòng sáng `rgba(243,156,18,0.35)` | `opacity: 0.55` |
| **Nguy hiểm / Xóa (Danger)** | `.btn-danger` (Xóa, Khóa TK, Hủy phiếu) | Nền `#DD4B39`, chữ `#FFF` | Nền `#D73925`, bóng nhẹ đỏ | Nền `#C23321`, `scale(0.98)` | Vòng sáng `rgba(221,75,57,0.35)` | `opacity: 0.5` + Tooltip giải thích lý do bị khóa (VD: BR-11) |
| **Thông tin (Info)** | `.btn-info` (Xem chi tiết, Tồn kho, Miễn phạt) | Nền `#00C0EF`, chữ `#FFF` | Nền `#00ACD6` | Nền `#0097BC`, `scale(0.98)` | Vòng sáng `rgba(0,192,239,0.35)` | `opacity: 0.55` |
| **Phụ / Viền (Outline)** | `.btn-outline-secondary` (`Hủy`, `Đặt lại`, `Làm mới`) | Nền `#FFF`, chữ `#495057`, viền `#CED4DA` | Nền `#F1F3F5`, viền `#ADB5BD` | Nền `#E9ECEF`, `scale(0.98)` | Vòng sáng `rgba(108,117,125,0.25)` | `opacity: 0.5`, nền `#F8F9FA` |
| **Nút Icon vuông trong bảng** | `.btn-icon-sm` (`30×30px`, bo góc `4px`) | Căn giữa icon `13px`, khoảng cách giữa các nút `4px` | Nổi nhẹ `translateY(-1px)` + hiện **Tooltip** tên hành động phía trên | `translateY(0) scale(0.95)` | Vòng sáng theo màu nút | `opacity: 0.4`, xám hóa nhẹ, giữ Tooltip để giải thích |
| **Nút Làm mới (Refresh)** | `.btn-refresh` (nút vuông `36×36px` cạnh bộ lọc) | Nền `#FFF`, viền `#CED4DA`, icon `fa-rotate-right` | Nền `#F1F3F5`, icon đậm hơn | Icon xoay mượt `rotate(360deg)` trong `0.5s` khi gọi lại API | Vòng sáng xanh nhạt | Xoay liên tục `fa-spin` trong lúc đang tải danh sách |

---

### 2.4. Quy ước Hiệu ứng Active cho Điều hướng, Tab, Bảng & Component

1. **Menu Sidebar (`StaffLayout` — mô phỏng ảnh mẫu):**
   - **Mục đơn / Mục cha đang mở (`expanded`):** Nền chuyển `#1E282C`, viền trái `3px solid #3C8DBC`, chữ trắng `#FFFFFF`, icon mũi tên `<` bên phải xoay mượt `transform: rotate(-90deg)` thành `v` trong `0.2s`.
   - **Mục con đang `active` (`router-link-active`):** Nền `#2C3B41` sáng hơn hoặc nhấn nền `#364952`, chữ trắng đậm `font-weight: 600`, icon hình tròn rỗng `far fa-circle` đổi thành hình tròn đặc `fas fa-circle-dot` màu `#3C8DBC` (hoặc trắng sáng), viền trái phụ `2px solid #3C8DBC`.
   - **Hover mục không active:** Chữ chuyển từ `#B8C7CE` sang `#FFFFFF`, nền sáng nhẹ `#1E282C`.
   - **Badge thông báo trên Sidebar:** Hình chữ nhật bo góc `3px` màu đỏ `#DD4B39` chữ trắng `11px` nằm sát lề phải mục menu (VD: số sách đang quá hạn ở mục *Quản lý Mượn – Trả*, số khoản phạt chưa thu ở mục *Quản lý Khoản phạt*).
   - **Sidebar thu gọn (Collapsed Mode):** Khi bấm nút Hamburger (`fa-bars`) trên Header, Sidebar thu từ `230px` xuống `54px`, chỉ hiện icon; hover vào icon sẽ bung menu nổi (flyout) sang bên phải.

2. **Thanh Điều hướng Ngang (`ReaderLayout`):**
   - **Menu link đang `active`:** Chữ trắng đậm `#FFFFFF`, nền pill mờ `rgba(255, 255, 255, 0.16)` kèm gạch chân `border-bottom: 3px solid #FFFFFF` ở cạnh dưới Navbar.
   - **Hover:** Nền `rgba(255, 255, 255, 0.08)`, chữ trắng.

3. **Thanh Tab nội bộ (VD: `LoanListView` — Phiếu mượn / Sách quá hạn):**
   - **Tab `active`:** Nền `#FFFFFF`, chữ `#3C8DBC` in đậm, viền trên `3px solid #3C8DBC`, nối liền vào khung bảng bên dưới.
   - **Tab không active:** Nền `#F4F6F9`, chữ `#5A6A7E`; hover đổi chữ sang `#3C8DBC`.

4. **Bảng dữ liệu (`DataTable`) & Phân trang (`PaginationBar`):**
   - **Header bảng (`<thead>`):** Nền xanh `#3C8DBC`, chữ trắng in hoa `12.5px`, `font-weight: 600`, đường ngăn cột mảnh `rgba(255,255,255,0.2)`.
   - **Hover dòng (`tbody tr:hover`):** Đổi nền sang `#F0F7FC`.
   - **Dòng đang được chọn (`row-selected`, VD khi tích checkbox trả sách):** Nền `#E3F2FD`, viền trái `3px solid #3C8DBC`.
   - **Dòng cảnh báo quá hạn (`row-overdue`):** Nền đỏ cực nhạt `#FFF5F5`, ngày hạn trả tô đỏ đậm `#DD4B39`.
   - **Phân trang:** Nút trang đang chọn (`active`) có nền `#3C8DBC`, chữ trắng, không bấm lại được; nút `« Trước` / `Sau »` tự động `disabled` khi ở trang `1` hoặc trang cuối `totalPages`.

5. **Form Input, Modal & Toast:**
   - **Input `:focus`:** Viền chuyển `#3C8DBC` + bóng `0 0 0 3px rgba(60,141,188,0.18)`.
   - **Input lỗi (`.is-invalid`):** Viền `#DD4B39`, hiện dòng thông báo lỗi đỏ `12.5px` ngay dưới input (lấy từ validation phía client hoặc `error.response.data.details`).
   - **Modal (`ConfirmModal` / Form Modal):** Nền phủ mờ `rgba(0,0,0,0.45)`, hộp thoại trượt nhẹ từ trên xuống (`fade-slide-down 0.2s`), bấm `Esc` hoặc nút `×` để đóng (chặn đóng ngoài khi đang submit).
   - **AlertToast:** Xuất hiện góc trên bên phải (`top: 64px; right: 20px`), tự ẩn sau `3.5s`, có thanh tiến trình mảnh ở đáy và nút đóng `×`. Gồm 4 biến thể: Thành công (Xanh lá), Lỗi (Đỏ), Cảnh báo (Vàng cam), Thông tin (Xanh dương).
   - **Empty State:** Khi `danhSach.length === 0`, hiển thị icon lớn nhạt màu (`fa-box-open` / `fa-book-open`), thông điệp rõ ràng (*"Không tìm thấy dữ liệu phù hợp"*) và nút *"Đặt lại bộ lọc"* nếu đang lọc.

---

## 3. Chi tiết Giao diện 1: Khách Chưa Đăng Nhập (`Guest`)

Khách vãng lai chưa xác thực có thể tra cứu danh mục sách công khai của thư viện, xem chi tiết tình trạng sách và thực hiện Đăng nhập hoặc Đăng ký tài khoản độc giả.

### 3.1. Khung `ReaderLayout` (Chế độ Khách)
- **Top Navbar (Cao `60px`, nền `#2C7BB6` hoặc trắng viền dưới sắc nét, dính cố định `sticky-top`):**
  - **Trái:** Logo sách (`fa-book-open-reader`) + tên **"THƯ VIỆN WEBQUANLYMUONSACH"** (click về `/books`).
  - **Giữa:** Link điều hướng `Tra cứu sách` (trạng thái `active` khi ở `/books`).
  - **Phải:**
    - Nút **`Đăng nhập`** (`btn-outline-light`, icon `fa-right-to-bracket`): Chuyển tới `/login`. Hover nền trắng chữ xanh.
    - Nút **`Đăng ký`** (`btn-warning` hoặc `btn-light` chữ xanh đậm, icon `fa-user-plus`): Chuyển tới `/register`.
- **Footer:** Tên hệ thống, giờ mở cửa thư viện, liên hệ hỗ trợ.

### 3.2. Các màn hình dành cho Khách

#### Màn hình 1.1: Tra cứu Sách công khai (`BookCatalogView.vue` — `/books`)
- **API gọi:** `GET /api/books`, `GET /api/publishers?trangThai=HOAT_DONG&limit=100`.
- **Khu vực Tìm kiếm & Bộ lọc (Thanh ngang trên cùng):**
  - Ô tìm kiếm `InputSearch` (placeholder: *"Tìm theo tên sách, mã sách, tác giả..."*, hỗ trợ nhấn `Enter` hoặc bấm nút `Tìm kiếm`).
  - Dropdown lọc **Nhà xuất bản** (*Tất cả NXB* — không gửi param khi chọn Tất cả).
  - Dropdown lọc **Trạng thái lưu thông** (*Tất cả* / `Đang lưu thông` / `Tạm ngưng`).
  - Checkbox toggle **"Chỉ hiển thị sách còn sẵn (`conSachKhaDung=true`)"**.
  - Nút **`Làm mới`** (`fa-rotate-right`) & nút chuyển đổi chế độ hiển thị **Lưới thẻ (`fa-grip`) / Bảng (`fa-list`)** (nút chế độ đang chọn có nền xanh `#3C8DBC` chữ trắng — hiệu ứng active toggle group).
- **Danh sách Sách (Mặc định dạng Lưới thẻ 3–4 cột trên Desktop):**
  - Mỗi thẻ sách (Card) hiển thị: `maSach` (nhãn xám nhỏ), `tenSach` (in đậm 2 dòng), `nguonGocTacGia`, `tenNXB`, `namXuatBan`, `donGia` (định dạng `VNĐ`), Badge tình trạng (`Còn X/Y quyển` màu xanh lá nếu `soQuyenKhaDung > 0`; `Tạm hết sách` màu đỏ nếu `=== 0`; `Tạm ngưng` màu vàng).
  - Hover thẻ sách: Nổi nhẹ `translateY(-3px)`, đổ bóng `0 6px 16px rgba(0,0,0,0.08)`, viền đổi nhẹ sang `#3C8DBC`.
- **Chi tiết nút bấm:**

| Nút bấm | Vị trí | Kiểu & Icon | Hành vi & Trạng thái |
| :--- | :--- | :--- | :--- |
| **Tìm kiếm** | Cuối ô `InputSearch` | `.btn-primary` + `fa-search` | Gọi `GET /api/books?page=1&tuKhoa=...` |
| **Đặt lại bộ lọc** | Thanh lọc (hiện khi có filter) | `.btn-outline-secondary` + `fa-filter-circle-xmark` | Xóa trắng từ khóa/dropdown và tải lại trang 1 |
| **Xem chi tiết** | Chân mỗi thẻ sách | `.btn-outline-primary` + `fa-eye` | Mở Modal chi tiết sách (`GET /api/books/:id`) hiển thị đầy đủ thông tin NXB, tồn kho, trạng thái |
| **Đăng nhập để theo dõi mượn** | Trong Modal chi tiết sách (chế độ Guest) | `.btn-primary` + `fa-right-to-bracket` | Điều hướng tới `/login?redirect=/reader/books` |

#### Màn hình 1.2: Đăng nhập (`LoginView.vue` — `/login`) — `AuthLayout`
- **Bố cục:** Nền gradient xanh nhạt `#ECF0F5 → #DCE8F2`, thẻ trắng căn giữa (`max-width: 420px`, viền trên `4px solid #3C8DBC`, đổ bóng mềm).
- **Thành phần:**
  - Logo + Tiêu đề *"Đăng nhập hệ thống"*.
  - Ô nhập `tenDangNhap` (có icon `fa-user` bên trái).
  - Ô nhập `matKhau` (có icon `fa-lock` bên trái + nút icon con mắt `fa-eye` / `fa-eye-slash` bên phải để bật/tắt hiện mật khẩu).
  - Khung cảnh báo lỗi (Alert đỏ): Hiển thị `message` từ Backend, đặc biệt rõ ràng khi gặp `TAI_KHOAN_BI_KHOA` (**BR-03**) kèm lý do khóa.
- **Chi tiết nút bấm:**

| Nút bấm | Kiểu & Icon | Hành vi & Trạng thái |
| :--- | :--- | :--- |
| **Ẩn/Hiện mật khẩu** | Nút icon trong input (`fa-eye` / `fa-eye-slash`) | Click đổi `type="password"` ↔ `type="text"`, icon đổi trạng thái active màu `#3C8DBC` |
| **Đăng nhập** | `.btn-primary w-100` + `fa-right-to-bracket` | Gọi `POST /api/auth/login`. Khi đang gọi API: `disabled`, hiện spinner *"Đang đăng nhập..."*. Thành công: `QUAN_TRI`/`THU_THU` → `/staff/dashboard`, `DOC_GIA` → `/reader/books` |
| **Đăng ký tài khoản độc giả** | Link dưới form | Chuyển sang `/register` |
| **Quay lại tra cứu sách** | Link phụ dưới cùng + `fa-arrow-left` | Chuyển về `/books` |

#### Màn hình 1.3: Đăng ký Độc giả (`RegisterView.vue` — `/register`) — `AuthLayout`
- **Bố cục:** Thẻ căn giữa (`max-width: 640px`), chia 2 cột trên Desktop cho gọn mắt.
- **Các nhóm trường:**
  - *Thông tin tài khoản:* `tenDangNhap` (*), `email`, `matKhau` (*), `xacNhanMatKhau` (*).
  - *Thông tin hồ sơ độc giả:* `hoLot` (*), `ten` (*), `ngaySinh`, `phai` (Radio/Select: `NAM`, `NU`, `KHAC`), `dienThoai` (*), `diaChi`.
- **Nút bấm:**
  - **`Đăng ký tài khoản`** (`.btn-primary` + `fa-user-plus`): Gọi `POST /api/auth/register`. Tự động đăng nhập và chuyển tới `/reader/books` kèm Toast chào mừng.
  - **`Đã có tài khoản? Đăng nhập`** (Link): Chuyển về `/login`.

#### Màn hình 1.4: Trang Lỗi 404 & 403 (`NotFoundView.vue`, `ForbiddenView.vue`)
- Hiển thị mã lỗi lớn (`404` / `403`), mô tả ngắn gọn, nút **`Về trang chủ`** (`.btn-primary`, tự động điều hướng đúng trang chủ theo `authStore.vaiTro`) và nút **`Quay lại trang trước`** (`.btn-outline-secondary`, `router.back()`).

---

## 4. Chi tiết Giao diện 2: Độc Giả Đã Đăng Nhập (`DOC_GIA`)

Độc giả sau khi đăng nhập sử dụng `ReaderLayout` ở chế độ thành viên. Điểm nghiệp vụ cốt lõi cần thể hiện rõ trên UI là **BR-04**: Độc giả bị `BI_HAN_CHE` quyền mượn vẫn đăng nhập, tra cứu sách và xem lịch sử bình thường nhưng luôn thấy cảnh báo rõ ràng.

### 4.1. Khung `ReaderLayout` (Chế độ Độc giả)
- **Top Navbar:**
  - **Trái:** Logo + tên thư viện (click về `/reader/books`).
  - **Giữa (3 mục điều hướng chính — có hiệu ứng `active` gạch chân trắng + nền pill mờ):**
    1. `Tra cứu sách` (`/reader/books`, icon `fa-book`)
    2. `Phiếu mượn của tôi` (`/reader/loans`, icon `fa-book-reader`, có badge nhỏ màu vàng/đỏ nếu có sách đang mượn hoặc quá hạn)
    3. `Khoản phạt của tôi` (`/reader/fines`, icon `fa-file-invoice-dollar`, có **badge đỏ** hiện số tiền/số khoản phạt nếu `tongTienPhatChuaTra > 0`)
  - **Phải (Cụm tài khoản):**
    - Nút Avatar tròn (chữ cái đầu tên) + `hoLot + ten` + mã `maDocGia` + mũi tên dropdown.
    - Khi bấm mở **Dropdown Menu** (có bóng đổ, hiệu ứng `active` nhẹ khi đang ở trang tương ứng):
      - `Hồ sơ cá nhân` (`fa-id-card` → `/reader/profile`)
      - `Đổi mật khẩu` (`fa-key` → `/change-password`)
      - Đường kẻ ngăn cách
      - `Đăng xuất` (`fa-right-from-bracket`, chữ đỏ `#DD4B39` → gọi `POST /api/auth/logout`, xóa token, về `/login`).
- **Banner Cảnh báo Quyền mượn (BR-04 — Conditional Global Banner):**
  - Chỉ hiển thị khi `authStore.isReaderRestricted === true` (`hoSo.trangThaiQuyenMuon === 'BI_HAN_CHE'`).
  - Kiểu dáng: Thanh cảnh báo nền vàng nhạt `#FFF3CD`, viền trái `4px solid #F39C12`, chữ nâu đậm `#856404`, icon `fa-triangle-exclamation`.
  - Nội dung: *"Tài khoản của bạn hiện đang bị **hạn chế quyền mượn sách mới**. Lý do: `{hoSo.lyDoHanCheMuon}`. Bạn vẫn có thể tra cứu sách, xem lịch sử mượn và liên hệ thủ thư để giải quyết."* kèm nút link nhanh **`Xem khoản phạt`** (nếu còn nợ phạt).

### 4.2. Các màn hình của Độc giả

#### Màn hình 2.1: Tra cứu Sách (`/reader/books` — `BookCatalogView.vue`)
- Tái sử dụng toàn bộ giao diện tìm kiếm, lọc và lưới/bảng sách của màn hình Guest.
- **Điểm nâng cao cho Độc giả đã đăng nhập:** Trong Modal Chi tiết sách, hiển thị thêm thông tin *"Hướng dẫn: Vui lòng mang mã độc giả `{maDocGia}` đến quầy thủ thư để lập phiếu mượn"* (và nếu đang `BI_HAN_CHE`, hiển thị ghi chú màu cam nhắc kiểm tra quyền mượn).

#### Màn hình 2.2: Phiếu mượn & Lịch sử Mượn của tôi (`/reader/loans` — `MyLoansView.vue`)
- **API gọi:** `GET /api/loans/my-history`.
- **Hàng thẻ tóm tắt nhanh (3 mini-cards):**
  - *Sách đang mượn:* `soSachDangMuon` (màu xanh dương).
  - *Sách quá hạn:* đếm các cuốn `QUA_HAN` (màu đỏ, nhấp vào tự lọc sang quá hạn).
  - *Tổng phiếu đã lập:* `phanTrang.totalItems` (màu xám/xanh lá).
- **Bộ lọc:** Dropdown trạng thái phiếu (`Tất cả`, `Đang mở`, `Đã hoàn tất`, `Đã hủy`), nút **`Làm mới`**.
- **Danh sách Phiếu mượn (Dạng Accordion Card hoặc Bảng có thể mở rộng dòng):**
  - Hàng chính hiển thị: `maPhieuMuon`, `ngayMuon`, số lượng đầu sách, `trangThai` (`StatusBadge`), nút **`Xem chi tiết`** (`fa-chevron-down` xoay `180deg` khi mở rộng — hiệu ứng active).
  - Khi mở rộng, hiện bảng con `chiTietMuon`: Mã sách, Tên sách, Hạn trả (`hanTra` — tô đỏ + badge *"Quá hạn X ngày"* nếu quá hạn), Ngày trả thực tế (`ngayTraThucTe`), Số lần gia hạn (`soLanGiaHan`), Trạng thái cuốn sách (`StatusBadge`).

#### Màn hình 2.3: Khoản phạt của tôi (`/reader/fines` — `MyFinesView.vue`)
- **API gọi:** `GET /api/fines/my-fines`.
- **Banner tổng nợ phạt:** Hiển thị nổi bật `tongTienPhatChuaTra` (màu đỏ nếu `> 0` kèm hướng dẫn đóng phạt tại quầy thư viện; màu xanh lá *"Bạn không có khoản phạt nào chưa thanh toán"* nếu `=== 0`).
- **Bộ lọc:** Trạng thái khoản phạt (`Tất cả`, `Chưa thanh toán`, `Thanh toán một phần`, `Đã thanh toán`, `Được miễn`, `Đã hủy`), Loại phạt (`TRA_TRE`, `HU_HONG`, `MAT_SACH`), nút **`Làm mới`**.
- **Bảng Khoản phạt:** `maKhoanPhat`, `maPhieuMuon`, Tên sách, `loaiPhat` (Badge), `soTienPhat`, `soTienDaThanhToan`, `soTienConNo` (in đậm đỏ nếu `> 0`), `trangThai` (Badge), nút **`Chi tiết`** (`.btn-icon-sm .btn-info` + `fa-eye` mở Modal xem lý do phạt, số ngày trễ, ghi chú xử lý của thủ thư).

#### Màn hình 2.4: Hồ sơ cá nhân (`/reader/profile` — `MyProfileView.vue`)
- **API gọi:** `GET /api/readers/me`, `PUT /api/readers/me`.
- **Bố cục 2 cột:**
  - **Cột trái (Thẻ thông tin cố định — Chỉ đọc):** Avatar, Họ tên, `maDocGia`, `tenDangNhap`, Badge `trangThaiQuyenMuon` (`DUOC_MUON` / `BI_HAN_CHE`), `soSachDangMuon`, `tongTienPhatChuaTra`, nút nhanh **`Đổi mật khẩu`** (`.btn-outline-primary` → `/change-password`).
  - **Cột phải (Form chỉnh sửa thông tin liên hệ):** `hoLot`, `ten`, `ngaySinh`, `phai`, `dienThoai`, `diaChi`, `email`.
- **Nút bấm:**
  - **`Lưu thay đổi`** (`.btn-primary` + `fa-floppy-disk`): Tự động `disabled` khi chưa có trường nào thay đổi so với dữ liệu gốc; sáng bật lên ngay khi người dùng chỉnh sửa.
  - **`Hủy thay đổi`** (`.btn-outline-secondary` + `fa-rotate-left`): Khôi phục lại giá trị ban đầu từ server.

#### Màn hình 2.5: Đổi mật khẩu (`/change-password` — `ChangePasswordView.vue`)
- **API gọi:** `PUT /api/auth/change-password`.
- **Dùng chung cho cả 3 vai trò** (tự động bọc trong `ReaderLayout` nếu là `DOC_GIA`, hoặc `StaffLayout` nếu là `THU_THU`/`QUAN_TRI`).
- **Trường nhập:** `matKhauHienTai`, `matKhauMoi`, `xacNhanMatKhauMoi` (đều có nút ẩn/hiện mật khẩu).
- **Nút bấm:** **`Cập nhật mật khẩu`** (`.btn-primary` + `fa-key`), **`Quay lại`** (`.btn-outline-secondary`).

---

## 5. Chi tiết Giao diện 3: Nhân Viên / Thủ Thư (`THU_THU`)

Giao diện dành cho Thủ thư sử dụng **`StaffLayout`** được thiết kế sát với mẫu **Web Admin Dashboard** (ảnh tham chiếu): Sidebar tối bên trái có phân nhóm Accordion + thanh Header xanh dương phía trên + khu vực bảng dữ liệu chuẩn quản trị.

### 5.1. Khung `StaffLayout` (Cấu trúc tổng thể)

```text
+--------------------+--------------------------------------------------------------------+
|  THƯ VIỆN ADMIN    | [☰]  [↗ Xem cổng độc giả]                    [Avatar] Nguyễn An ▾  |  <- Header #3C8DBC (50px)
+--------------------+--------------------------------------------------------------------+
| [Avatar] Nguyễn An | TIÊU ĐỀ TRANG                        Trang chủ > Nhóm > Mục hiện tại|
|          ● Online  |--------------------------------------------------------------------+
| MAIN NAVIGATION    | +----------------------------------------------------------------+ |
| ▸ Tổng quan        | | [Tìm kiếm...] [Lọc 1 ▾] [Lọc 2 ▾] [↻]            [+ Thêm mới]  | |  <- Card trắng
| ▾ QUẢN LÝ DANH MỤC | |+---+------+-----------+--------------+----------+-------------+| |  <- viền trên #3C8DBC
|   • Nhà xuất bản   | ||STT| MÃ   | TÊN ...   | THÔNG TIN    |TRẠNG THÁI|   TÁC VỤ    || |  <- thead #3C8DBC
|   ● Đầu sách  ◄─── | |+---+------+-----------+--------------+----------+-------------+| |
| ▾ NGHIỆP VỤ MƯỢN   | || 1 | S001 | ...       | ...          | [Badge]  | [👁][✎][📦][×]|| |
|   • Phiếu mượn [3] | |+---+------+-----------+--------------+----------+-------------+| |
|   • Lập phiếu mượn | | Hiển thị 1–10 / 25 bản ghi                  [«] [1] [2] [3] [»]| |
|   • Khoản phạt [2] | +----------------------------------------------------------------+ |
| ▸ Quản lý Độc giả  |                                                                    |
| ▸ Nhật ký hệ thống |                                                                    |
+--------------------+--------------------------------------------------------------------+
```

#### Chi tiết các nút trên Header & Sidebar (`StaffLayout`):
1. **Khối Logo góc trái (`230px`, `#367FA9`):** Icon `fa-book-atlas` + chữ **THƯ VIỆN ADMIN** (khi thu gọn hiện icon sách căn giữa). Click về `/staff/dashboard`.
2. **Nút Hamburger (`fa-bars`):** Nằm sát phải logo. Click bật/tắt trạng thái thu gọn Sidebar (trên Mobile mở Drawer overlay). Hover đổi nền sang `#367FA9`.
3. **Nút `Xem cổng độc giả` (`fa-arrow-up-right-from-square`):** Giống nút *"Xem website"* trên ảnh mẫu. Mở `/books` (hoặc tab mới) để thủ thư kiểm tra hiển thị phía độc giả.
4. **Cụm User góc phải Header:** Avatar + `hoTenNV` + Badge vai trò (`Thủ thư` màu xanh dương nhạt). Click mở Dropdown: `Đổi mật khẩu` (`/change-password`), `Đăng xuất` (chữ đỏ).
5. **Menu Sidebar cho `THU_THU` (Phân cấp Accordion rõ ràng):**
   - **`Tổng quan (Dashboard)`** (`fa-gauge-high` → `/staff/dashboard`)
   - **`QUẢN LÝ DANH MỤC`** (`fa-layer-group` — Accordion):
     - `Nhà xuất bản` (`/staff/publishers`)
     - `Đầu sách & Tồn kho` (`/staff/books`)
   - **`NGHIỆP VỤ MƯỢN – TRẢ`** (`fa-book-open-reader` — Accordion, badge đỏ đếm `soSachQuaHan` nếu `> 0`):
     - `Danh sách phiếu mượn` (`/staff/loans`)
     - `Lập phiếu mượn mới` (`/staff/loans/create`)
     - `Quản lý khoản phạt` (`/staff/fines`, badge đỏ đếm `soKhoanPhatChuaXuLy` nếu `> 0`)
   - **`QUẢN LÝ ĐỘC GIẢ`** (`fa-users` → `/staff/readers`)
   - **`NHẬT KÝ HỆ THỐNG`** (`fa-clock-rotate-left` → `/staff/audit-logs`)
   - *(Nhóm `QUẢN TRỊ HỆ THỐNG` gồm Nhân viên & Cấu hình **ẩn hoàn toàn** với `THU_THU`.)*

---

### 5.2. Chi tiết từng Màn hình Nghiệp vụ của Thủ thư

#### Màn hình 3.1: Dashboard Tổng quan (`/staff/dashboard` — `DashboardView.vue`)
- **API gọi:** `GET /api/dashboard/summary`.
- **Hàng 1 — 4 Thẻ KPI (Info-Box / Small-Box kiểu AdminLTE):**
  1. **Tổng đầu sách & Tồn kho** (Nền xanh dương `#3C8DBC`, icon `fa-book`): Hiện `tongSoDauSach` đầu sách / `soQuyenKhaDung` quyển khả dụng. Link chân thẻ: *"Xem danh sách sách →"* (`/staff/books`).
  2. **Độc giả** (Nền xanh lá `#00A65A`, icon `fa-users`): Hiện `tongSoDocGia` độc giả (`soDocGiaBiHanChe` bị hạn chế). Link: *"Quản lý độc giả →"* (`/staff/readers`).
  3. **Sách đang mượn & Quá hạn** (Nền vàng cam `#F39C12` — chuyển đỏ `#DD4B39` nếu `soSachQuaHan > 0`, icon `fa-book-reader`): Hiện `soSachDangMuon` đang mượn / `soSachQuaHan` quá hạn. Link: *"Xem sách quá hạn →"* (`/staff/loans?tab=overdue`).
  4. **Khoản phạt chưa thu** (Nền đỏ `#DD4B39`, icon `fa-coins`): Hiện `tongTienPhatChuaThu` (VNĐ) / `soKhoanPhatChuaXuLy` khoản chưa xử lý. Link: *"Xử lý khoản phạt →"* (`/staff/fines`).
- **Hàng 2 — Thanh Thao tác nhanh (Quick Actions):**
  - Nút **`+ Lập phiếu mượn`** (`.btn-primary` + `fa-plus-circle` → `/staff/loans/create`)
  - Nút **`+ Thêm đầu sách`** (`.btn-success` + `fa-book-medical` → `/staff/books?action=create`)
  - Nút **`+ Tạo độc giả`** (`.btn-info` + `fa-user-plus` → `/staff/readers?action=create`)
  - Nút **`Làm mới số liệu`** (`.btn-outline-secondary` + `fa-rotate-right`)
- **Hàng 3 — 2 Bảng Hoạt động gần đây (chia 2 cột 6–6):**
  - Trái: **Phiếu mượn mới nhất** (`phieuMuonMoiNhat`) — click mã phiếu chuyển thẳng tới `/staff/loans/:id`.
  - Phải: **Nhật ký hệ thống gần nhất** (`nhatKyMoiNhat`) — link *"Xem tất cả"* tới `/staff/audit-logs`.

---

#### Màn hình 3.2: Quản lý Nhà xuất bản (`/staff/publishers` — `PublisherListView.vue`)
- **API gọi:** `GET /api/publishers`, `POST /api/publishers`, `PUT /api/publishers/:id`, `PATCH /api/publishers/:id/status`, `DELETE /api/publishers/:id`.
- **Thanh công cụ (Toolbar):** Ô tìm kiếm (`tuKhoa`), Dropdown lọc `trangThai` (`Tất cả`, `HOAT_DONG`, `NGUNG_HOAT_DONG`), nút **`Làm mới`** (`fa-rotate-right`), nút **`+ Thêm mới`** (`.btn-primary` bên phải).
- **Cột bảng:** `STT` | `Mã NXB (maNXB)` | `Tên nhà xuất bản (tenNXB)` | `Địa chỉ (diaChi)` | `Số đầu sách (soDauSach)` | `Trạng thái` (`StatusBadge`) | `Tác vụ`.
- **Danh sách Button & Quy tắc BR-11:**

| Nút bấm | Vị trí | Kiểu & Icon | Điều kiện hiển thị / Disabled | Hành vi |
| :--- | :--- | :--- | :--- | :--- |
| **`+ Thêm mới`** | Góc phải Toolbar | `.btn-primary` + `fa-plus` | Luôn bật | Mở Modal tạo NXB (`maNXB` tùy chọn tự sinh, `tenNXB` *, `diaChi`) |
| **Sửa** | Cột Tác vụ | `.btn-icon-sm .btn-warning` + `fa-pen-to-square` | Luôn bật | Mở Modal sửa thông tin NXB (`PUT /api/publishers/:id`) |
| **Ngừng hoạt động / Kích hoạt lại** | Cột Tác vụ | `.btn-icon-sm .btn-secondary` (`fa-ban`) hoặc `.btn-success` (`fa-circle-check`) | Đổi màu & icon động theo `trangThai` hiện tại | Mở `ConfirmModal`, gọi `PATCH /api/publishers/:id/status` |
| **Xóa** | Cột Tác vụ | `.btn-icon-sm .btn-danger` + `fa-xmark` | **Disabled khi `soDauSach > 0`** (BR-11) kèm Tooltip: *"Không thể xóa NXB đã có đầu sách tham chiếu. Hãy dùng Ngừng hoạt động."* | Mở `ConfirmModal` xác nhận xóa vật lý (`DELETE /api/publishers/:id`) |

---

#### Màn hình 3.3: Quản lý Đầu sách & Tồn kho (`/staff/books` — `BookListView.vue`)
- **API gọi:** `GET /api/books`, `POST /api/books`, `PUT /api/books/:id`, `PATCH /api/books/:id/inventory`, `PATCH /api/books/:id/status`, `DELETE /api/books/:id`.
- **Thanh công cụ:** Ô tìm kiếm (`tuKhoa`), Dropdown `nhaXuatBanId`, Dropdown `trangThaiLuuThong`, Checkbox `conSachKhaDung`, nút **`Làm mới`**, nút **`+ Thêm mới`**.
- **Cột bảng:** `STT` | `Mã sách` | `Tên sách & Tác giả` | `NXB & Năm XB` | `Đơn giá` | `Tồn kho` *(hiển thị gọn: Khả dụng `soQuyenKhaDung` / Tổng `tongSoQuyen`, kèm tooltip Đang mượn / Hư hỏng / Mất)* | `Lưu thông` (`StatusBadge`) | `Tác vụ`.
- **Danh sách Button & Tách riêng Modal (Bắt buộc theo nghiệp vụ):**

| Nút bấm | Vị trí | Kiểu & Icon | Điều kiện / Ràng buộc | Hành vi |
| :--- | :--- | :--- | :--- | :--- |
| **`+ Thêm mới`** | Toolbar phải | `.btn-primary` + `fa-plus` | NXB dropdown chỉ nạp NXB `HOAT_DONG` | Mở Modal tạo sách (`POST /api/books`) |
| **Sửa thông tin** | Cột Tác vụ | `.btn-icon-sm .btn-warning` + `fa-pen-to-square` | Luôn bật | Mở Modal **Sửa thông tin sách** (`PUT /api/books/:id`) — **không có ô sửa số lượng tồn kho** |
| **Điều chỉnh tồn kho** | Cột Tác vụ | `.btn-icon-sm .btn-info` + `fa-boxes-stacked` | Luôn bật | Mở Modal **Điều chỉnh tồn kho** (`PATCH /api/books/:id/inventory`): hiển thị `soQuyenDangMuon` (chỉ đọc), nhập `tongSoQuyen`, `soQuyenHuHong`, **bắt buộc `lyDo`** (BR-12). Kiểm tra realtime `tongSoQuyen >= soQuyenDangMuon + soQuyenHuHong` |
| **Đổi trạng thái lưu thông** | Cột Tác vụ | `.btn-icon-sm .btn-secondary` + `fa-sliders` | Luôn bật | Mở Modal nhỏ chọn `DANG_LUU_THONG` / `TAM_NGUNG` / `NGUNG_LUU_THONG` (`PATCH /api/books/:id/status`) |
| **Xóa** | Cột Tác vụ | `.btn-icon-sm .btn-danger` + `fa-xmark` | **Disabled khi `soQuyenDangMuon > 0`** (nếu có lịch sử mượn, Backend trả lỗi BR-11 → hiện Toast nhắc chuyển `NGUNG_LUU_THONG`) | Mở `ConfirmModal`, gọi `DELETE /api/books/:id` |

---

#### Màn hình 3.4: Quản lý Độc giả (`/staff/readers` — `ReaderListView.vue`)
- **API gọi:** `GET /api/readers`, `POST /api/readers`, `PUT /api/readers/:id`, `PATCH /api/readers/:id/borrowing-status`, `PATCH /api/readers/:id/account-status`, `PATCH /api/readers/:id/profile-status`, `DELETE /api/readers/:id`.
- **Thanh công cụ:** Ô tìm kiếm (`tuKhoa`), Dropdown `trangThaiQuyenMuon`, Dropdown `trangThaiHoSo`, nút **`Làm mới`**, nút **`+ Tạo độc giả`**.
- **Cột bảng:** `STT` | `Mã ĐG` | `Họ tên & SĐT` | `Tài khoản & Trạng thái TK` | `Đang mượn / Nợ phạt` | `Quyền mượn` (`StatusBadge`) | `Hồ sơ` (`StatusBadge`) | `Tác vụ`.
- **Phân biệt rõ 3 nút Trạng thái & các nút Tác vụ:**

| Nút bấm | Kiểu & Icon | Trạng thái / Điều kiện | Hành vi & Modal |
| :--- | :--- | :--- | :--- |
| **`+ Tạo độc giả`** | `.btn-primary` + `fa-user-plus` | Luôn bật | Mở Modal tạo tài khoản + hồ sơ độc giả (`POST /api/readers`) |
| **Sửa hồ sơ** | `.btn-icon-sm .btn-warning` + `fa-pen-to-square` | Luôn bật | Mở Modal sửa thông tin độc giả (`PUT /api/readers/:id`) |
| **Hạn chế / Mở quyền mượn (BR-04)** | `.btn-icon-sm .btn-warning` (`fa-book-skull` / `fa-hand`) hoặc `.btn-success` (`fa-book-open`) | Đổi màu theo `trangThaiQuyenMuon` | Mở Modal đổi `DUOC_MUON` ↔ `BI_HAN_CHE`. Nếu chuyển sang `BI_HAN_CHE`, **bắt buộc nhập `lyDoHanCheMuon`** |
| **Khóa / Mở khóa tài khoản (BR-03)** | `.btn-icon-sm .btn-danger` (`fa-lock`) hoặc `.btn-success` (`fa-lock-open`) | Đổi màu theo `taiKhoanId.trangThai` | Mở Modal đổi `HOAT_DONG` ↔ `BI_KHOA`. Nếu khóa, **bắt buộc nhập `lyDoKhoa`** (chặn đăng nhập hoàn toàn) |
| **Ngừng / Kích hoạt hồ sơ** | `.btn-icon-sm .btn-secondary` (`fa-user-slash` / `fa-user-check`) | **Disabled khi chuyển `NGUNG_HOAT_DONG` nếu `soSachDangMuon > 0` hoặc `tongTienPhatChuaTra > 0`** (kèm Tooltip giải thích) | Gọi `PATCH /api/readers/:id/profile-status` |
| **Xóa** | `.btn-icon-sm .btn-danger` + `fa-xmark` | **Disabled khi `soSachDangMuon > 0` hoặc `tongTienPhatChuaTra > 0`** | Xóa vật lý nếu chưa từng phát sinh giao dịch (BR-11) |

---

#### Màn hình 3.5: Quản lý Phiếu mượn & Tab Sách quá hạn (`/staff/loans` — `LoanListView.vue`)
- **API gọi:** `GET /api/loans`, `GET /api/loans/overdue-items`.
- **Thanh Tab ở đầu Card (hiệu ứng Active rõ ràng):**
  - **Tab 1:** `Danh sách phiếu mượn` (mặc định `active`) — Lọc theo `tuKhoa`, `trangThai` (`DANG_MO`, `HOAN_TAT`, `DA_HUY`), `tuNgay`–`denNgay`.
  - **Tab 2:** `Sách đang quá hạn` (kèm badge đỏ số cuốn quá hạn) — Hiển thị phẳng từng cuốn sách quá hạn (`maPhieuMuon`, Độc giả + SĐT, Tên sách, `hanTra`, `soNgayQuaHan` tô đỏ đậm, nút **`Xử lý trả`** nhảy thẳng tới `/staff/loans/:id`).
- **Nút trên Toolbar:** Nút **`+ Lập phiếu mượn`** (`.btn-primary` + `fa-plus` → `/staff/loans/create`), nút **`Làm mới`**.
- **Nút trên dòng bảng Phiếu mượn:**
  - **`Xem & Trả sách`** (`.btn-icon-sm .btn-info` + `fa-eye` → `/staff/loans/:id`).

---

#### Màn hình 3.6: Lập Phiếu mượn mới (`/staff/loans/create` — `LoanCreateView.vue`)
- **API gọi:** `GET /api/readers?trangThaiHoSo=HOAT_DONG`, `GET /api/books?trangThaiLuuThong=DANG_LUU_THONG&conSachKhaDung=true`, `GET /api/settings`, `POST /api/loans`.
- **Bố cục 2 cột (4 – 8):**
  - **Cột trái — Thông tin Độc giả & Ghi chú phiếu:**
    - Ô tìm & chọn Độc giả (autocomplete/select).
    - Sau khi chọn, hiện **Thẻ tóm tắt Độc giả**: `maDocGia`, Họ tên, `soSachDangMuon` / `soSachMuonToiDa`, `tongTienPhatChuaTra`, Badge `trangThaiQuyenMuon`.
    - Nếu độc giả đang `BI_HAN_CHE` hoặc còn nợ phạt hoặc đã đạt giới hạn sách mượn: Hiện hộp cảnh báo đỏ ngay trong thẻ và **disable nút `Xác nhận lập phiếu mượn`**.
    - Ô nhập `ghiChu` phiếu mượn.
  - **Cột phải — Chọn nhiều Đầu sách (Giỏ sách mượn):**
    - Ô tìm kiếm sách khả dụng (`soQuyenKhaDung > 0`), bấm nút **`+ Thêm`** (`.btn-sm .btn-success`) để đưa vào danh sách mượn. Nếu sách đã có trong giỏ, nút đổi thành **`Đã chọn`** (`disabled`, màu xám).
    - Bảng danh sách sách sẽ mượn: `Mã sách`, `Tên sách`, `Còn sẵn`, Ô chọn `hanTra` (DatePicker, mặc định để trống = lấy theo `soNgayMuonMacDinh` của thư viện), nút **`Xóa khỏi phiếu`** (`.btn-icon-sm .btn-danger` + `fa-trash`).
- **Thanh nút hành động dưới cùng:**
  - **`Quay lại danh sách`** (`.btn-outline-secondary` + `fa-arrow-left`)
  - **`Xác nhận lập phiếu mượn`** (`.btn-primary` + `fa-check`, `disabled` nếu chưa chọn độc giả hợp lệ hoặc danh sách sách rỗng; hiện spinner khi đang gửi `POST /api/loans`; thành công chuyển sang `/staff/loans/:newId`).

---

#### Màn hình 3.7: Chi tiết Phiếu mượn, Trả sách từng phần, Gia hạn & Hủy phiếu (`/staff/loans/:id` — `LoanDetailView.vue`)
- **API gọi:** `GET /api/loans/:id`, `POST /api/loans/:id/return`, `POST /api/loans/:id/extend`, `PATCH /api/loans/:id/cancel`.
- **Khối trên — Thông tin chung của Phiếu:** `maPhieuMuon`, `trangThai` (Badge lớn), Độc giả (`maDocGia`, Họ tên, SĐT), Nhân viên lập, `ngayMuon`, `ghiChu`.
  - Nút **`Quay lại`** (`.btn-outline-secondary`).
  - Nút **`Hủy phiếu mượn`** (`.btn-danger` + `fa-ban`): **Chỉ hiển thị khi** `phieuMuon.trangThai === 'DANG_MO'` **và chưa có cuốn nào được trả**. Bấm mở Modal bắt buộc nhập `lyDoHuy`.
- **Khối chính — Bảng `chiTietMuon` (Hỗ trợ Trả sách từng phần BR-08):**
  - Cột Checkbox đầu dòng (kèm Checkbox *"Chọn tất cả cuốn đang mượn"* trên header): Chỉ bật cho các cuốn đang `DANG_MUON` hoặc `QUA_HAN`.
  - Khi thủ thư tích chọn 1 hoặc nhiều cuốn:
    - Dòng đó chuyển sang trạng thái **Active Highlight** (nền `#E3F2FD`, viền trái xanh `#3C8DBC`).
    - Cột **Tình trạng khi trả** mở ra Dropdown chọn `tinhTrangKhiTra`:
      - `NGUYEN_VEN` *(mặc định)*
      - `HU_HONG_NHE` → tự động mở ô nhập `moTaHuHong` *(bắt buộc)*
      - `HU_HONG_NANG` → tự động mở ô nhập `moTaHuHong` *(bắt buộc)* & `soTienBoiThuong` *(tùy chọn, gợi ý theo cấu hình)*
      - `MAT` → tự động mở ô nhập `moTaHuHong` & `soTienBoiThuong` *(tùy chọn)*
  - **Thanh xác nhận nổi ở đáy bảng (hiện khi đã tích ít nhất 1 cuốn):**
    - Hiện số cuốn đang chọn (*"Đã chọn X cuốn để nhận trả"*), ô `ghiChu` chung, nút **`Bỏ chọn tất cả`** (`.btn-outline-secondary`) và nút **`Xác nhận trả X cuốn sách`** (`.btn-success` + `fa-check-double` → gọi `POST /api/loans/:id/return`).
  - **Nút `Gia hạn` trên từng dòng:**
    - Kiểu `.btn-sm .btn-warning` + `fa-calendar-plus`.
    - Chỉ hiển thị với cuốn đang `DANG_MUON` (chưa `QUA_HAN` và `soLanGiaHan < soLanGiaHanToiDa`).
    - Bấm mở Modal nhập số ngày gia hạn / `hanTraMoi` + `lyDo`, gọi `POST /api/loans/:id/extend`.

---

#### Màn hình 3.8: Quản lý Khoản phạt (`/staff/fines` — `FineListView.vue`)
- **API gọi:** `GET /api/fines`, `POST /api/fines/:id/pay`, `PATCH /api/fines/:id/waive`, `PATCH /api/fines/:id/cancel`.
- **Thanh công cụ:** Ô tìm kiếm (`tuKhoa`), Dropdown `trangThai` (`CHUA_THANH_TOAN`, `THANH_TOAN_MOT_PHAN`, `DA_THANH_TOAN`, `DUOC_MIEN`, `DA_HUY`), Dropdown `loaiPhat` (`TRA_TRE`, `HU_HONG`, `MAT_SACH`), nút **`Làm mới`**.
- **Cột bảng:** `STT` | `Mã phạt` | `Độc giả` | `Mã phiếu & Tên sách` | `Loại phạt` | `Tiền phạt / Đã thu / Còn nợ` | `Trạng thái` | `Tác vụ`.
- **Danh sách Button tác vụ:**

| Nút bấm | Kiểu & Icon | Điều kiện hiển thị | Hành vi & Modal |
| :--- | :--- | :--- | :--- |
| **Xem chi tiết** | `.btn-icon-sm .btn-secondary` + `fa-eye` | Luôn bật | Mở Modal xem đầy đủ lý do phạt, số ngày trễ, người xử lý, lịch sử ghi chú |
| **Thu tiền** | `.btn-icon-sm .btn-success` + `fa-money-bill-wave` | Hiện khi `trangThai` là `CHUA_THANH_TOAN` hoặc `THANH_TOAN_MOT_PHAN` | Mở Modal **Thu tiền phạt**: mặc định điền sẵn `soTienThu = soTienConNo` (cho sửa nhỏ hơn để thu 1 phần) + ô `ghiChuXuLy`. Gọi `POST /api/fines/:id/pay` |
| **Miễn phạt** | `.btn-icon-sm .btn-info` + `fa-hand-holding-heart` | Hiện khi `CHUA_THANH_TOAN` hoặc `THANH_TOAN_MOT_PHAN` | Mở Modal **bắt buộc nhập `ghiChuXuLy`**. Gọi `PATCH /api/fines/:id/waive` |
| **Hủy phạt** | `.btn-icon-sm .btn-danger` + `fa-xmark` | **Chỉ hiện khi `CHUA_THANH_TOAN` và `soTienDaThanhToan === 0`** | Mở Modal **bắt buộc nhập `ghiChuXuLy`** (dùng khi ghi nhầm phạt). Gọi `PATCH /api/fines/:id/cancel` |

---

## 6. Chi tiết Giao diện 4: Quản Trị Viên (`QUAN_TRI` — Admin)

Quản trị viên (`QUAN_TRI`) sử dụng chung khung **`StaffLayout`** và **kế thừa 100% toàn bộ màn hình, nút bấm và quyền thao tác của Thủ thư (`THU_THU`)**, đồng thời:
- Badge vai trò trên góc phải Header hiển thị **`Quản trị viên`** với màu Tím Indigo (`#605CA8`).
- Trên **Sidebar bên trái**, mở khóa thêm nhóm menu **`QUẢN TRỊ HỆ THỐNG`** (`v-if="authStore.isAdmin"`):
  - `Quản lý Nhân viên` (`fa-user-shield` → `/admin/employees`)
  - `Cấu hình Thư viện` (`fa-gears` → `/admin/settings`)
  - `Nhật ký Hệ thống` (`fa-clock-rotate-left` → `/staff/audit-logs`)

### 6.1. Màn hình 4.1: Quản lý Nhân viên (`/admin/employees` — `EmployeeListView.vue`)
- **Quyền truy cập:** Chỉ `QUAN_TRI`.
- **API gọi:** `GET /api/employees`, `POST /api/employees`, `PUT /api/employees/:id`, `PATCH /api/employees/:id/work-status`, `PATCH /api/employees/:id/account-status`, `DELETE /api/employees/:id`.
- **Thanh công cụ:** Ô tìm kiếm (`tuKhoa`), Dropdown `vaiTro` (`Tất cả`, `QUAN_TRI`, `THU_THU`), Dropdown `trangThaiLamViec` (`Tất cả`, `DANG_LAM_VIEC`, `NGHI_VIEC`), nút **`Làm mới`**, nút **`+ Thêm nhân viên`**.
- **Cột bảng:** `STT` | `MSNV` | `Họ tên & SĐT` | `Tên đăng nhập & Vai trò` (`StatusBadge` Tím/Xanh) | `Chức vụ` | `Làm việc` (`StatusBadge`) | `Tài khoản` (`StatusBadge`) | `Tác vụ`.
- **Danh sách Button & Quy tắc Tự bảo vệ Admin:**

| Nút bấm | Kiểu & Icon | Quy tắc tự bảo vệ (`isCurrentAdmin`) | Hành vi |
| :--- | :--- | :--- | :--- |
| **`+ Thêm nhân viên`** | `.btn-primary` + `fa-user-plus` | Luôn bật | Mở Modal tạo `tai_khoan` + `nhan_vien`, chọn `vaiTro` (`THU_THU` / `QUAN_TRI`) |
| **Sửa thông tin** | `.btn-icon-sm .btn-warning` + `fa-pen-to-square` | Luôn bật; nhưng nếu là chính Admin đang đăng nhập thì **khóa trường chọn `vaiTro`** (không cho tự hạ quyền xuống `THU_THU`) | Mở Modal `PUT /api/employees/:id` |
| **Chuyển nghỉ việc / Đi làm lại** | `.btn-icon-sm .btn-secondary` (`fa-user-minus`) / `.btn-success` (`fa-user-check`) | **Disabled trên dòng của chính Admin đang đăng nhập** + Tooltip *"Không thể tự chuyển nghỉ việc"* | Mở Modal nhập `lyDo` (cảnh báo: chuyển `NGHI_VIEC` sẽ **tự động khóa tài khoản đăng nhập** & ghi nhật ký BR-12) |
| **Khóa / Mở khóa tài khoản** | `.btn-icon-sm .btn-danger` (`fa-lock`) / `.btn-success` (`fa-lock-open`) | **Disabled trên dòng của chính Admin đang đăng nhập** | Mở Modal nhập `lyDoKhoa`, gọi `PATCH /api/employees/:id/account-status` |
| **Xóa** | `.btn-icon-sm .btn-danger` + `fa-xmark` | **Disabled trên dòng của chính Admin** (và Backend chặn BR-11 nếu nhân viên đã từng lập phiếu/xử lý phạt) | Mở `ConfirmModal`, gọi `DELETE /api/employees/:id` |

### 6.2. Màn hình 4.2: Cấu hình Chính sách Thư viện (`/admin/settings` — `SettingsView.vue`)
- **API gọi:** `GET /api/settings`, `PUT /api/settings` *(chỉ `QUAN_TRI` được gửi `PUT`)*.
- **Bố cục Form chia 3 Card rõ ràng:**
  1. **Chính sách Mượn & Gia hạn:** `soNgayMuonMacDinh` (ngày), `soSachMuonToiDa` (quyển), `soLanGiaHanToiDa` (lần), `soNgayGiaHanMoiLan` (ngày, có thể để trống), `soNgayNhacTraTruocHan`.
  2. **Chính sách Phạt & Bồi thường:** `tienPhatTraTreMoiNgay` (VNĐ/ngày), `tyLeBoiThuongSachMat` (hệ số, VD `1.5`), `tyLeBoiThuongSachHuHong` (hệ số, VD `1.0`), `nguongSoNgayQuaHanKhoaMuon`, Toggle `hanCheMuonKhiCoViPham` (Bật/Tắt).
  3. **Chính sách Tài khoản Độc giả:** `cachCapTaiKhoanDocGia` (Dropdown), Toggle `yeuCauXacMinhTaiKhoanDocGia`, Toggle `yeuCauDienThoaiDuyNhat`, Toggle `choPhepDatTruoc`.
- **Khối Xác nhận thay đổi (BR-12):**
  - Ô textarea **`Lý do cập nhật cấu hình (lyDo)`** — **bắt buộc nhập** để ghi vào `nhat_ky_he_thong`.
  - Hiển thị thông tin *"Cập nhật lần cuối lúc `{ngayCapNhat}`"*.
- **Nút bấm:**
  - **`Lưu cấu hình`** (`.btn-primary` + `fa-floppy-disk`): `disabled` nếu chưa sửa gì hoặc chưa nhập `lyDo`.
  - **`Khôi phục giá trị hiện tại`** (`.btn-outline-secondary` + `fa-rotate-left`).

### 6.3. Màn hình 4.3: Nhật ký Hệ thống (`/staff/audit-logs` — `AuditLogListView.vue`)
- **API gọi:** `GET /api/audit-logs`, `GET /api/audit-logs/:id`.
- **Tính chất:** Chỉ đọc (Immutable — **tuyệt đối không có nút Thêm, Sửa hay Xóa**).
- **Thanh lọc đa tiêu chí:**
  - Dropdown **`Hành động (`hanhDong`)`** (14 giá trị chuẩn: `LAP_PHIEU_MUON`, `XAC_NHAN_TRA_SACH`, `DIEU_CHINH_SO_LUONG_SACH`, `KHOA_TAI_KHOAN`, `CAP_NHAT_CAU_HINH`...).
  - Dropdown **`Đối tượng (`doiTuongCollection`)`** (`sach`, `doc_gia`, `nhan_vien`, `phieu_muon`, `khoan_phat`, `cau_hinh_thu_vien`...).
  - Dropdown **`Vai trò thực hiện`** (`QUAN_TRI`, `THU_THU`, `DOC_GIA`).
  - Khoảng ngày **`Từ ngày (tuNgay)` – `Đến ngày (denNgay)`**.
  - Ô tìm kiếm theo **`Lý do (tuKhoa)`**, nút **`Làm mới`** & **`Đặt lại bộ lọc`**.
- **Bảng Nhật ký:** `STT` | `Thời điểm` (`DD/MM/YYYY HH:mm:ss`) | `Người thực hiện & Vai trò` | `Hành động` (Badge màu theo nhóm) | `Đối tượng` | `Lý do` | `Tác vụ`.
- **Nút bấm:**
  - **`Xem chi tiết thay đổi (Diff)`** (`.btn-icon-sm .btn-info` + `fa-code-compare`): Mở Modal so sánh 2 cột **`Dữ liệu trước (duLieuTruoc)`** (nền đỏ nhạt) và **`Dữ liệu sau (duLieuSau)`** (nền xanh lá nhạt) định dạng JSON dễ đọc.

---

## 7. Hành vi Responsive & Checklist Kiểm thử UI

### 7.1. Responsive theo kích thước màn hình
- **Desktop (`>= 1200px`):** `StaffLayout` mở rộng Sidebar `230px`; `ReaderLayout` hiển thị đủ menu ngang; lưới sách `4 cột`; bảng hiển thị đầy đủ cột.
- **Tablet (`768px – 1199px`):** Sidebar tự động thu gọn về `54px` (icon-only), bấm Hamburger để bung rộng; lưới sách `2–3 cột`; thanh lọc tự động xuống dòng gọn gàng (`flex-wrap`).
- **Mobile (`< 768px`):** Sidebar ẩn hoàn toàn, bấm Hamburger trượt ra dạng Drawer có lớp nền mờ phía sau; mọi bảng bọc trong `.table-responsive` cho cuộn ngang mượt; lưới sách `1 cột`; nút trong Modal xếp chồng full-width.

### 7.2. Checklist Kiểm thử Giao diện (UI QA)
1. **Kiểm tra trạng thái Active:** Chuyển qua lại mọi mục trên Sidebar và Navbar — mục hiện tại luôn được highlight đúng, nhóm Accordion cha tự mở sẵn khi truy cập trực tiếp URL con (VD vào thẳng `/staff/books` thì nhóm `QUẢN LÝ DANH MỤC` phải tự mở và `Đầu sách & Tồn kho` ở trạng thái `active`).
2. **Kiểm tra chống Double-Submit:** Mọi nút gọi `POST` / `PUT` / `PATCH` / `DELETE` phải chuyển sang trạng thái `loading + disabled` trong lúc chờ phản hồi từ Backend.
3. **Kiểm tra phân quyền UI:** Đăng nhập `THU_THU` không thấy menu `Nhân viên` / `Cấu hình`, gõ thẳng `/admin/employees` bị chặn sang 403; đăng nhập `DOC_GIA` gõ thẳng `/staff/dashboard` bị chặn sang 403.
4. **Kiểm tra BR-03 & BR-04:** Tài khoản `BI_KHOA` không đăng nhập được và hiện rõ lý do; tài khoản `docgia02` (`BI_HAN_CHE`) đăng nhập được, thấy Banner vàng cảnh báo nhưng vẫn tra cứu và xem lịch sử mượn bình thường.
5. **Kiểm tra BR-11 & BR-12:** Nút Xóa vật lý bị disable đúng chỗ kèm Tooltip; các thao tác nhạy cảm (điều chỉnh tồn kho, khóa tài khoản, hạn chế mượn, miễn/hủy phạt, cập nhật cấu hình) đều có Modal bắt buộc nhập lý do.

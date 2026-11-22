# PLAN.md --- KẾ HOẠCH PHÁT TRIỂN WEBQUANLYMUONSACH TRONG 3 NGÀY

> **Mục đích:** Kế hoạch triển khai thực tế dành cho chủ dự án và các AI
> Agent.\
> **Dự án:** Website quản lý thư viện --- `webquanlymuonsach`\
> **Thời lượng:** 3 ngày\
> **Công nghệ đã chốt:** Vue.js, Node.js + Express.js, MongoDB\
> **Tài liệu nền tảng:** `PROJECT.md`

------------------------------------------------------------------------

## 1. Mục tiêu và nguyên tắc thực hiện

### 1.1. Mục tiêu sau 3 ngày

Hoàn thành một phiên bản MVP có thể chạy và trình diễn được, đáp ứng các
yêu cầu:

-   Có ba nhóm người dùng: Admin, Librarian và Reader.
-   Có đăng nhập, đăng xuất và phân quyền.
-   Admin và Librarian quản lý được sách, nhà xuất bản và độc giả theo
    quyền.
-   Admin quản lý được tài khoản nhân viên.
-   Nhân viên lập được phiếu mượn có nhiều sách và xác nhận trả sách.
-   Hỗ trợ trả từng phần, xác định quá hạn/trả trễ.
-   Ghi nhận sách mất, sách hư hỏng và khoản phạt ở mức cơ bản.
-   Cập nhật số lượng sách nhất quán.
-   Reader tra cứu sách và xem lịch sử mượn của chính mình.
-   Có dữ liệu demo, kiểm thử các luồng chính và tài liệu phục vụ báo
    cáo môn học.

### 1.2. Nguyên tắc ưu tiên

1.  **MVP trước:** Chỉ triển khai tính năng cần thiết để chứng minh hệ
    thống hoạt động.
2.  **Vertical Slice:** Hoàn thiện từng chức năng xuyên suốt Database →
    Backend → Frontend → Test, không làm toàn bộ Backend rồi mới làm
    Frontend.
3.  **Backend quyết định nghiệp vụ:** Mọi kiểm tra quyền, tồn kho, hạn
    trả và tiền phạt phải được thực hiện ở Backend.
4.  **Kiểm thử liên tục:** Mỗi API phải được kiểm thử trước hoặc trong
    lúc tích hợp giao diện.
5.  **Không tự suy diễn chính sách:** Những giá trị chưa được chủ dự án
    xác nhận phải đánh dấu `PENDING DECISION` và để cấu hình.
6.  **Giữ phạm vi:** Không bổ sung tính năng mới khi các chức năng P0
    chưa hoàn thành.
7.  **Có minh chứng:** Lưu ảnh chụp giao diện, kết quả Postman và dữ
    liệu kiểm thử để đưa vào báo cáo.

------------------------------------------------------------------------

## 2. Phạm vi và mức độ ưu tiên

### 2.1. P0 --- Bắt buộc hoàn thành

-   Khởi tạo frontend Vue.js, backend Express.js và kết nối MongoDB.
-   Đăng nhập, đăng xuất, xác thực và phân quyền ba vai trò.
-   Quản lý sách.
-   Quản lý nhà xuất bản.
-   Quản lý độc giả.
-   Quản lý nhân viên ở quyền Admin.
-   Lập phiếu mượn nhiều đầu sách.
-   Kiểm tra điều kiện mượn và số lượng khả dụng.
-   Trả sách toàn phần hoặc từng phần.
-   Cập nhật số lượng sách.
-   Tra cứu sách và xem lịch sử mượn của độc giả.
-   Kiểm thử luồng mượn trả chính.

### 2.2. P1 --- Nên hoàn thành nếu tiến độ cho phép

-   Tự động xác định sách quá hạn và trả trễ.
-   Tạo khoản phạt trả trễ.
-   Ghi nhận sách mất và hư hỏng.
-   Dashboard với các chỉ số cơ bản.
-   Lọc lịch sử theo ngày và trạng thái.
-   Nhật ký thao tác quan trọng.

### 2.3. P2 --- Chỉ làm khi P0 và P1 đã ổn định

-   Đặt trước sách.
-   Gia hạn trực tuyến.
-   Gửi email hoặc thông báo tự động.
-   Thanh toán trực tuyến.
-   Thống kê nâng cao.
-   Quản lý nhiều chi nhánh.

Không triển khai P2 nếu có nguy cơ ảnh hưởng đến khả năng chạy ổn định
hoặc hoàn thành báo cáo.

------------------------------------------------------------------------

## 3. Vai trò tham gia và cách phối hợp AI Agent

### 3.1. Vai trò

  -----------------------------------------------------------------------
  Người/Agent                         Trách nhiệm
  ----------------------------------- -----------------------------------
  Chủ dự án / Project Manager         Chốt yêu cầu, phân công, duyệt kết
                                      quả, tích hợp và chạy demo

  Agent Database                      Đề xuất collection, field,
                                      reference, index, seed data

  Agent Backend                       Xây dựng Express API, xác thực,
                                      phân quyền và nghiệp vụ

  Agent Frontend                      Xây dựng giao diện Vue.js và tích
                                      hợp API

  Agent QA / Documentation            Viết test case, kiểm thử, sơ đồ và
                                      hỗ trợ báo cáo
  -----------------------------------------------------------------------

Có thể dùng một Agent cho nhiều vai trò nếu công cụ hoặc thời gian hạn
chế. Không nhất thiết phải chạy tất cả Agent đồng thời.

### 3.2. Quy tắc giao việc

Mỗi task giao cho Agent phải có:

-   Mục tiêu cụ thể.
-   File hoặc module được phép chỉnh sửa.
-   Đầu vào và tài liệu cần đọc.
-   Kết quả đầu ra mong đợi.
-   Tiêu chí nghiệm thu.
-   Cách chạy và cách kiểm thử.

Agent phải báo cáo khi hoàn thành:

1.  Những file đã tạo hoặc chỉnh sửa.
2.  Chức năng đã thực hiện.
3.  Lệnh chạy và cách kiểm thử.
4.  Kết quả kiểm thử.
5.  Vấn đề còn tồn tại.
6.  Những thay đổi có thể ảnh hưởng đến module khác.

### 3.3. Quy tắc phối hợp Frontend và Backend

Trước khi tích hợp, Backend phải cung cấp `API.md` hoặc API contract,
tối thiểu gồm:

-   Endpoint và HTTP method.
-   Quyền truy cập.
-   Request parameters/body.
-   Response thành công.
-   Response lỗi và HTTP status.
-   Quy tắc validate.

Frontend không tự đoán tên field hoặc cấu trúc response. Khi contract
thay đổi, Backend phải cập nhật tài liệu và thông báo cho Frontend.

### 3.4. Quy tắc Git

-   Dùng nhánh `main` cho phiên bản ổn định.
-   Mỗi Agent làm trên nhánh riêng hoặc phạm vi file riêng.
-   Không để nhiều Agent cùng sửa một file quan trọng nếu chưa thống
    nhất.
-   Commit theo chức năng nhỏ, thông điệp rõ ràng.
-   Chỉ merge sau khi kiểm tra ứng dụng vẫn chạy.
-   Không commit `.env`, mật khẩu, token hoặc dữ liệu nhạy cảm.

------------------------------------------------------------------------

## 4. Kế hoạch chi tiết theo ngày

Thời gian dưới đây là ước lượng để phân bổ công việc, có thể điều chỉnh
theo tốc độ thực tế. Ưu tiên hoàn thành tiêu chí nghiệm thu hơn là cố
bám giờ tuyệt đối.

# NGÀY 1 --- PHÂN TÍCH, THIẾT KẾ VÀ NỀN TẢNG

**Mục tiêu cuối ngày:** Dự án chạy được, kết nối MongoDB, đăng nhập và
phân quyền hoạt động, các chức năng CRUD cốt lõi có thể sử dụng.

### Task D1-01 --- Chốt yêu cầu và chính sách nghiệp vụ

**Phụ trách:** Chủ dự án + Agent QA/Documentation

Công việc: - \[ \] Đọc và thống nhất `PROJECT.md`. - \[ \] Chốt ba vai
trò Admin, Librarian, Reader. - \[ \] Xác định chức năng P0, P1, P2. -
\[ \] Xác nhận hoặc đánh dấu chờ các chính sách: thời hạn mượn, số sách
tối đa, mức phạt, gia hạn, ngưỡng hạn chế mượn. - \[ \] Không để Agent
tự đặt các chính sách chưa được xác nhận.

**Đầu ra:** `PROJECT.md` được cập nhật và phạm vi MVP được đóng băng.

**Nghiệm thu:** Mọi Agent hiểu cùng một phạm vi và cùng một bộ quy tắc
nghiệp vụ.

### Task D1-02 --- Thiết kế MongoDB

**Phụ trách:** Agent Database

Công việc: - \[ \] Thiết kế `users`. - \[ \] Thiết kế `readers`. - \[ \]
Thiết kế `employees`. - \[ \] Thiết kế `books`. - \[ \] Thiết kế
`publishers`. - \[ \] Thiết kế `loanReceipts` và chi tiết sách mượn. -
\[ \] Đề xuất `fines`, `auditLogs` nếu kịp triển khai. - \[ \] Xác định
field bắt buộc, kiểu dữ liệu, enum và reference. - \[ \] Xác định unique
index và index phục vụ tìm kiếm. - \[ \] Tạo dữ liệu mẫu cho ba vai trò
và các nghiệp vụ chính.

**Đầu ra:** Tài liệu mô hình dữ liệu, Model Mongoose (nếu dùng
Mongoose), script seed.

**Nghiệm thu:** - Tạo được dữ liệu mẫu. - Tài khoản liên kết đúng hồ
sơ. - Phiếu mượn biểu diễn được nhiều sách. - Mỗi chi tiết mượn có hạn
trả, ngày trả và tình trạng riêng.

### Task D1-03 --- Khởi tạo Backend Express.js

**Phụ trách:** Agent Backend

Công việc: - \[ \] Khởi tạo Node.js project. - \[ \] Cài đặt Express và
thư viện cần thiết. - \[ \] Tạo cấu trúc config, models, routes,
controllers, services, middlewares, validators. - \[ \] Kết nối MongoDB
bằng biến môi trường. - \[ \] Cấu hình CORS, JSON parser và xử lý lỗi
tập trung. - \[ \] Tạo API health check. - \[ \] Tạo `.env.example`.

**Đầu ra:** Backend chạy được và kết nối MongoDB.

**Nghiệm thu:** API health check trả về thành công; Backend khởi động
không có lỗi kết nối.

### Task D1-04 --- Khởi tạo Frontend Vue.js

**Phụ trách:** Agent Frontend

Công việc: - \[ \] Khởi tạo Vue.js project. - \[ \] Cấu hình Vue
Router. - \[ \] Tạo layout đăng nhập và layout chính. - \[ \] Tạo cấu
trúc views, components, services, stores và utils. - \[ \] Cấu hình địa
chỉ Backend qua biến môi trường. - \[ \] Tạo trang lỗi 403, 404 hoặc
thông báo truy cập bị từ chối ở mức cơ bản.

**Đầu ra:** Frontend chạy được, có khung giao diện và điều hướng.

**Nghiệm thu:** Có thể mở ứng dụng, chuyển trang và gọi thử API health
check.

### Task D1-05 --- Xác thực và phân quyền

**Phụ trách:** Agent Backend + Agent Frontend

Công việc: - \[ \] API đăng nhập. - \[ \] API đăng xuất hoặc cơ chế vô
hiệu hóa phiên/token phù hợp. - \[ \] Băm mật khẩu trước khi lưu. - \[
\] Middleware xác thực. - \[ \] Middleware phân quyền theo role. - \[ \]
Giao diện đăng nhập. - \[ \] Lưu và khôi phục trạng thái đăng nhập an
toàn theo phương án đã chọn. - \[ \] Điều hướng theo vai trò. - \[ \]
Đăng ký hoặc tạo tài khoản Reader theo chính sách đã chốt.

**Đầu ra:** Đăng nhập và phân quyền ba vai trò.

**Nghiệm thu:** - Tài khoản hợp lệ đăng nhập được. - Sai mật khẩu bị từ
chối. - Tài khoản bị khóa không truy cập được. - Reader không gọi được
API quản trị. - Backend kiểm tra quyền độc lập với giao diện.

### Task D1-06 --- CRUD dữ liệu thư viện

**Phụ trách:** Agent Backend + Agent Frontend

Thứ tự triển khai: 1. Nhà xuất bản. 2. Sách. 3. Độc giả. 4. Nhân viên
(Admin).

Công việc: - \[ \] Tạo API thêm, xem, cập nhật và ngừng hoạt động. - \[
\] Tạo form và bảng dữ liệu. - \[ \] Validate dữ liệu ở Backend. - \[ \]
Tìm kiếm và phân trang cơ bản. - \[ \] Chặn xóa dữ liệu đang được giao
dịch tham chiếu.

**Đầu ra:** Các màn hình CRUD cơ bản hoạt động với MongoDB.

**Nghiệm thu cuối ngày 1:** - \[ \] Frontend và Backend chạy độc lập. -
\[ \] MongoDB kết nối thành công. - \[ \] Đăng nhập và phân quyền hoạt
động. - \[ \] CRUD sách, nhà xuất bản và độc giả hoạt động. - \[ \]
Admin quản lý được nhân viên. - \[ \] Các API chính đã được kiểm thử
bằng Postman.

------------------------------------------------------------------------

# NGÀY 2 --- NGHIỆP VỤ MƯỢN, TRẢ VÀ NGOẠI LỆ

**Mục tiêu cuối ngày:** Có thể thực hiện trọn vẹn luồng mượn và trả
sách; dữ liệu giao dịch và số lượng sách nhất quán.

### Task D2-01 --- Thiết kế và hoàn thiện API contract

**Phụ trách:** Agent Backend

Công việc: - \[ \] Định nghĩa API lập phiếu mượn. - \[ \] Định nghĩa API
xem danh sách và chi tiết phiếu. - \[ \] Định nghĩa API trả một hoặc
nhiều chi tiết sách. - \[ \] Định nghĩa API xem lịch sử mượn. - \[ \]
Định nghĩa API xử lý mất/hư hỏng. - \[ \] Ghi rõ quyền, request,
response và mã lỗi.

**Đầu ra:** `docs/API.md`.

**Nghiệm thu:** Agent Frontend có thể tích hợp mà không cần tự suy đoán
cấu trúc API.

### Task D2-02 --- Lập phiếu mượn

**Phụ trách:** Agent Backend

Công việc: - \[ \] Tìm độc giả. - \[ \] Chọn một hoặc nhiều sách. - \[
\] Kiểm tra độc giả tồn tại và được phép mượn. - \[ \] Kiểm tra tài
khoản và quyền mượn. - \[ \] Kiểm tra số lượng khả dụng. - \[ \] Kiểm
tra giới hạn số sách theo chính sách. - \[ \] Tạo phiếu và chi tiết
mượn. - \[ \] Ghi nhận nhân viên lập phiếu và thời điểm. - \[ \] Cập
nhật số lượng sách nhất quán.

**Nghiệm thu:** - Mượn hợp lệ tạo đúng phiếu. - Không cho mượn sách
hết. - Không cho mượn khi độc giả bị hạn chế. - Không cho vượt giới
hạn. - Không để tồn kho âm hoặc tạo phiếu một phần khi thao tác thất
bại.

### Task D2-03 --- Trả sách toàn phần và từng phần

**Phụ trách:** Agent Backend

Công việc: - \[ \] Tìm phiếu và các chi tiết chưa hoàn tất. - \[ \] Cho
phép chọn sách cần trả. - \[ \] Ghi nhận ngày trả thực tế. - \[ \] Ghi
nhận nhân viên xác nhận. - \[ \] Cập nhật trạng thái từng chi tiết. - \[
\] Cập nhật trạng thái phiếu. - \[ \] Cập nhật số lượng khả dụng theo
tình trạng sách.

**Nghiệm thu:** - Trả một cuốn không làm đóng phiếu nếu còn cuốn khác. -
Trả hết các cuốn hợp lệ làm phiếu hoàn tất. - Không thể xác nhận trả
trùng một chi tiết. - Số lượng sách được cập nhật đúng.

### Task D2-04 --- Quá hạn và tiền phạt

**Phụ trách:** Agent Backend

Công việc: - \[ \] Lưu hạn trả riêng cho từng chi tiết sách. - \[ \] Xác
định sách đang quá hạn nếu chưa trả và đã qua hạn. - \[ \] Xác định trả
trễ nếu ngày trả thực tế sau hạn. - \[ \] Tính số ngày trễ theo chính
sách đã chốt. - \[ \] Tạo khoản phạt nếu áp dụng. - \[ \] Hiển thị trạng
thái và khoản phạt cho nhân viên. - \[ \] Cho Reader xem thông tin của
chính mình.

**Nghiệm thu:** - Trả đúng hạn không phát sinh phạt trễ. - Trả sau hạn
tính đúng số ngày trễ. - Sách chưa trả quá hạn vẫn là sách đang mượn. -
Không tự đánh dấu khoản phạt đã thanh toán.

### Task D2-05 --- Sách mất và hư hỏng

**Phụ trách:** Agent Backend

Công việc: - \[ \] Ghi nhận sách hư hỏng và mô tả tình trạng. - \[ \]
Ghi nhận sách mất. - \[ \] Không cộng sách mất/hư hỏng vào số lượng khả
dụng như sách tốt. - \[ \] Tạo khoản bồi thường nếu chính sách yêu
cầu. - \[ \] Lưu nhân viên xử lý và thời điểm. - \[ \] Giữ lại lịch sử
giao dịch.

**Nghiệm thu:** Trạng thái sách và số lượng khả dụng phản ánh đúng tình
trạng thực tế.

### Task D2-06 --- Giao diện nghiệp vụ

**Phụ trách:** Agent Frontend

Công việc: - \[ \] Trang lập phiếu mượn. - \[ \] Trang danh sách phiếu
mượn. - \[ \] Trang chi tiết phiếu. - \[ \] Form xác nhận trả từng
cuốn. - \[ \] Hiển thị hạn trả và cảnh báo quá hạn. - \[ \] Hiển thị
tình trạng mất/hư hỏng và khoản phạt. - \[ \] Trang lịch sử của Reader.

**Nghiệm thu:** Có thể thực hiện nghiệp vụ từ giao diện mà không cần
thao tác trực tiếp trong MongoDB.

### Task D2-07 --- Kiểm thử tích hợp nghiệp vụ

**Phụ trách:** Agent QA + Chủ dự án

Các kịch bản tối thiểu: - \[ \] Mượn sách thành công. - \[ \] Mượn sách
khi hết số lượng. - \[ \] Độc giả bị hạn chế mượn. - \[ \] Vượt giới hạn
số sách. - \[ \] Trả đúng hạn. - \[ \] Trả trễ. - \[ \] Trả từng phần. -
\[ \] Trả sách hư hỏng. - \[ \] Ghi nhận sách mất. - \[ \] Reader cố xem
lịch sử người khác. - \[ \] Nhân viên cố truy cập chức năng Admin. - \[
\] Gửi yêu cầu trả trùng hoặc lập phiếu trùng.

**Nghiệm thu cuối ngày 2:** - \[ \] Luồng mượn và trả chạy được từ giao
diện. - \[ \] Hỗ trợ trả từng phần. - \[ \] Xử lý được quá hạn/trả trễ
theo chính sách đã xác nhận. - \[ \] Số lượng sách không bị sai lệch. -
\[ \] Có kết quả kiểm thử các trường hợp ngoại lệ quan trọng.

------------------------------------------------------------------------

# NGÀY 3 --- HOÀN THIỆN, KIỂM THỬ VÀ BÁO CÁO

**Mục tiêu cuối ngày:** Hệ thống ổn định để trình diễn, có dữ liệu mẫu,
tài liệu kỹ thuật và báo cáo môn học.

### Task D3-01 --- Hoàn thiện giao diện

**Phụ trách:** Agent Frontend

Công việc: - \[ \] Dashboard Admin. - \[ \] Dashboard Librarian. - \[ \]
Trang tra cứu sách Reader. - \[ \] Trang hồ sơ cá nhân. - \[ \] Trang
lịch sử mượn. - \[ \] Chuẩn hóa màu sắc, nút, bảng, form và thông báo. -
\[ \] Bổ sung loading, empty state và error state. - \[ \] Kiểm tra giao
diện trên kích thước màn hình phổ biến.

**Nghiệm thu:** Các luồng quan trọng dễ thao tác, không có trang chính
bị lỗi hoặc để trống.

### Task D3-02 --- Dashboard và thống kê cơ bản

**Phụ trách:** Agent Backend + Agent Frontend

Ưu tiên: - \[ \] Tổng số đầu sách hoặc bản sách. - \[ \] Tổng số độc
giả. - \[ \] Số sách đang được mượn. - \[ \] Số sách quá hạn. - \[ \] Số
phiếu mượn đang mở. - \[ \] Số khoản phạt chưa xử lý (nếu đã triển khai
fines).

Không dành quá nhiều thời gian cho biểu đồ nâng cao.

### Task D3-03 --- Kiểm thử hồi quy

**Phụ trách:** Agent QA + Chủ dự án

Công việc: - \[ \] Chạy lại kiểm thử đăng nhập và phân quyền. - \[ \]
Chạy lại CRUD. - \[ \] Chạy lại toàn bộ luồng mượn trả. - \[ \] Kiểm tra
dữ liệu trong MongoDB. - \[ \] Kiểm tra các trường hợp lỗi API. - \[ \]
Kiểm tra không có dữ liệu demo nhạy cảm. - \[ \] Sửa các lỗi ảnh hưởng
đến luồng trình diễn.

**Nguyên tắc:** Ưu tiên sửa lỗi làm ứng dụng không chạy, sai quyền, sai
tồn kho hoặc sai trạng thái giao dịch. Không dành thời gian cuối dự án
cho thay đổi thẩm mỹ lớn.

### Task D3-04 --- Chuẩn bị dữ liệu demo

**Phụ trách:** Agent Database + Chủ dự án

Công việc: - \[ \] Tạo tài khoản demo cho Admin. - \[ \] Tạo tài khoản
demo cho Librarian. - \[ \] Tạo một số tài khoản Reader. - \[ \] Tạo nhà
xuất bản và sách mẫu. - \[ \] Tạo độc giả mẫu. - \[ \] Chuẩn bị dữ liệu
cho các tình huống: đang mượn, đã trả, quá hạn, mất/hư hỏng nếu có. - \[
\] Ghi tài khoản demo vào tài liệu nội bộ hoặc báo cáo theo cách an
toàn.

**Nghiệm thu:** Có thể trình diễn nhanh các vai trò và các tình huống
nghiệp vụ.

### Task D3-05 --- Hoàn thiện tài liệu và báo cáo

**Phụ trách:** Agent QA/Documentation + Chủ dự án

Công việc: - \[ \] Cập nhật `PROJECT.md`. - \[ \] Hoàn thiện `API.md`. -
\[ \] Hoàn thiện `TEST_CASES.md`. - \[ \] Vẽ Use Case tổng quát và các
Use Case chính. - \[ \] Vẽ mô hình dữ liệu/ERD hoặc sơ đồ collection
MongoDB. - \[ \] Vẽ kiến trúc Frontend -- Backend -- Database. - \[ \]
Chụp ảnh giao diện thật. - \[ \] Viết mô tả chức năng và quy trình
nghiệp vụ. - \[ \] Trình bày kết quả kiểm thử. - \[ \] Nêu hạn chế và
hướng phát triển. - \[ \] Kiểm tra mục lục, đánh số hình, caption và
định dạng Word.

**Nghiệm thu:** Báo cáo phản ánh đúng chức năng thực tế đã hoàn thành;
không đưa ảnh hoặc chức năng chưa tồn tại vào phần kết quả.

### Task D3-06 --- Bàn giao và diễn tập

**Phụ trách:** Chủ dự án

Công việc: - \[ \] Kiểm tra README. - \[ \] Kiểm tra `.env.example`. -
\[ \] Kiểm tra lệnh cài đặt và chạy cả hai ứng dụng. - \[ \] Kiểm tra
script seed. - \[ \] Kiểm tra GitHub đã có mã nguồn mới nhất. - \[ \]
Chạy thử trên môi trường sạch nếu có thể. - \[ \] Diễn tập trình diễn
theo kịch bản. - \[ \] Chuẩn bị phương án dự phòng nếu mạng hoặc dịch vụ
ngoài gặp sự cố.

**Nghiệm thu cuối ngày 3:** Ứng dụng có thể khởi động theo hướng dẫn, dữ
liệu demo sẵn sàng và báo cáo có đủ minh chứng.

------------------------------------------------------------------------

## 5. Kịch bản trình diễn bắt buộc

Nên chuẩn bị một kịch bản ngắn, có thể trình bày trong khoảng 5--10
phút:

1.  Đăng nhập Admin và giới thiệu dashboard.
2.  Quản lý một nhà xuất bản và một đầu sách.
3.  Đăng nhập Librarian.
4.  Tìm độc giả và lập phiếu mượn hai cuốn sách.
5.  Cho thấy số lượng khả dụng thay đổi.
6.  Trả một cuốn và chứng minh phiếu vẫn còn mở.
7.  Trả cuốn còn lại hoặc minh họa tình huống trả trễ.
8.  Hiển thị lịch sử giao dịch và khoản phạt (nếu có).
9.  Đăng nhập Reader.
10. Tra cứu sách và xem lịch sử của chính mình.
11. Thử truy cập trái quyền để chứng minh phân quyền.

Không nên trình diễn các chức năng chưa được kiểm thử ổn định.

------------------------------------------------------------------------

## 6. Quy trình phát triển cho từng chức năng

Áp dụng quy trình sau cho từng module:

1.  **Phân tích:** xác định actor, luồng chính, điều kiện trước/sau và
    ngoại lệ.
2.  **Thiết kế dữ liệu:** xác định collection, field, reference, index
    và trạng thái.
3.  **Thiết kế API:** thống nhất endpoint, request, response và lỗi.
4.  **Backend:** triển khai model, validation, service, controller,
    route và middleware.
5.  **Test API:** kiểm thử bằng Postman.
6.  **Frontend:** xây giao diện theo API contract.
7.  **Integration Test:** thao tác trên giao diện và kiểm tra dữ liệu
    MongoDB.
8.  **Documentation:** cập nhật tài liệu, test case và ảnh minh chứng.

Thứ tự module khuyến nghị:

1.  Authentication và Authorization.
2.  Publishers.
3.  Books.
4.  Readers và Employees.
5.  Loan Receipts.
6.  Return Processing.
7.  Overdue và Fines.
8.  Reader History.
9.  Dashboard.

Không nên đợi tất cả API hoàn tất mới bắt đầu tích hợp giao diện.

------------------------------------------------------------------------

## 7. Tiêu chí nghiệm thu toàn dự án

### 7.1. Chức năng

-   [ ] Ba vai trò đăng nhập và truy cập đúng quyền.
-   [ ] Admin quản lý nhân viên.
-   [ ] Admin/Librarian quản lý sách, nhà xuất bản và độc giả.
-   [ ] Reader tra cứu sách và xem lịch sử cá nhân.
-   [ ] Lập phiếu mượn nhiều sách.
-   [ ] Trả sách toàn phần và từng phần.
-   [ ] Phân biệt đang mượn, quá hạn, trả đúng hạn và trả trễ.
-   [ ] Ghi nhận sách mất/hư hỏng nếu đã triển khai.
-   [ ] Số lượng khả dụng cập nhật đúng.

### 7.2. Kỹ thuật

-   [ ] Frontend Vue.js khởi động thành công.
-   [ ] Backend Express.js khởi động thành công.
-   [ ] MongoDB kết nối thành công.
-   [ ] API có xác thực và phân quyền ở Backend.
-   [ ] Không lưu mật khẩu dạng văn bản thuần.
-   [ ] Không để lộ biến môi trường hoặc secret.
-   [ ] Có xử lý lỗi tập trung.
-   [ ] Có `.env.example` và README.

### 7.3. Báo cáo

-   [ ] Có mô tả bài toán và mục tiêu.
-   [ ] Có tác nhân và yêu cầu chức năng.
-   [ ] Có Use Case và mô hình dữ liệu.
-   [ ] Có mô tả kiến trúc và công nghệ.
-   [ ] Có ảnh giao diện thực tế.
-   [ ] Có test case và kết quả kiểm thử.
-   [ ] Có kết luận, hạn chế và hướng phát triển.

------------------------------------------------------------------------

## 8. Rủi ro và phương án xử lý

  -----------------------------------------------------------------------
  Rủi ro                  Tác động                Cách xử lý
  ----------------------- ----------------------- -----------------------
  Agent hiểu khác nhau về Chức năng không đồng    Dùng `PROJECT.md`, yêu
  nghiệp vụ               nhất                    cầu xác nhận trước khi
                                                  code

  Frontend và Backend     Mất thời gian tích hợp  Chốt `API.md` trước khi
  lệch API                                        làm giao diện chức năng

  Sửa trùng file giữa     Xung đột mã nguồn       Chia module/file và
  Agent                                           dùng Git branch

  Phát sinh quá nhiều     Trễ deadline            Giữ P0 trước, hoãn P2
  tính năng                                       

  Sai số lượng khi mượn   Dữ liệu không nhất quán Kiểm tra tồn kho ở
  đồng thời                                       Backend, dùng
                                                  transaction/cơ chế
                                                  atomic phù hợp

  Chính sách phạt chưa    Logic sai yêu cầu       Để cấu hình và đánh dấu
  chốt                                            `PENDING DECISION`

  Lỗi tích hợp vào ngày   Không demo được         Tích hợp liên tục từ
  cuối                                            ngày 1

  Thiếu ảnh và minh chứng Báo cáo yếu             Chụp ảnh và lưu test
                                                  evidence ngay khi hoàn
                                                  thành module
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 9. Cấu trúc thư mục và tài liệu dự kiến

``` text
webquanlymuonsach/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── views/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
│
├── database/
│   └── seed/
│
├── docs/
│   ├── API.md
│   ├── TEST_CASES.md
│   └── diagrams/
│
├── PROJECT.md
├── PLAN.md
├── README.md
└── .gitignore
```

------------------------------------------------------------------------

## 10. Báo cáo tiến độ cuối mỗi ngày

Mỗi Agent hoặc người phụ trách cần cập nhật theo mẫu:

``` text
## Daily Progress — Day N

### Completed
- ...

### Files Changed
- ...

### Tests
- Test:
- Result:

### Issues / Blockers
- ...

### Pending Tasks
- ...

### Notes for Other Agents
- ...
```

Chủ dự án tổng hợp tiến độ, quyết định task tiếp theo và điều chỉnh phạm
vi nếu cần.

------------------------------------------------------------------------

## 11. Hướng dẫn bắt đầu

Thứ tự hành động ngay khi bắt đầu dự án:

1.  Đặt `PROJECT.md` và `PLAN.md` ở thư mục gốc repository.
2.  Chốt các chính sách đang `PENDING DECISION`.
3.  Tạo repository và cấu trúc frontend/backend.
4.  Giao Agent Database thiết kế dữ liệu.
5.  Giao Agent Backend khởi tạo Express và kết nối MongoDB.
6.  Giao Agent Frontend khởi tạo Vue và layout cơ bản.
7.  Tích hợp đăng nhập sớm để kiểm chứng kiến trúc.
8.  Tiếp tục theo thứ tự module trong kế hoạch.

**Nguyên tắc kết thúc:** Ưu tiên một hệ thống nhỏ nhưng chạy xuyên suốt,
dữ liệu đúng, quyền đúng và có thể trình diễn. Không đánh đổi tính đúng
đắn của nghiệp vụ mượn trả để lấy số lượng tính năng hoặc giao diện.

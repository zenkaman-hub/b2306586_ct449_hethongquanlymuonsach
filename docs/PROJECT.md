# PROJECT.md --- WEBQUANLYMUONSACH

> **Tài liệu định hướng chung dành cho các AI Agent và thành viên phát
> triển**
>
> Phiên bản: 1.0\
> Trạng thái: Đặc tả nền tảng --- một số chính sách nghiệp vụ cần chủ dự
> án xác nhận\
> Ngôn ngữ tài liệu: Tiếng Việt

------------------------------------------------------------------------

## 1. Tổng quan dự án

### 1.1. Tên dự án

**WEBQUANLYMUONSACH --- Website quản lý thư viện và nghiệp vụ mượn trả
sách.**

### 1.2. Mục tiêu

Xây dựng một ứng dụng web hỗ trợ thư viện quản lý tập trung thông tin
sách, nhà xuất bản, độc giả, nhân viên và toàn bộ vòng đời giao dịch
mượn trả. Hệ thống cung cấp giao diện nghiệp vụ cho quản trị viên và
nhân viên, đồng thời cho phép độc giả có tài khoản riêng để tra cứu sách
và theo dõi hoạt động mượn của bản thân.

Mục tiêu chính:

-   Tin học hóa quy trình quản lý sách và mượn trả.
-   Hạn chế sai sót khi cập nhật số lượng và trạng thái sách.
-   Theo dõi hạn trả, sách quá hạn, sách mất hoặc hư hỏng.
-   Quản lý hồ sơ và tài khoản theo vai trò.
-   Cung cấp dữ liệu phục vụ tra cứu, thống kê và quản lý.

### 1.3. Phạm vi phiên bản nền tảng

Bao gồm:

-   Đăng ký, đăng nhập, đăng xuất và đổi mật khẩu.
-   Phân quyền theo ba vai trò.
-   Quản lý độc giả, nhân viên, sách và nhà xuất bản.
-   Lập phiếu mượn có thể chứa nhiều đầu sách.
-   Trả toàn bộ hoặc trả từng phần sách trong phiếu.
-   Theo dõi hạn trả, quá hạn, tiền phạt và vi phạm.
-   Ghi nhận sách hư hỏng hoặc mất.
-   Tra cứu sách và xem lịch sử mượn của độc giả.
-   Thống kê hoạt động thư viện.

Không mặc định nằm trong phạm vi phiên bản đầu tiên: quản lý nhiều chi
nhánh, thanh toán trực tuyến, RFID, liên thông thư viện và tích hợp cổng
thanh toán. Các tính năng mở rộng như đặt trước sách chỉ được triển khai
sau khi chủ dự án xác nhận.

------------------------------------------------------------------------

## 2. Công nghệ và định hướng kiến trúc

  Thành phần             Công nghệ
  ---------------------- ----------------------
  Frontend               Vue.js
  Backend                Node.js + Express.js
  Database               MongoDB
  Giao tiếp              RESTful API
  Công cụ kiểm thử API   Postman
  IDE                    Visual Studio Code
  Quản lý mã nguồn       Git / GitHub

### 2.1. Trách nhiệm từng phần

**Vue.js** - Hiển thị giao diện theo vai trò người dùng. - Gọi REST API
và hiển thị dữ liệu do Backend trả về. - Kiểm tra dữ liệu đầu vào ở mức
giao diện để hỗ trợ trải nghiệm; không thay thế kiểm tra nghiệp vụ phía
Backend. - Ẩn hoặc khóa thao tác không thuộc quyền người dùng, nhưng
không được xem đây là cơ chế bảo mật duy nhất.

**Express.js** - Cung cấp API cho Frontend. - Xác thực danh tính và phân
quyền. - Kiểm tra dữ liệu đầu vào và thực thi quy tắc nghiệp vụ. - Điều
phối thao tác đọc/ghi MongoDB. - Đảm bảo các thay đổi liên quan đến mượn
trả và số lượng sách được thực hiện nhất quán.

**MongoDB** - Lưu trữ tài khoản, hồ sơ, sách, nhà xuất bản, phiếu mượn,
chi tiết mượn, khoản phạt và lịch sử nghiệp vụ. - Dùng ObjectId hoặc mã
định danh phù hợp cho các tài liệu. - Tạo unique index cho các trường
cần duy nhất. - Cân nhắc transaction khi một nghiệp vụ cập nhật nhiều
collection và MongoDB deployment hỗ trợ transaction.

### 2.2. Nguyên tắc kiến trúc

-   Tách Frontend và Backend.
-   Backend là nơi quyết định cuối cùng về quyền truy cập và tính hợp lệ
    của nghiệp vụ.
-   Không đặt quy tắc quan trọng chỉ ở Vue.js.
-   API trả về cấu trúc lỗi nhất quán, có mã lỗi và thông báo dễ hiểu.
-   Không lưu mật khẩu dạng văn bản thuần.
-   Không xóa vật lý dữ liệu đã tham gia giao dịch quan trọng; ưu tiên
    trạng thái ngừng hoạt động hoặc lưu trữ.
-   Ghi nhận người thực hiện và thời điểm đối với thao tác nghiệp vụ
    quan trọng.

------------------------------------------------------------------------

## 3. Tác nhân và phân quyền

Hệ thống có đúng ba nhóm người dùng:

### 3.1. Admin --- Quản trị viên

Có quyền quản trị hệ thống:

-   Đăng nhập, đăng xuất, đổi mật khẩu.
-   Tạo, cập nhật, khóa và mở khóa tài khoản nhân viên.
-   Quản lý hồ sơ và tài khoản độc giả.
-   Quản lý sách và nhà xuất bản.
-   Thực hiện hoặc giám sát nghiệp vụ mượn trả.
-   Xem toàn bộ giao dịch, vi phạm và thống kê.
-   Quản lý các chính sách thư viện khi chức năng cấu hình được triển
    khai.

### 3.2. Librarian --- Nhân viên thư viện

Thực hiện nghiệp vụ hằng ngày:

-   Đăng nhập, đăng xuất, đổi mật khẩu.
-   Quản lý hồ sơ độc giả.
-   Quản lý sách và nhà xuất bản.
-   Lập phiếu mượn và xác nhận trả sách.
-   Ghi nhận tình trạng sách khi trả.
-   Theo dõi sách quá hạn, sách mất, sách hư hỏng và khoản phạt.
-   Xem lịch sử giao dịch và báo cáo nghiệp vụ.

Nhân viên không được quản lý tài khoản nhân viên hoặc thay đổi cấu hình
quản trị dành riêng cho Admin.

### 3.3. Reader --- Độc giả

Mỗi độc giả có tài khoản riêng, liên kết với một hồ sơ độc giả:

-   Đăng ký và đăng nhập.
-   Đăng xuất, đổi mật khẩu.
-   Xem và cập nhật các thông tin cá nhân được cho phép.
-   Tìm kiếm, xem danh sách và chi tiết sách.
-   Xem tình trạng sách.
-   Xem lịch sử mượn trả của chính mình.
-   Theo dõi hạn trả, trạng thái quá hạn và khoản phạt của bản thân.

Độc giả không được tự xác nhận mượn/trả, không được xem hồ sơ hoặc lịch
sử của độc giả khác. Nếu bổ sung chức năng yêu cầu gia hạn hoặc đặt
trước, đây là yêu cầu gửi đến thư viện chứ không tự động tạo giao dịch
mượn.

### 3.4. Ma trận quyền cơ bản

  Chức năng               Admin   Librarian             Reader
  ---------------------- ------- ----------- -----------------------------
  Đăng nhập/đăng xuất       ✓         ✓                    ✓
  Quản lý nhân viên         ✓        ---                  ---
  Quản lý độc giả           ✓         ✓             Hồ sơ bản thân
  Quản lý sách              ✓         ✓                 Chỉ xem
  Quản lý nhà xuất bản      ✓         ✓       Chỉ xem thông tin liên quan
  Lập phiếu mượn            ✓         ✓                   ---
  Xác nhận trả sách         ✓         ✓                   ---
  Ghi nhận mất/hư hỏng      ✓         ✓                   ---
  Xem tất cả giao dịch      ✓         ✓                   ---
  Xem lịch sử cá nhân       ✓         ✓              Chỉ bản thân
  Xem thống kê              ✓         ✓                   ---
  Cấu hình chính sách       ✓        ---                  ---

Backend phải kiểm tra quyền trên từng API. Không được dựa vào việc ẩn
nút trên giao diện để bảo vệ dữ liệu.

------------------------------------------------------------------------

## 4. Các nhóm dữ liệu nghiệp vụ

Đề bài cơ sở dữ liệu ban đầu xác định năm thực thể:

1.  **DocGia**: `MaDocGia`, `HoLot`, `Ten`, `NgaySinh`, `Phai`,
    `DiaChi`, `DienThoai`.
2.  **Sach**: `MaSach`, `TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`,
    `MaNXB`, `NguonGoc/TacGia`.
3.  **NhaXuatBan**: `MaNXB`, `TenNXB`, `DiaChi`.
4.  **TheoDoiMuonSach**: `MaDocGia`, `MaSach`, `NgayMuon`, `NgayTra`.
5.  **NhanVien**: `MSNV`, `HoTenNV`, `Password`, `Chucvu`, `Diachi`,
    `SoDienThoai`.

Dự án dùng MongoDB và mở rộng mô hình trên để đáp ứng nghiệp vụ thực tế.
Các nhóm collection dự kiến:

  -----------------------------------------------------------------------
  Collection / nhóm dữ liệu           Mục đích
  ----------------------------------- -----------------------------------
  `users`                             Thông tin xác thực, mật khẩu đã
                                      băm, vai trò, trạng thái tài khoản

  `readers`                           Hồ sơ độc giả

  `employees`                         Hồ sơ nhân viên

  `books`                             Thông tin đầu sách và số lượng

  `publishers`                        Nhà xuất bản

  `loanReceipts`                      Phiếu mượn, độc giả, nhân viên lập,
                                      ngày lập và trạng thái tổng thể

  `loanItems` hoặc mảng chi tiết      Từng đầu sách/số lượng, hạn trả,
  trong phiếu                         ngày trả, tình trạng

  `fines`                             Khoản phạt/bồi thường và trạng thái
                                      xử lý

  `auditLogs`                         Nhật ký thao tác quan trọng

  `librarySettings`                   Chính sách mượn trả có thể cấu hình
  -----------------------------------------------------------------------

Đây là định hướng dữ liệu, không phải schema MongoDB cuối cùng. Agent
thiết kế database cần đề xuất cách nhúng (embedded) hoặc tham chiếu
(referenced) dựa trên truy vấn và tính nhất quán. Mỗi tài khoản Reader
phải liên kết đúng một hồ sơ độc giả; tài khoản nhân viên phải liên kết
hồ sơ nhân viên.

**Lưu ý quan trọng:** Không nên chỉ lưu một `NgayTra` duy nhất cho toàn
bộ phiếu nếu phiếu có nhiều sách và cho phép trả từng phần. Mỗi chi tiết
sách cần có hạn trả, ngày trả thực tế và trạng thái riêng.

------------------------------------------------------------------------

## 5. Quy trình nghiệp vụ cốt lõi

### 5.1. Đăng ký tài khoản độc giả

1.  Độc giả nhập thông tin tài khoản và hồ sơ cá nhân.
2.  Backend kiểm tra trường bắt buộc, định dạng dữ liệu và tính duy nhất
    của tên đăng nhập.
3.  Backend kiểm tra trùng số điện thoại nếu chính sách yêu cầu duy
    nhất.
4.  Mật khẩu được băm bằng thuật toán phù hợp trước khi lưu.
5.  Tạo tài khoản Reader và hồ sơ độc giả liên kết.
6.  Trả kết quả đăng ký; tài khoản có trạng thái hoạt động hoặc chờ xác
    minh tùy chính sách được chọn.

Không được tạo tài khoản mồ côi không có hồ sơ độc giả hoặc hồ sơ độc
giả không được liên kết đúng tài khoản.

### 5.2. Đăng nhập và trạng thái tài khoản

1.  Người dùng gửi thông tin đăng nhập.
2.  Backend tìm tài khoản và kiểm tra mật khẩu.
3.  Backend kiểm tra tài khoản có đang hoạt động hay không.
4.  Nếu hợp lệ, cấp thông tin xác thực và vai trò.
5.  Nếu sai mật khẩu, tài khoản không tồn tại hoặc bị khóa, từ chối truy
    cập với thông báo phù hợp.

Phải phân biệt: - **Khóa tài khoản:** không được đăng nhập. - **Khóa
quyền mượn:** vẫn có thể đăng nhập và tra cứu, nhưng không được lập giao
dịch mượn.

### 5.3. Lập phiếu mượn

Chỉ Admin hoặc Librarian được lập phiếu mượn.

1.  Nhân viên tìm độc giả.
2.  Backend kiểm tra độc giả tồn tại, tài khoản hoạt động và quyền mượn
    không bị hạn chế.
3.  Nhân viên thêm một hoặc nhiều đầu sách vào phiếu.
4.  Backend kiểm tra sách đang được phép lưu thông và đủ số lượng khả
    dụng.
5.  Backend kiểm tra giới hạn tổng số sách độc giả được mượn.
6.  Nhân viên xác nhận.
7.  Backend tạo phiếu mượn cùng các chi tiết sách.
8.  Backend cập nhật số lượng đang mượn/khả dụng và lưu người lập, thời
    điểm lập.
9.  Trả kết quả thành công.

Nếu một chi tiết không hợp lệ, không được tạo phiếu nửa chừng hoặc trừ
tồn kho một phần. Việc tạo phiếu và cập nhật số lượng phải được thực
hiện nguyên tử bằng transaction hoặc cơ chế đảm bảo nhất quán phù hợp.

### 5.4. Trả sách

1.  Nhân viên tìm phiếu mượn hoặc độc giả.
2.  Hệ thống hiển thị các chi tiết sách chưa hoàn tất.
3.  Nhân viên chọn một hoặc nhiều cuốn được trả.
4.  Nhân viên kiểm tra tình trạng vật lý.
5.  Backend ghi nhận ngày trả thực tế, người xác nhận và tình trạng
    sách.
6.  Backend xác định trả đúng hạn hay trễ hạn.
7.  Nếu trả nguyên vẹn, sách được đưa lại vào số lượng khả dụng.
8.  Nếu hư hỏng hoặc mất, không được tăng số lượng khả dụng như sách
    tốt.
9.  Cập nhật trạng thái tổng thể phiếu: còn sách chưa trả thì phiếu vẫn
    đang mở; tất cả chi tiết đã được xử lý thì phiếu hoàn tất.

Cho phép trả từng phần. Không được đánh dấu toàn bộ phiếu hoàn tất khi
vẫn còn chi tiết đang mượn.

### 5.5. Trả sách trễ hạn

Mỗi chi tiết mượn phải có `dueDate` (hạn trả) và `returnedAt` (ngày trả
thực tế).

-   Chưa trả và ngày hiện tại lớn hơn hạn trả: **Đang quá hạn**.
-   Đã trả và ngày trả thực tế lớn hơn hạn trả: **Đã trả trễ**.
-   Đã trả và ngày trả thực tế nhỏ hơn hoặc bằng hạn trả: **Đã trả đúng
    hạn**.

Số ngày trễ được tính theo ngày lịch và quy tắc làm tròn ngày được cấu
hình thống nhất. Không được tính sách chưa trả là đã hoàn tất chỉ vì đã
quá hạn.

Nếu áp dụng tiền phạt:

`Tiền phạt = Số ngày trễ × Mức phạt mỗi ngày`

Khi trả trễ, hệ thống: 1. Tính số ngày trễ. 2. Ghi nhận trạng thái vi
phạm. 3. Tạo khoản phạt nếu chính sách áp dụng. 4. Cập nhật tổng khoản
phạt còn phải xử lý. 5. Áp dụng chính sách hạn chế mượn nếu có. 6. Hiển
thị thông tin cho nhân viên và độc giả.

Không tự ý xóa khoản phạt hoặc đánh dấu đã thanh toán nếu chưa có thao
tác xác nhận hợp lệ.

### 5.6. Độc giả không trả sách

-   Chi tiết mượn tiếp tục ở trạng thái đang mượn/quá hạn.
-   Sách vẫn được tính là đang mượn và không được đưa về tồn khả dụng.
-   Hệ thống hiển thị trong danh sách sách quá hạn.
-   Có thể gửi nhắc hạn hoặc cảnh báo.
-   Khi đạt ngưỡng chính sách, hệ thống có thể hạn chế quyền mượn.
-   Chỉ khi nhân viên xác nhận trả, ghi nhận mất hoặc xử lý theo quy
    trình được duyệt thì giao dịch mới chuyển trạng thái tương ứng.

### 5.7. Sách hư hỏng

1.  Nhân viên kiểm tra sách khi nhận trả.
2.  Ghi nhận mức độ và mô tả hư hỏng.
3.  Xác định sách còn đủ điều kiện cho mượn hay không.
4.  Nếu còn sử dụng được, xử lý theo chính sách thư viện.
5.  Nếu không thể lưu thông, chuyển sách sang trạng thái hư hỏng/không
    khả dụng.
6.  Tạo khoản bồi thường nếu chính sách áp dụng.
7.  Lưu nhân viên xác nhận và thời điểm.

Sách hư hỏng không được tự động cộng lại vào số lượng khả dụng.

### 5.8. Sách bị mất

1.  Nhân viên xác nhận sách không thể được hoàn trả.
2.  Chi tiết mượn chuyển sang trạng thái mất.
3.  Sách không được cộng lại vào tồn khả dụng.
4.  Tạo khoản bồi thường theo chính sách.
5.  Ghi nhận người xử lý, thời điểm và trạng thái giải quyết.
6.  Khi trách nhiệm của độc giả đã được xử lý, đóng nghiệp vụ mượn tương
    ứng nhưng vẫn giữ lịch sử sách bị mất.

Không được ghi nhận sách mất thành sách đã trả bình thường.

### 5.9. Gia hạn mượn

Gia hạn là chức năng có thể triển khai sau khi chính sách được xác nhận.
Nếu có:

-   Chỉ gia hạn chi tiết sách chưa trả.
-   Kiểm tra số lần gia hạn còn lại.
-   Kiểm tra sách có người đặt trước hay không nếu hệ thống hỗ trợ đặt
    trước.
-   Kiểm tra trạng thái độc giả.
-   Ghi nhận hạn trả cũ, hạn trả mới, người duyệt và thời điểm.
-   Từ chối nếu không đáp ứng chính sách và trả về lý do rõ ràng.

### 5.10. Quản lý số lượng sách

Cần phân biệt: - `totalCopies`: tổng số bản sách sở hữu. -
`borrowedCopies`: số bản đang được mượn. - `damagedCopies`: số bản hư
hỏng/không lưu thông. - `availableCopies`: số bản có thể cho mượn.

Công thức:

`availableCopies = totalCopies - borrowedCopies - damagedCopies`

Các bất biến: - Số lượng không được âm. - Không cho mượn vượt số lượng
khả dụng. - Mượn thành công làm tăng số đang mượn và giảm số khả dụng. -
Trả sách tốt làm giảm số đang mượn và tăng số khả dụng. - Trả sách hư
hỏng làm giảm số đang mượn nhưng không tăng số khả dụng. - Sách mất
không được cộng lại vào số khả dụng. - Không được giảm tổng số bản xuống
thấp hơn số bản đang mượn cộng số bản không thể lưu thông. - Các thao
tác điều chỉnh số lượng phải có người thực hiện và lý do.

### 5.11. Xóa và ngừng sử dụng dữ liệu

-   Không xóa sách đang có giao dịch mượn chưa hoàn tất.
-   Không xóa nhà xuất bản đang được sách tham chiếu.
-   Không xóa độc giả còn sách chưa trả hoặc khoản phạt chưa xử lý.
-   Dữ liệu đã phát sinh lịch sử giao dịch nên được lưu giữ; ưu tiên
    chuyển trạng thái ngừng hoạt động thay vì xóa vật lý.
-   Không xóa nhân viên nếu cần bảo toàn thông tin người thực hiện các
    giao dịch cũ; có thể khóa tài khoản.

------------------------------------------------------------------------

## 6. Quy tắc nghiệp vụ tổng hợp

  -----------------------------------------------------------------------
  Mã                                  Quy tắc
  ----------------------------------- -----------------------------------
  BR-01                               Chỉ Admin và Librarian được lập
                                      phiếu mượn.

  BR-02                               Reader chỉ xem lịch sử mượn của
                                      chính mình.

  BR-03                               Tài khoản bị khóa không được đăng
                                      nhập.

  BR-04                               Độc giả bị khóa quyền mượn vẫn có
                                      thể tra cứu nếu tài khoản còn hoạt
                                      động.

  BR-05                               Không cho mượn khi số lượng khả
                                      dụng không đủ.

  BR-06                               Không cho vượt giới hạn mượn của
                                      độc giả.

  BR-07                               Mỗi chi tiết sách có hạn trả và
                                      ngày trả thực tế riêng.

  BR-08                               Cho phép trả từng phần trong một
                                      phiếu mượn.

  BR-09                               Sách quá hạn vẫn được tính là đang
                                      mượn.

  BR-10                               Sách mất hoặc hư hỏng không được
                                      cộng vào số lượng khả dụng như sách
                                      tốt.

  BR-11                               Không xóa vật lý dữ liệu đã phát
                                      sinh giao dịch quan trọng.

  BR-12                               Mọi giao dịch quan trọng phải lưu
                                      người thực hiện và thời điểm.

  BR-13                               Backend phải kiểm tra quyền và dữ
                                      liệu; kiểm tra ở Frontend chỉ hỗ
                                      trợ trải nghiệm.

  BR-14                               Thao tác tạo phiếu và cập nhật số
                                      lượng phải đảm bảo nhất quán, tránh
                                      mượn vượt tồn kho.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 7. Trạng thái nghiệp vụ đề xuất

Các trạng thái dưới đây là trạng thái nghiệp vụ gợi ý; Agent triển khai
cần thống nhất enum và cách chuyển trạng thái trước khi viết code.

### 7.1. Tài khoản

-   `ACTIVE`: đang hoạt động.
-   `LOCKED`: bị khóa.
-   `PENDING`: chờ xác minh/kích hoạt (nếu áp dụng).

### 7.2. Quyền mượn của độc giả

-   `ALLOWED`: được phép mượn.
-   `RESTRICTED`: bị hạn chế mượn.

Trạng thái quyền mượn nên tách khỏi trạng thái đăng nhập tài khoản.

### 7.3. Chi tiết mượn sách

-   `BORROWED`: đang mượn.
-   `OVERDUE`: đang quá hạn.
-   `RETURNED_ON_TIME`: đã trả đúng hạn.
-   `RETURNED_LATE`: đã trả trễ.
-   `DAMAGED`: đã trả nhưng sách hư hỏng.
-   `LOST`: sách bị mất.
-   `RESOLVED`: đã xử lý xong trách nhiệm liên quan, nếu cần một trạng
    thái kết thúc riêng.

Không nên dùng một trạng thái duy nhất cho cả phiếu và từng cuốn sách.

### 7.4. Phiếu mượn

-   `OPEN`: còn ít nhất một chi tiết chưa xử lý xong.
-   `COMPLETED`: tất cả chi tiết đã được xử lý.
-   `CANCELLED`: phiếu bị hủy hợp lệ trước hoặc theo quy trình hủy được
    cho phép.

### 7.5. Khoản phạt

-   `UNPAID`: chưa thanh toán.
-   `PARTIALLY_PAID`: đã thanh toán một phần, nếu hỗ trợ.
-   `PAID`: đã thanh toán.
-   `WAIVED`: được miễn theo thẩm quyền.
-   `CANCELLED`: khoản phạt bị hủy do ghi nhận sai và có lưu vết.

------------------------------------------------------------------------

## 8. Yêu cầu phi chức năng

-   **Bảo mật:** băm mật khẩu; xác thực và phân quyền ở Backend; bảo vệ
    API và dữ liệu cá nhân.
-   **Tính nhất quán:** không để tồn kho âm, không tạo giao dịch trùng
    do gửi yêu cầu lặp, không cập nhật phiếu và tồn kho lệch nhau.
-   **Dễ sử dụng:** giao diện rõ ràng, thông báo lỗi dễ hiểu, phù hợp
    từng vai trò.
-   **Hiệu năng:** hỗ trợ phân trang, lọc và tìm kiếm; tạo index cho các
    trường truy vấn thường xuyên.
-   **Khả năng bảo trì:** tổ chức code theo module nghiệp vụ, tách
    route/controller/service/model hoặc cấu trúc tương đương.
-   **Khả năng mở rộng:** cho phép bổ sung đặt trước, thông báo, gia hạn
    và báo cáo nâng cao.
-   **Truy vết:** ghi log các thao tác nhạy cảm và giao dịch quan trọng.

------------------------------------------------------------------------

## 9. Quy tắc làm việc dành cho AI Agent

Tất cả Agent tham gia dự án phải tuân thủ:

1.  Đọc tài liệu `PROJECT.md` trước khi thực hiện công việc.
2.  Không tự ý thay đổi ba vai trò người dùng hoặc công nghệ đã chốt.
3.  Không tự ý thay đổi quy tắc mượn/trả đã được chủ dự án xác nhận.
4.  Nếu chính sách chưa được xác nhận, phải đánh dấu là **PENDING
    DECISION**, không tự coi giả định là yêu cầu chính thức.
5.  Backend là nguồn quyết định cuối cùng cho nghiệp vụ và phân quyền.
6.  Không bỏ qua các trường hợp ngoại lệ: hết sách, tài khoản bị khóa,
    trả trễ, trả từng phần, mất sách, hư hỏng và khoản phạt.
7.  Khi thêm hoặc sửa API, cập nhật tài liệu API và kiểm thử tương ứng.
8.  Khi thay đổi schema hoặc trạng thái, cập nhật tài liệu dữ liệu và
    kiểm thử liên quan.
9.  Không xóa lịch sử giao dịch để đơn giản hóa việc triển khai.
10. Trước khi kết thúc nhiệm vụ, báo cáo file đã thay đổi, chức năng đã
    hoàn thành, cách kiểm thử và phần còn tồn tại.

### 9.1. Nguyên tắc kiểm thử tối thiểu

Mỗi nghiệp vụ phải có: - Trường hợp thành công. - Dữ liệu đầu vào không
hợp lệ. - Người dùng không đủ quyền. - Dữ liệu không tồn tại. - Trạng
thái nghiệp vụ không cho phép thao tác. - Trường hợp biên về số lượng và
thời gian. - Kiểm tra dữ liệu sau khi thao tác.

Ví dụ với mượn sách: mượn thành công, sách hết, độc giả bị khóa quyền
mượn, vượt giới hạn, gửi yêu cầu đồng thời khi chỉ còn một bản sách.

Ví dụ với trả sách: trả đúng hạn, trả trễ, trả từng phần, trả sách hư
hỏng, ghi nhận mất sách, xác nhận trả trùng.

------------------------------------------------------------------------

## 10. Các quyết định còn chờ chủ dự án xác nhận

Các giá trị sau đây từng được đề xuất để tham khảo, nhưng **chưa được
chủ dự án xác nhận**. Agent không được tự coi đây là chính sách chính
thức:

  ------------------------------------------------------------------------
  Nội dung                           Giá trị đề xuất Trạng thái
  --------------------- ---------------------------- ---------------------
  Thời hạn mượn                              14 ngày PENDING DECISION

  Số sách tối đa mỗi                          5 cuốn PENDING DECISION
  độc giả                                            

  Tiền phạt trả trễ                  2.000 đồng/ngày PENDING DECISION

  Số lần gia hạn tối đa                        1 lần PENDING DECISION

  Xử lý trả trễ          Phạt và hạn chế mượn khi vi PENDING DECISION
                                     phạm chưa xử lý 

  Đặt trước sách                                  Có PENDING DECISION

  Cách cấp tài khoản      Độc giả tự đăng ký và nhân PENDING DECISION
  Reader                               viên tạo được 

  Thời hạn nhắc trả và                 Chưa xác định PENDING DECISION
  ngưỡng khóa quyền                                  
  mượn                                               

  Mức bồi thường sách                  Chưa xác định PENDING DECISION
  mất/hư hỏng                                        

  Quy trình xác nhận                   Chưa xác định PENDING DECISION
  thanh toán/miễn phạt                               
  ------------------------------------------------------------------------

Nếu cần triển khai trước khi có quyết định, hãy đưa các giá trị này vào
cấu hình có thể thay đổi, không hard-code rải rác trong chương trình.

------------------------------------------------------------------------

## 11. Tiêu chí hoàn thành ở mức sản phẩm

Phiên bản nền tảng được xem là đạt yêu cầu khi:

-   Ba vai trò đăng nhập và chỉ truy cập đúng chức năng được cấp.
-   Admin quản lý được nhân viên và dữ liệu thư viện.
-   Nhân viên quản lý độc giả, sách, nhà xuất bản và giao dịch mượn trả.
-   Độc giả có tài khoản, tra cứu sách và xem được lịch sử cá nhân.
-   Hệ thống lập được phiếu có nhiều đầu sách.
-   Hệ thống hỗ trợ trả từng phần.
-   Hệ thống xác định chính xác đúng hạn, quá hạn và trả trễ.
-   Hệ thống ghi nhận được sách hư hỏng và mất.
-   Số lượng khả dụng được cập nhật nhất quán.
-   Các trường hợp bị từ chối đều có lý do rõ ràng.
-   Các giao dịch quan trọng có thông tin người thực hiện và thời điểm.
-   Có kiểm thử cho luồng chính và các trường hợp ngoại lệ.

------------------------------------------------------------------------

**Kết luận:** `PROJECT.md` là tài liệu định hướng chung của
WEBQUANLYMUONSACH. Mọi Agent phải dùng tài liệu này làm căn cứ khi phân
tích, thiết kế, lập trình và kiểm thử. Các quyết định đang ở trạng thái
`PENDING DECISION` chỉ trở thành yêu cầu chính thức sau khi chủ dự án
xác nhận.

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const nhaXuatBanRoutes = require('./routes/nhaXuatBan.route');
const sachRoutes = require('./routes/sach.route');
const docGiaRoutes = require('./routes/docGia.route');
const nhanVienRoutes = require('./routes/nhanVien.route');
const phieuMuonRoutes = require('./routes/phieuMuon.route');
const khoanPhatRoutes = require('./routes/khoanPhat.route');
const {
  settingsRouter,
  auditLogsRouter,
  dashboardRouter,
} = require('./routes/heThong.route');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Kiểm tra trạng thái server
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Backend WEBQUANLYMUONSACH is running',
  });
});

// Xác thực & phân quyền
app.use('/api/auth', authRoutes);

// Các module nghiệp vụ (hỗ trợ cả đường dẫn tiếng Anh và tiếng Việt)
app.use('/api/publishers', nhaXuatBanRoutes);
app.use('/api/nha-xuat-ban', nhaXuatBanRoutes);

app.use('/api/books', sachRoutes);
app.use('/api/sach', sachRoutes);

app.use('/api/readers', docGiaRoutes);
app.use('/api/doc-gia', docGiaRoutes);

app.use('/api/employees', nhanVienRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);

app.use('/api/loans', phieuMuonRoutes);
app.use('/api/phieu-muon', phieuMuonRoutes);

app.use('/api/fines', khoanPhatRoutes);
app.use('/api/khoan-phat', khoanPhatRoutes);

// Cấu hình thư viện, nhật ký hệ thống & thống kê
app.use('/api/settings', settingsRouter);
app.use('/api/cau-hinh', settingsRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/nhat-ky', auditLogsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/thong-ke', dashboardRouter);

// Xử lý 404 và lỗi tập trung
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

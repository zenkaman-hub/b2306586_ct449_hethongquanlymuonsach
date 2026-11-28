const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const nhaXuatBanRoutes = require('./routes/nhaXuatBan.route');
const sachRoutes = require('./routes/sach.route');
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

// Xử lý 404 và lỗi tập trung
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
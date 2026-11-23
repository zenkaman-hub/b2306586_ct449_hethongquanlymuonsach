const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const nhaXuatBanRoutes = require('./routes/nhaXuatBan.route');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Route kiem tra server song
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Backend WEBQUANLYMUONSACH is running',
  });
});

// Routes xac thuc & phan quyen
app.use('/api/auth', authRoutes);

// Routes quan ly Nha xuat ban (ho tro ca /api/publishers va /api/nha-xuat-ban)
app.use('/api/publishers', nhaXuatBanRoutes);
app.use('/api/nha-xuat-ban', nhaXuatBanRoutes);

// Middleware xu ly route khong ton tai va xu ly loi tap trung
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

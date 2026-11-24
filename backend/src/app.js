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

// Routes quan ly Sach (ho tro ca /api/books va /api/sach)
app.use('/api/books', sachRoutes);
app.use('/api/sach', sachRoutes);

// Routes quan ly Doc gia (ho tro ca /api/readers va /api/doc-gia)
app.use('/api/readers', docGiaRoutes);
app.use('/api/doc-gia', docGiaRoutes);

// Routes quan ly Nhan vien (ho tro ca /api/employees va /api/nhan-vien)
app.use('/api/employees', nhanVienRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);

// Routes quan ly Phieu muon - tra sach (ho tro ca /api/loans va /api/phieu-muon)
app.use('/api/loans', phieuMuonRoutes);
app.use('/api/phieu-muon', phieuMuonRoutes);

// Routes quan ly Khoan phat & boi thuong (ho tro ca /api/fines va /api/khoan-phat)
app.use('/api/fines', khoanPhatRoutes);
app.use('/api/khoan-phat', khoanPhatRoutes);

// Middleware xu ly route khong ton tai va xu ly loi tap trung
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

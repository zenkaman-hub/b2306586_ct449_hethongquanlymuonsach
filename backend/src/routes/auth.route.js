const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Dang ky tai khoan doc gia
router.post('/register', authController.dangKy);

// Dang nhap
router.post('/login', authController.dangNhap);

// Dang xuat
router.post('/logout', authenticate, authController.dangXuat);

// Doi mat khau
router.put('/change-password', authenticate, authController.doiMatKhau);

// Lay thong tin tai khoan hien tai
router.get('/me', authenticate, authController.layThongTinMe);

module.exports = router;

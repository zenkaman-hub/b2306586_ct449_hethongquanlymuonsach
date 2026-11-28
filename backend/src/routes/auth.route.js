const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authController.dangKy);
router.post('/login', authController.dangNhap);
router.post('/logout', authenticate, authController.dangXuat);
router.put('/change-password', authenticate, authController.doiMatKhau);
router.get('/me', authenticate, authController.layThongTinMe);

module.exports = router;

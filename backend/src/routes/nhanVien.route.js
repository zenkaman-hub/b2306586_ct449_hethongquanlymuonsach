const express = require('express');
const nhanVienController = require('../controllers/nhanVien.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

router.use(authenticate);

// Hồ sơ cá nhân của nhân viên
router.get(
  '/me',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhanVienController.layHoSoCaNhan
);

// Quản lý nhân viên (chỉ dành cho QUAN_TRI)
router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.layDanhSach
);

router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.layChiTiet
);

router.post(
  '/',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.taoMoi
);

router.put(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.capNhat
);

router.patch(
  '/:id/work-status',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.doiTrangThaiLamViec
);

router.patch(
  '/:id/account-status',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.doiTrangThaiTaiKhoan
);

router.delete(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI),
  nhanVienController.xoa
);

module.exports = router;

const express = require('express');
const nhaXuatBanController = require('../controllers/nhaXuatBan.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Xem danh sach va chi tiet NXB (Cong khai de ho tro tra cuu sach)
router.get('/', nhaXuatBanController.layDanhSach);
router.get('/:id', nhaXuatBanController.layChiTiet);

// Cac thao tac quan ly NXB chi danh cho QUAN_TRI va THU_THU
router.post(
  '/',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhaXuatBanController.taoMoi
);

router.put(
  '/:id',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhaXuatBanController.capNhat
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhaXuatBanController.doiTrangThai
);

router.delete(
  '/:id',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhaXuatBanController.xoa
);

module.exports = router;

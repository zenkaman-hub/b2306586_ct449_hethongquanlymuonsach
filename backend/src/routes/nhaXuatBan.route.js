const express = require('express');
const nhaXuatBanController = require('../controllers/nhaXuatBan.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Tra cứu nhà xuất bản công khai
router.get('/', nhaXuatBanController.layDanhSach);
router.get('/:id', nhaXuatBanController.layChiTiet);

// Quản lý nhà xuất bản (QUAN_TRI, THU_THU)
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

const express = require('express');
const sachController = require('../controllers/sach.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Xem danh sach va chi tiet Sach (Cong khai cho Doc gia va Khach tra cuu)
router.get('/', sachController.layDanhSach);
router.get('/:id', sachController.layChiTiet);

// Cac thao tac quan ly Sach chi danh cho QUAN_TRI va THU_THU
router.post(
  '/',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  sachController.taoMoi
);

router.put(
  '/:id',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  sachController.capNhat
);

router.patch(
  '/:id/inventory',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  sachController.dieuChinhTonKho
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  sachController.doiTrangThai
);

router.delete(
  '/:id',
  authenticate,
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  sachController.xoa
);

module.exports = router;

const express = require('express');
const khoanPhatController = require('../controllers/khoanPhat.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

router.use(authenticate);

// Khoản phạt cá nhân của độc giả (BR-02)
router.get(
  '/my-fines',
  authorize(VAI_TRO.DOC_GIA),
  khoanPhatController.layDanhSachCaNhan
);

// Quản lý & xử lý khoản phạt (QUAN_TRI, THU_THU)
router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.layDanhSach
);

// Chi tiết khoản phạt (nhân viên hoặc độc giả sở hữu)
router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU, VAI_TRO.DOC_GIA),
  khoanPhatController.layChiTiet
);

router.post(
  '/:id/pay',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.thanhToan
);

router.patch(
  '/:id/waive',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.mienPhat
);

router.patch(
  '/:id/cancel',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.huyPhat
);

module.exports = router;

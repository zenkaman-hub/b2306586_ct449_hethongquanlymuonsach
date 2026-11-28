const express = require('express');
const docGiaController = require('../controllers/docGia.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

router.use(authenticate);

// Hồ sơ cá nhân của độc giả (BR-02)
router.get(
  '/me',
  authorize(VAI_TRO.DOC_GIA),
  docGiaController.layHoSoCaNhan
);

router.put(
  '/me',
  authorize(VAI_TRO.DOC_GIA),
  docGiaController.capNhatHoSoCaNhan
);

// Quản lý độc giả (QUAN_TRI, THU_THU)
router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.layDanhSach
);

router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.layChiTiet
);

router.post(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.taoMoi
);

router.put(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.capNhat
);

router.patch(
  '/:id/borrowing-status',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.doiTrangThaiQuyenMuon
);

router.patch(
  '/:id/account-status',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.doiTrangThaiTaiKhoan
);

router.patch(
  '/:id/profile-status',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.doiTrangThaiHoSo
);

router.delete(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  docGiaController.xoa
);

module.exports = router;

const express = require('express');
const docGiaController = require('../controllers/docGia.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Tat ca endpoint trong module Doc gia deu yeu cau dang nhap
router.use(authenticate);

// 1. Endpoint danh rieng cho DOC_GIA xem va cap nhat ho so ca nhan cua chinh minh (BR-02)
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

// 2. Cac endpoint quan ly Doc gia danh cho QUAN_TRI va THU_THU
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

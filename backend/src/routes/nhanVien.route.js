const express = require('express');
const nhanVienController = require('../controllers/nhanVien.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Tat ca endpoint trong module Nhan vien deu yeu cau dang nhap
router.use(authenticate);

// 1. Endpoint cho Nhan vien (QUAN_TRI, THU_THU) xem ho so nhan su cua chinh minh
router.get(
  '/me',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  nhanVienController.layHoSoCaNhan
);

// 2. Toan bo cac thao tac quan ly Nhan vien chi danh rieng cho QUAN_TRI (Muc 3.1, 3.2, 3.4 PROJECT.md)
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

const express = require('express');
const khoanPhatController = require('../controllers/khoanPhat.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Tat ca endpoint trong module Khoan phat deu yeu cau dang nhap
router.use(authenticate);

// 1. Endpoint cho DOC_GIA xem danh sach khoan phat cua chinh minh (BR-02)
router.get(
  '/my-fines',
  authorize(VAI_TRO.DOC_GIA),
  khoanPhatController.layDanhSachCaNhan
);

// 2. Xem danh sach toan bo khoan phat (QUAN_TRI, THU_THU)
router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.layDanhSach
);

// 3. Xem chi tiet 1 khoan phat (QUAN_TRI, THU_THU, hoac DOC_GIA so huu khoan phat)
router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU, VAI_TRO.DOC_GIA),
  khoanPhatController.layChiTiet
);

// 4. Xac nhan thu tien phat toan bo hoac mot phan (QUAN_TRI, THU_THU)
router.post(
  '/:id/pay',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.thanhToan
);

// 5. Mien khoan phat (QUAN_TRI, THU_THU)
router.patch(
  '/:id/waive',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.mienPhat
);

// 6. Huy khoan phat ghi nhan sai (QUAN_TRI, THU_THU)
router.patch(
  '/:id/cancel',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  khoanPhatController.huyPhat
);

module.exports = router;

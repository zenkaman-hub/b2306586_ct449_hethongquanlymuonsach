const express = require('express');
const phieuMuonController = require('../controllers/phieuMuon.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

// Tat ca endpoint trong module Phieu muon deu yeu cau dang nhap
router.use(authenticate);

// 1. Endpoint cho DOC_GIA xem lich su muon tra cua chinh minh (BR-02)
router.get(
  '/my-history',
  authorize(VAI_TRO.DOC_GIA),
  phieuMuonController.layLichSuCaNhan
);

// 2. Endpoint thong ke danh sach cac cuon sach dang qua han chua tra (QUAN_TRI, THU_THU)
router.get(
  '/overdue-items',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.layDanhSachSachQuaHan
);

// 3. Xem danh sach tat ca phieu muon (QUAN_TRI, THU_THU)
router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.layDanhSach
);

// 4. Xem chi tiet 1 phieu muon (QUAN_TRI, THU_THU, hoac DOC_GIA so huu phieu)
router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU, VAI_TRO.DOC_GIA),
  phieuMuonController.layChiTiet
);

// 5. Lap phieu muon moi (Chi QUAN_TRI va THU_THU theo BR-01)
router.post(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.lapPhieuMuon
);

// 6. Xac nhan tra sach toan phan hoac tung phan (QUAN_TRI, THU_THU)
router.post(
  '/:id/return',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.traSach
);

// 7. Gia han thoi gian muon cho 1 cuon sach trong phieu (QUAN_TRI, THU_THU)
router.post(
  '/:id/extend',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.giaHanMuon
);

// 8. Huy phieu muon lap sai (QUAN_TRI, THU_THU)
router.patch(
  '/:id/cancel',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.huyPhieuMuon
);

module.exports = router;

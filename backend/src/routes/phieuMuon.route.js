const express = require('express');
const phieuMuonController = require('../controllers/phieuMuon.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

const router = express.Router();

router.use(authenticate);

// Lịch sử mượn trả cá nhân của độc giả (BR-02)
router.get(
  '/my-history',
  authorize(VAI_TRO.DOC_GIA),
  phieuMuonController.layLichSuCaNhan
);

// Tra cứu & quản lý phiếu mượn (QUAN_TRI, THU_THU)
router.get(
  '/overdue-items',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.layDanhSachSachQuaHan
);

router.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.layDanhSach
);

// Chi tiết phiếu mượn (nhân viên hoặc độc giả sở hữu)
router.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU, VAI_TRO.DOC_GIA),
  phieuMuonController.layChiTiet
);

// Lập phiếu mượn, trả sách, gia hạn, hủy phiếu (BR-01: chỉ QUAN_TRI, THU_THU)
router.post(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.lapPhieuMuon
);

router.post(
  '/:id/return',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.traSach
);

router.post(
  '/:id/extend',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.giaHanMuon
);

router.patch(
  '/:id/cancel',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  phieuMuonController.huyPhieuMuon
);

module.exports = router;

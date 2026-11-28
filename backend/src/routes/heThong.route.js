const express = require('express');
const heThongController = require('../controllers/heThong.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { VAI_TRO } = require('../constants/enums');

// Cấu hình thư viện (/api/settings, /api/cau-hinh)
const settingsRouter = express.Router();
settingsRouter.use(authenticate);

settingsRouter.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU, VAI_TRO.DOC_GIA),
  heThongController.layCauHinh
);

settingsRouter.put(
  '/',
  authorize(VAI_TRO.QUAN_TRI),
  heThongController.capNhatCauHinh
);

// Nhật ký hệ thống (/api/audit-logs, /api/nhat-ky)
const auditLogsRouter = express.Router();
auditLogsRouter.use(authenticate);

auditLogsRouter.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  heThongController.layDanhSachNhatKy
);

auditLogsRouter.get(
  '/:id',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  heThongController.layChiTietNhatKy
);

// Thống kê Dashboard (/api/dashboard, /api/thong-ke)
const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);

dashboardRouter.get(
  '/',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  heThongController.layThongKeDashboard
);

dashboardRouter.get(
  '/summary',
  authorize(VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU),
  heThongController.layThongKeDashboard
);

module.exports = {
  settingsRouter,
  auditLogsRouter,
  dashboardRouter,
};

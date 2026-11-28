const heThongService = require('../services/heThong.service');
const { validateCapNhatCauHinh } = require('../validators/heThong.validator');

// GET /api/settings - Lấy cấu hình thư viện
const layCauHinh = async (req, res, next) => {
  try {
    const ketQua = await heThongService.layCauHinhThuVien();

    return res.status(200).json({
      success: true,
      message: 'Lay cau hinh thu vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/settings - Cập nhật cấu hình thư viện
const capNhatCauHinh = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatCauHinh(req.body);
    const ketQua = await heThongService.capNhatCauHinhThuVien(
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat cau hinh thu vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/audit-logs - Lấy danh sách nhật ký hệ thống
const layDanhSachNhatKy = async (req, res, next) => {
  try {
    const ketQua = await heThongService.layDanhSachNhatKyHeThong(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach nhat ky he thong thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/audit-logs/:id - Lấy chi tiết nhật ký hệ thống
const layChiTietNhatKy = async (req, res, next) => {
  try {
    const ketQua = await heThongService.layChiTietNhatKyHeThong(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet nhat ky he thong thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/dashboard/summary - Lấy thống kê tổng quan dashboard
const layThongKeDashboard = async (req, res, next) => {
  try {
    const ketQua = await heThongService.layThongKeDashboard();

    return res.status(200).json({
      success: true,
      message: 'Lay thong ke tong quan thu vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layCauHinh,
  capNhatCauHinh,
  layDanhSachNhatKy,
  layChiTietNhatKy,
  layThongKeDashboard,
};

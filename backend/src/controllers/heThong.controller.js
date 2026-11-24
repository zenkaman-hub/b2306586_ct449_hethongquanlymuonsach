const heThongService = require('../services/heThong.service');
const { validateCapNhatCauHinh } = require('../validators/heThong.validator');

/**
 * GET /api/settings
 * Lay cau hinh chinh sach thu vien hien tai (QUAN_TRI, THU_THU, DOC_GIA)
 */
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

/**
 * PUT /api/settings
 * Cap nhat cau hinh chinh sach thu vien (Chi QUAN_TRI)
 */
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

/**
 * GET /api/audit-logs
 * Xem danh sach nhat ky he thong (QUAN_TRI, THU_THU)
 */
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

/**
 * GET /api/audit-logs/:id
 * Xem chi tiet 1 ban ghi nhat ky he thong (QUAN_TRI, THU_THU)
 */
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

/**
 * GET /api/dashboard/summary
 * Lay chi so thong ke tong quan cho Dashboard (QUAN_TRI, THU_THU)
 */
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

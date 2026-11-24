const nhanVienService = require('../services/nhanVien.service');
const {
  validateTaoNhanVien,
  validateCapNhatNhanVien,
  validateCapNhatTrangThaiLamViec,
  validateCapNhatTrangThaiTaiKhoanNV,
} = require('../validators/nhanVien.validator');

/**
 * GET /api/employees/me
 * Nhan vien (QUAN_TRI, THU_THU) xem ho so nhan su cua chinh minh
 */
const layHoSoCaNhan = async (req, res, next) => {
  try {
    const ketQua = await nhanVienService.layHoSoCaNhanNhanVien(
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Lay ho so ca nhan nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/employees
 * Lay danh sach nhan vien (Chi QUAN_TRI)
 */
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await nhanVienService.layDanhSachNhanVien(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/employees/:id
 * Lay chi tiet ho so 1 nhan vien (Chi QUAN_TRI)
 */
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await nhanVienService.layChiTietNhanVien(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/employees
 * Tao moi tai khoan va ho so nhan vien (Chi QUAN_TRI)
 */
const taoMoi = async (req, res, next) => {
  try {
    const duLieuHopLe = validateTaoNhanVien(req.body);
    const ketQua = await nhanVienService.taoNhanVien(
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(201).json({
      success: true,
      message: 'Tao ho so va tai khoan nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/employees/:id
 * Cap nhat thong tin ho so nhan vien (Chi QUAN_TRI)
 */
const capNhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatNhanVien(req.body);
    const ketQua = await nhanVienService.capNhatNhanVien(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat thong tin nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/employees/:id/work-status
 * Chuyen trang thai lam viec DANG_LAM_VIEC / NGHI_VIEC (Chi QUAN_TRI)
 */
const doiTrangThaiLamViec = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatTrangThaiLamViec(req.body);
    const ketQua = await nhanVienService.capNhatTrangThaiLamViecNhanVien(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai lam viec cua nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/employees/:id/account-status
 * Khoa hoac mo khoa tai khoan dang nhap cua nhan vien (Chi QUAN_TRI)
 */
const doiTrangThaiTaiKhoan = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatTrangThaiTaiKhoanNV(req.body);
    const ketQua = await nhanVienService.capNhatTrangThaiTaiKhoanNhanVien(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai tai khoan nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/employees/:id
 * Xoa nhan vien (Chi QUAN_TRI, chi cho phep khi chua phat sinh giao dich theo BR-11)
 */
const xoa = async (req, res, next) => {
  try {
    const ketQua = await nhanVienService.xoaNhanVien(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Xoa ho so va tai khoan nhan vien thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layHoSoCaNhan,
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  doiTrangThaiLamViec,
  doiTrangThaiTaiKhoan,
  xoa,
};

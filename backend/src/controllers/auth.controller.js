const authService = require('../services/auth.service');
const {
  validateDangKyDocGia,
  validateDangNhap,
  validateDoiMatKhau,
} = require('../validators/auth.validator');

// POST /api/auth/register - Đăng ký tài khoản độc giả
const dangKy = async (req, res, next) => {
  try {
    const duLieuHopLe = validateDangKyDocGia(req.body);
    const ketQua = await authService.dangKyDocGia(duLieuHopLe);

    return res.status(201).json({
      success: true,
      message: 'Dang ky tai khoan doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/login - Đăng nhập
const dangNhap = async (req, res, next) => {
  try {
    const duLieuHopLe = validateDangNhap(req.body);
    const ketQua = await authService.dangNhap(duLieuHopLe);

    return res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/logout - Đăng xuất (client tự xóa JWT)
const dangXuat = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Dang xuat thanh cong',
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/auth/change-password - Đổi mật khẩu
const doiMatKhau = async (req, res, next) => {
  try {
    const duLieuHopLe = validateDoiMatKhau(req.body);
    const ketQua = await authService.doiMatKhau(
      req.user.taiKhoanId,
      duLieuHopLe
    );

    return res.status(200).json({
      success: true,
      message: 'Doi mat khau thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/auth/me - Lấy thông tin tài khoản hiện tại
const layThongTinMe = async (req, res, next) => {
  try {
    const ketQua = await authService.layThongTinHienTai(req.user.taiKhoanId);

    return res.status(200).json({
      success: true,
      message: 'Lay thong tin tai khoan thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dangKy,
  dangNhap,
  dangXuat,
  doiMatKhau,
  layThongTinMe,
};

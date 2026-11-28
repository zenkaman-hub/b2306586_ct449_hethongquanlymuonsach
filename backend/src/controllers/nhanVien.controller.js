const nhanVienService = require('../services/nhanVien.service');
const {
  validateTaoNhanVien,
  validateCapNhatNhanVien,
  validateCapNhatTrangThaiLamViec,
  validateCapNhatTrangThaiTaiKhoanNV,
} = require('../validators/nhanVien.validator');

// GET /api/employees/me - Xem hồ sơ cá nhân nhân viên
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

// GET /api/employees - Lấy danh sách nhân viên
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

// GET /api/employees/:id - Lấy chi tiết nhân viên
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

// POST /api/employees - Tạo mới tài khoản và hồ sơ nhân viên
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

// PUT /api/employees/:id - Cập nhật hồ sơ nhân viên
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

// PATCH /api/employees/:id/work-status - Đổi trạng thái làm việc nhân viên
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

// PATCH /api/employees/:id/account-status - Khóa hoặc mở khóa tài khoản nhân viên
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

// DELETE /api/employees/:id - Xóa nhân viên (khi chưa có giao dịch)
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

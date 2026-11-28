const docGiaService = require('../services/docGia.service');
const {
  validateTaoDocGia,
  validateCapNhatDocGia,
  validateCapNhatQuyenMuon,
  validateCapNhatTrangThaiTaiKhoan,
  validateCapNhatTrangThaiHoSo,
} = require('../validators/docGia.validator');

// GET /api/readers/me - Xem hồ sơ cá nhân độc giả
const layHoSoCaNhan = async (req, res, next) => {
  try {
    const ketQua = await docGiaService.layHoSoCaNhanDocGia(
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Lay ho so ca nhan doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/readers/me - Độc giả tự cập nhật hồ sơ cá nhân
const capNhatHoSoCaNhan = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatDocGia(req.body, false);
    const ketQua = await docGiaService.capNhatHoSoCaNhanDocGia(
      req.user.taiKhoanId,
      duLieuHopLe
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat ho so ca nhan thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/readers - Lấy danh sách độc giả
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await docGiaService.layDanhSachDocGia(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/readers/:id - Lấy chi tiết độc giả
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await docGiaService.layChiTietDocGia(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/readers - Tạo mới tài khoản và hồ sơ độc giả
const taoMoi = async (req, res, next) => {
  try {
    const duLieuHopLe = validateTaoDocGia(req.body);
    const ketQua = await docGiaService.taoDocGia(
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(201).json({
      success: true,
      message: 'Tao ho so va tai khoan doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/readers/:id - Cập nhật hồ sơ độc giả
const capNhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatDocGia(req.body, true);
    const ketQua = await docGiaService.capNhatDocGia(
      req.params.id,
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat thong tin doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/readers/:id/borrowing-status - Cập nhật quyền mượn của độc giả
const doiTrangThaiQuyenMuon = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatQuyenMuon(req.body);
    const ketQua = await docGiaService.capNhatQuyenMuonDocGia(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai quyen muon cua doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/readers/:id/account-status - Khóa hoặc mở khóa tài khoản độc giả
const doiTrangThaiTaiKhoan = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatTrangThaiTaiKhoan(req.body);
    const ketQua = await docGiaService.capNhatTrangThaiTaiKhoanDocGia(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai tai khoan doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/readers/:id/profile-status - Đổi trạng thái hồ sơ độc giả
const doiTrangThaiHoSo = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatTrangThaiHoSo(req.body);
    const ketQua = await docGiaService.capNhatTrangThaiHoSoDocGia(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai ho so doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/readers/:id - Xóa độc giả (khi chưa có giao dịch)
const xoa = async (req, res, next) => {
  try {
    const ketQua = await docGiaService.xoaDocGia(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Xoa ho so va tai khoan doc gia thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layHoSoCaNhan,
  capNhatHoSoCaNhan,
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  doiTrangThaiQuyenMuon,
  doiTrangThaiTaiKhoan,
  doiTrangThaiHoSo,
  xoa,
};

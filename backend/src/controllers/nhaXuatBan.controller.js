const nhaXuatBanService = require('../services/nhaXuatBan.service');
const {
  validateTaoNXB,
  validateCapNhatNXB,
  validateCapNhatTrangThaiNXB,
} = require('../validators/nhaXuatBan.validator');

// GET /api/publishers - Lấy danh sách NXB
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await nhaXuatBanService.layDanhSachNXB(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/publishers/:id - Lấy chi tiết NXB
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await nhaXuatBanService.layChiTietNXB(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/publishers - Tạo mới NXB
const taoMoi = async (req, res, next) => {
  try {
    const duLieuHopLe = validateTaoNXB(req.body);
    const ketQua = await nhaXuatBanService.taoNXB(
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(201).json({
      success: true,
      message: 'Tao nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/publishers/:id - Cập nhật NXB
const capNhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatNXB(req.body);
    const ketQua = await nhaXuatBanService.capNhatNXB(
      req.params.id,
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/publishers/:id/status - Đổi trạng thái NXB
const doiTrangThai = async (req, res, next) => {
  try {
    const { trangThai } = validateCapNhatTrangThaiNXB(req.body);
    const ketQua = await nhaXuatBanService.capNhatTrangThaiNXB(
      req.params.id,
      trangThai,
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/publishers/:id - Xóa NXB (khi chưa có sách tham chiếu)
const xoa = async (req, res, next) => {
  try {
    const ketQua = await nhaXuatBanService.xoaNXB(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Xoa nha xuat ban thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layDanhSach,
  layChiTiet,
  taoMoi,
  capNhat,
  doiTrangThai,
  xoa,
};

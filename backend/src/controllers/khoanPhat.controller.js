const khoanPhatService = require('../services/khoanPhat.service');
const {
  validateThanhToanPhat,
  validateMienHoacHuyPhat,
} = require('../validators/khoanPhat.validator');

// GET /api/fines/my-fines - Xem danh sách khoản phạt cá nhân
const layDanhSachCaNhan = async (req, res, next) => {
  try {
    const ketQua = await khoanPhatService.layDanhSachKhoanPhatCaNhan(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach khoan phat ca nhan thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/fines - Lấy danh sách khoản phạt
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await khoanPhatService.layDanhSachKhoanPhat(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach khoan phat thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/fines/:id - Lấy chi tiết khoản phạt
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await khoanPhatService.layChiTietKhoanPhat(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet khoan phat thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/fines/:id/pay - Xác nhận thanh toán khoản phạt
const thanhToan = async (req, res, next) => {
  try {
    const duLieuHopLe = validateThanhToanPhat(req.body);
    const ketQua = await khoanPhatService.thanhToanKhoanPhat(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Xac nhan thanh toan khoan phat thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/fines/:id/waive - Miễn phần tiền phạt còn nợ
const mienPhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateMienHoacHuyPhat(req.body, 'mien khoan phat');
    const ketQua = await khoanPhatService.mienKhoanPhat(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Mien khoan phat thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/fines/:id/cancel - Hủy khoản phạt ghi nhận sai
const huyPhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateMienHoacHuyPhat(req.body, 'huy khoan phat');
    const ketQua = await khoanPhatService.huyKhoanPhat(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Huy khoan phat thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layDanhSachCaNhan,
  layDanhSach,
  layChiTiet,
  thanhToan,
  mienPhat,
  huyPhat,
};

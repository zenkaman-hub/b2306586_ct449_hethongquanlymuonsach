const sachService = require('../services/sach.service');
const {
  validateTaoSach,
  validateCapNhatSach,
  validateDieuChinhTonKho,
  validateCapNhatTrangThaiSach,
} = require('../validators/sach.validator');

/**
 * GET /api/books
 * Lay danh sach dau sach (tim kiem, loc, phan trang)
 */
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await sachService.layDanhSachSach(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/books/:id
 * Lay chi tiet 1 dau sach
 */
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await sachService.layChiTietSach(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/books
 * Tao moi dau sach (QUAN_TRI, THU_THU)
 */
const taoMoi = async (req, res, next) => {
  try {
    const duLieuHopLe = validateTaoSach(req.body);
    const ketQua = await sachService.taoSach(
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(201).json({
      success: true,
      message: 'Tao dau sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/books/:id
 * Cap nhat thong tin co ban cua dau sach (QUAN_TRI, THU_THU)
 */
const capNhat = async (req, res, next) => {
  try {
    const duLieuHopLe = validateCapNhatSach(req.body);
    const ketQua = await sachService.capNhatSach(
      req.params.id,
      duLieuHopLe,
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat thong tin sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/books/:id/inventory
 * Dieu chinh so luong ton kho thu cong kem ly do va ghi nhat_ky_he_thong (QUAN_TRI, THU_THU)
 */
const dieuChinhTonKho = async (req, res, next) => {
  try {
    const duLieuHopLe = validateDieuChinhTonKho(req.body);
    const ketQua = await sachService.dieuChinhTonKho(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Dieu chinh so luong ton kho sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/books/:id/status
 * Doi trang thai luu thong sach (QUAN_TRI, THU_THU)
 */
const doiTrangThai = async (req, res, next) => {
  try {
    const { trangThaiLuuThong } = validateCapNhatTrangThaiSach(req.body);
    const ketQua = await sachService.capNhatTrangThaiLuuThong(
      req.params.id,
      trangThaiLuuThong,
      req.user.taiKhoanId
    );

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai luu thong sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/books/:id
 * Xoa dau sach (Chi cho phep khi chua phat sinh giao dich muon theo BR-11)
 */
const xoa = async (req, res, next) => {
  try {
    const ketQua = await sachService.xoaSach(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Xoa dau sach thanh cong',
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
  dieuChinhTonKho,
  doiTrangThai,
  xoa,
};

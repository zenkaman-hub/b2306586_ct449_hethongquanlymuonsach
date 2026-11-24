const docGiaService = require('../services/docGia.service');
const {
  validateTaoDocGia,
  validateCapNhatDocGia,
  validateCapNhatQuyenMuon,
  validateCapNhatTrangThaiTaiKhoan,
  validateCapNhatTrangThaiHoSo,
} = require('../validators/docGia.validator');

/**
 * GET /api/readers/me
 * Doc gia xem ho so ca nhan cua chinh minh (BR-02)
 */
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

/**
 * PUT /api/readers/me
 * Doc gia tu cap nhat thong tin ca nhan duoc phep
 */
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

/**
 * GET /api/readers
 * Lay danh sach doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * GET /api/readers/:id
 * Lay chi tiet ho so 1 doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * POST /api/readers
 * Nhan vien tao moi tai khoan va ho so doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * PUT /api/readers/:id
 * Nhan vien cap nhat thong tin ho so doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * PATCH /api/readers/:id/borrowing-status
 * Han che hoac mo quyen muon cua doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * PATCH /api/readers/:id/account-status
 * Khoa hoac mo khoa tai khoan dang nhap cua doc gia (QUAN_TRI, THU_THU)
 */
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

/**
 * PATCH /api/readers/:id/profile-status
 * Doi trang thai ho so doc gia HOAT_DONG / NGUNG_HOAT_DONG (QUAN_TRI, THU_THU)
 */
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

/**
 * DELETE /api/readers/:id
 * Xoa doc gia (Chi cho phep khi chua phat sinh giao dich theo BR-11)
 */
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

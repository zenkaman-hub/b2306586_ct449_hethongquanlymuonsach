const phieuMuonService = require('../services/phieuMuon.service');
const {
  validateLapPhieuMuon,
  validateTraSach,
  validateGiaHanMuon,
  validateHuyPhieuMuon,
} = require('../validators/phieuMuon.validator');

/**
 * GET /api/loans/my-history
 * Doc gia xem lich su phieu muon cua chinh minh (BR-02)
 */
const layLichSuCaNhan = async (req, res, next) => {
  try {
    const ketQua = await phieuMuonService.layLichSuMuonCuaDocGia(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: 'Lay lich su muon sach ca nhan thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/loans/overdue-items
 * Danh sach tat ca cac cuon sach dang qua han chua tra tren he thong (QUAN_TRI, THU_THU)
 */
const layDanhSachSachQuaHan = async (req, res, next) => {
  try {
    const ketQua = await phieuMuonService.layDanhSachSachQuaHan(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach sach qua han thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/loans
 * Lay danh sach phieu muon (QUAN_TRI, THU_THU)
 */
const layDanhSach = async (req, res, next) => {
  try {
    const ketQua = await phieuMuonService.layDanhSachPhieuMuon(req.query);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach phieu muon thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/loans/:id
 * Xem chi tiet 1 phieu muon (QUAN_TRI, THU_THU, hoac DOC_GIA so huu phieu)
 */
const layChiTiet = async (req, res, next) => {
  try {
    const ketQua = await phieuMuonService.layChiTietPhieuMuon(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Lay chi tiet phieu muon thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/loans
 * Lap phieu muon moi (QUAN_TRI, THU_THU - BR-01)
 */
const lapPhieuMuon = async (req, res, next) => {
  try {
    const duLieuHopLe = validateLapPhieuMuon(req.body);
    const ketQua = await phieuMuonService.lapPhieuMuon(duLieuHopLe, req.user);

    return res.status(201).json({
      success: true,
      message: 'Lap phieu muon sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/loans/:id/return
 * Xac nhan tra sach toan phan hoac tung phan, xu ly tra tre/hu hong/mat sach (QUAN_TRI, THU_THU)
 */
const traSach = async (req, res, next) => {
  try {
    const duLieuHopLe = validateTraSach(req.body);
    const ketQua = await phieuMuonService.traSach(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Xac nhan tra sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/loans/:id/extend
 * Gia han thoi gian muon cho 1 cuon sach trong phieu (QUAN_TRI, THU_THU)
 */
const giaHanMuon = async (req, res, next) => {
  try {
    const duLieuHopLe = validateGiaHanMuon(req.body);
    const ketQua = await phieuMuonService.giaHanMuon(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Gia han muon sach thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/loans/:id/cancel
 * Huy phieu muon lap sai khi chua co cuon sach nao duoc tra (QUAN_TRI, THU_THU)
 */
const huyPhieuMuon = async (req, res, next) => {
  try {
    const duLieuHopLe = validateHuyPhieuMuon(req.body);
    const ketQua = await phieuMuonService.huyPhieuMuon(
      req.params.id,
      duLieuHopLe,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Huy phieu muon thanh cong',
      data: ketQua,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  layLichSuCaNhan,
  layDanhSachSachQuaHan,
  layDanhSach,
  layChiTiet,
  lapPhieuMuon,
  traSach,
  giaHanMuon,
  huyPhieuMuon,
};

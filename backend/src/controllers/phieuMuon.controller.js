const phieuMuonService = require('../services/phieuMuon.service');
const {
  validateLapPhieuMuon,
  validateTraSach,
  validateGiaHanMuon,
  validateHuyPhieuMuon,
} = require('../validators/phieuMuon.validator');

// GET /api/loans/my-history - Xem lịch sử mượn sách cá nhân
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

// GET /api/loans/overdue-items - Lấy danh sách sách đang quá hạn
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

// GET /api/loans - Lấy danh sách phiếu mượn
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

// GET /api/loans/:id - Lấy chi tiết phiếu mượn
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

// POST /api/loans - Lập phiếu mượn mới
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

// POST /api/loans/:id/return - Xác nhận trả sách
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

// POST /api/loans/:id/extend - Gia hạn thời gian mượn sách
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

// PATCH /api/loans/:id/cancel - Hủy phiếu mượn khi chưa trả cuốn nào
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

const { NhaXuatBan, Sach } = require('../models');
const { TRANG_THAI_NXB } = require('../constants/enums');
const AppError = require('../utils/AppError');

// Tạo RegExp khớp chính xác, không phân biệt hoa/thường
const taoRegexKhopChinhXacKhongPhanBietHoaThuong = (chuoi) => {
  const escaped = chuoi.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

// Kiểm tra trùng tên NXB (không phân biệt hoa/thường)
const kiemTraTrungTenNXB = async (tenNXB, loaiTruId = null) => {
  const dieuKien = {
    tenNXB: taoRegexKhopChinhXacKhongPhanBietHoaThuong(tenNXB),
  };
  if (loaiTruId) {
    dieuKien._id = { $ne: loaiTruId };
  }

  const nxbTrungTen = await NhaXuatBan.findOne(dieuKien).lean();
  if (nxbTrungTen) {
    throw new AppError(
      `Ten nha xuat ban '${tenNXB}' da ton tai (trung voi '${nxbTrungTen.tenNXB}')`,
      409,
      'TEN_NXB_DA_TON_TAI',
      {
        nhaXuatBanTrungId: nxbTrungTen._id,
        maNXB: nxbTrungTen.maNXB,
        tenNXB: nxbTrungTen.tenNXB,
      }
    );
  }
};

// Sinh mã NXB tăng dần (NXB001, NXB002...)
const sinhMaNXBTiepTheo = async () => {
  const nxbCuoi = await NhaXuatBan.findOne({ maNXB: /^NXB\d+$/ })
    .sort({ maNXB: -1 })
    .lean();

  if (!nxbCuoi || !nxbCuoi.maNXB) {
    return 'NXB001';
  }

  const soHienTai = parseInt(nxbCuoi.maNXB.replace(/^NXB/, ''), 10) || 0;
  const soTiepTheo = soHienTai + 1;
  return `NXB${String(soTiepTheo).padStart(3, '0')}`;
};

// Lấy danh sách NXB có tìm kiếm, lọc và phân trang
const layDanhSachNXB = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.trangThai !== undefined && String(query.trangThai).trim() !== '') {
    const trangThai = String(query.trangThai).trim().toUpperCase();
    if (!Object.values(TRANG_THAI_NXB).includes(trangThai)) {
      throw new AppError(
        `Gia tri loc trangThai '${query.trangThai}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_NXB).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'trangThai', message: 'Gia tri loc trangThai khong hop le' }]
      );
    }
    filter.trangThai = trangThai;
  }

  const tuKhoa =
    typeof query.tuKhoa === 'string' && query.tuKhoa.trim() !== ''
      ? query.tuKhoa.trim()
      : typeof query.search === 'string' && query.search.trim() !== ''
        ? query.search.trim()
        : null;

  if (tuKhoa) {
    const escaped = tuKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ maNXB: regex }, { tenNXB: regex }, { diaChi: regex }];
  }

  const [danhSach, tongSo] = await Promise.all([
    NhaXuatBan.find(filter)
      .sort({ maNXB: 1, ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NhaXuatBan.countDocuments(filter),
  ]);

  // Đếm số đầu sách tham chiếu theo từng NXB trong trang hiện tại
  const danhSachIds = danhSach.map((item) => item._id);
  let mapSoDauSach = {};

  if (danhSachIds.length > 0) {
    const thongKeSach = await Sach.aggregate([
      { $match: { nhaXuatBanId: { $in: danhSachIds } } },
      { $group: { _id: '$nhaXuatBanId', soDauSach: { $sum: 1 } } },
    ]);

    mapSoDauSach = thongKeSach.reduce((acc, cur) => {
      acc[cur._id.toString()] = cur.soDauSach;
      return acc;
    }, {});
  }

  const danhSachKemThongKe = danhSach.map((item) => ({
    ...item,
    soDauSach: mapSoDauSach[item._id.toString()] || 0,
  }));

  return {
    danhSach: danhSachKemThongKe,
    phanTrang: {
      page,
      limit,
      totalItems: tongSo,
      totalPages: Math.ceil(tongSo / limit) || 1,
    },
  };
};

// Lấy chi tiết NXB theo ID
const layChiTietNXB = async (id) => {
  const nxb = await NhaXuatBan.findById(id).lean();
  if (!nxb) {
    throw new AppError(
      'Khong tim thay nha xuat ban',
      404,
      'KHONG_TIM_THAY_NXB'
    );
  }

  const soDauSach = await Sach.countDocuments({ nhaXuatBanId: nxb._id });

  return {
    ...nxb,
    soDauSach,
  };
};

// Tạo mới NXB
const taoNXB = async (duLieu, nguoiThucHienId) => {
  await kiemTraTrungTenNXB(duLieu.tenNXB);

  const maNXB = duLieu.maNXB || (await sinhMaNXBTiepTheo());

  const nxbTrungMa = await NhaXuatBan.findOne({
    maNXB: taoRegexKhopChinhXacKhongPhanBietHoaThuong(maNXB),
  }).lean();
  if (nxbTrungMa) {
    throw new AppError(
      `Ma nha xuat ban '${maNXB}' da ton tai`,
      409,
      'MA_NXB_DA_TON_TAI'
    );
  }

  const nxbMoi = await NhaXuatBan.create({
    maNXB,
    tenNXB: duLieu.tenNXB,
    diaChi: duLieu.diaChi,
    trangThai: duLieu.trangThai || TRANG_THAI_NXB.HOAT_DONG,
    nguoiTaoId: nguoiThucHienId,
    nguoiCapNhatId: nguoiThucHienId,
  });

  return {
    ...nxbMoi.toObject(),
    soDauSach: 0,
  };
};

// Cập nhật thông tin NXB
const capNhatNXB = async (id, duLieuCapNhat, nguoiThucHienId) => {
  const nxb = await NhaXuatBan.findById(id);
  if (!nxb) {
    throw new AppError(
      'Khong tim thay nha xuat ban',
      404,
      'KHONG_TIM_THAY_NXB'
    );
  }

  const maNXBCu = nxb.maNXB;

  if (duLieuCapNhat.maNXB && duLieuCapNhat.maNXB !== maNXBCu) {
    const nxbTrungMa = await NhaXuatBan.findOne({
      maNXB: taoRegexKhopChinhXacKhongPhanBietHoaThuong(duLieuCapNhat.maNXB),
      _id: { $ne: nxb._id },
    }).lean();

    if (nxbTrungMa) {
      throw new AppError(
        `Ma nha xuat ban '${duLieuCapNhat.maNXB}' da ton tai`,
        409,
        'MA_NXB_DA_TON_TAI'
      );
    }
    nxb.maNXB = duLieuCapNhat.maNXB;
  }

  if (duLieuCapNhat.tenNXB !== undefined) {
    await kiemTraTrungTenNXB(duLieuCapNhat.tenNXB, nxb._id);
    nxb.tenNXB = duLieuCapNhat.tenNXB;
  }
  if (duLieuCapNhat.diaChi !== undefined) {
    nxb.diaChi = duLieuCapNhat.diaChi;
  }
  if (duLieuCapNhat.trangThai !== undefined) {
    nxb.trangThai = duLieuCapNhat.trangThai;
  }

  nxb.nguoiCapNhatId = nguoiThucHienId;
  await nxb.save();

  // Đồng bộ maNXB trong collection sach khi maNXB thay đổi
  if (duLieuCapNhat.maNXB && duLieuCapNhat.maNXB !== maNXBCu) {
    await Sach.updateMany(
      { nhaXuatBanId: nxb._id },
      { $set: { maNXB: nxb.maNXB, nguoiCapNhatId: nguoiThucHienId } }
    );
  }

  const soDauSach = await Sach.countDocuments({ nhaXuatBanId: nxb._id });

  return {
    ...nxb.toObject(),
    soDauSach,
  };
};

// Đổi trạng thái NXB (soft delete theo BR-11)
const capNhatTrangThaiNXB = async (id, trangThai, nguoiThucHienId) => {
  const nxb = await NhaXuatBan.findById(id);
  if (!nxb) {
    throw new AppError(
      'Khong tim thay nha xuat ban',
      404,
      'KHONG_TIM_THAY_NXB'
    );
  }

  nxb.trangThai = trangThai;
  nxb.nguoiCapNhatId = nguoiThucHienId;
  await nxb.save();

  const soDauSach = await Sach.countDocuments({ nhaXuatBanId: nxb._id });

  return {
    ...nxb.toObject(),
    soDauSach,
  };
};

// Xóa NXB (BR-11: cấm xóa vật lý nếu còn sách tham chiếu)
const xoaNXB = async (id) => {
  const nxb = await NhaXuatBan.findById(id).lean();
  if (!nxb) {
    throw new AppError(
      'Khong tim thay nha xuat ban',
      404,
      'KHONG_TIM_THAY_NXB'
    );
  }

  const soDauSachThamChieu = await Sach.countDocuments({
    nhaXuatBanId: nxb._id,
  });

  if (soDauSachThamChieu > 0) {
    throw new AppError(
      `Khong the xoa nha xuat ban '${nxb.tenNXB}' vi dang co ${soDauSachThamChieu} dau sach tham chieu. Vui long chuyen trang thai sang NGUNG_HOAT_DONG.`,
      409,
      'NXB_DANG_CO_SACH_THAM_CHIEU',
      {
        nhaXuatBanId: nxb._id,
        maNXB: nxb.maNXB,
        soDauSachThamChieu,
      }
    );
  }

  await NhaXuatBan.deleteOne({ _id: nxb._id });

  return {
    _id: nxb._id,
    maNXB: nxb.maNXB,
    tenNXB: nxb.tenNXB,
  };
};

module.exports = {
  layDanhSachNXB,
  layChiTietNXB,
  taoNXB,
  capNhatNXB,
  capNhatTrangThaiNXB,
  xoaNXB,
};

const mongoose = require('mongoose');
const {
  Sach,
  NhaXuatBan,
  PhieuMuon,
  NhatKyHeThong,
} = require('../models');
const {
  TRANG_THAI_LUU_THONG_SACH,
  TRANG_THAI_NXB,
  HANH_DONG_NHAT_KY,
  TEN_COLLECTION,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

/**
 * Tao bieu thuc RegExp khop chinh xac chuoi khong phan biet hoa/thuong
 */
const taoRegexKhopChinhXacKhongPhanBietHoaThuong = (chuoi) => {
  const escaped = chuoi.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

/**
 * Tu dong sinh maSach tang dan (VD: S0001, S0002...)
 */
const sinhMaSachTiepTheo = async () => {
  const sachCuoi = await Sach.findOne({ maSach: /^S\d+$/ })
    .sort({ maSach: -1 })
    .lean();

  if (!sachCuoi || !sachCuoi.maSach) {
    return 'S0001';
  }

  const soHienTai = parseInt(sachCuoi.maSach.replace(/^S/, ''), 10) || 0;
  const soTiepTheo = soHienTai + 1;
  return `S${String(soTiepTheo).padStart(4, '0')}`;
};

/**
 * Kiem tra dau sach trung lap (cung tenSach, nguonGocTacGia, nhaXuatBanId, namXuatBan khong phan biet hoa/thuong)
 */
const kiemTraTrungDauSach = async (
  { tenSach, nguonGocTacGia, nhaXuatBanId, namXuatBan },
  loaiTruId = null
) => {
  const dieuKien = {
    tenSach: taoRegexKhopChinhXacKhongPhanBietHoaThuong(tenSach),
    nguonGocTacGia: taoRegexKhopChinhXacKhongPhanBietHoaThuong(nguonGocTacGia),
    nhaXuatBanId,
    namXuatBan,
  };

  if (loaiTruId) {
    dieuKien._id = { $ne: loaiTruId };
  }

  const sachTrung = await Sach.findOne(dieuKien).lean();
  if (sachTrung) {
    throw new AppError(
      `Dau sach '${tenSach}' (Tac gia: ${nguonGocTacGia}, Nam XB: ${namXuatBan}) cua nha xuat ban nay da ton tai (Ma sach: ${sachTrung.maSach})`,
      409,
      'DAU_SACH_DA_TON_TAI',
      {
        sachTrungId: sachTrung._id,
        maSach: sachTrung.maSach,
        tenSach: sachTrung.tenSach,
      }
    );
  }
};

/**
 * Lay danh sach Sach (tim kiem, loc theo NXB, trangThaiLuuThong, conSachKhaDung, phan trang)
 */
const layDanhSachSach = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Loc theo trangThaiLuuThong
  if (
    query.trangThaiLuuThong !== undefined &&
    String(query.trangThaiLuuThong).trim() !== ''
  ) {
    const trangThaiLuuThong = String(query.trangThaiLuuThong)
      .trim()
      .toUpperCase();
    if (!Object.values(TRANG_THAI_LUU_THONG_SACH).includes(trangThaiLuuThong)) {
      throw new AppError(
        `Gia tri loc trangThaiLuuThong '${query.trangThaiLuuThong}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_LUU_THONG_SACH).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'trangThaiLuuThong',
            message: 'Gia tri loc trangThaiLuuThong khong hop le',
          },
        ]
      );
    }
    filter.trangThaiLuuThong = trangThaiLuuThong;
  }

  // 2. Loc theo nhaXuatBanId
  if (
    query.nhaXuatBanId !== undefined &&
    String(query.nhaXuatBanId).trim() !== ''
  ) {
    const nxbIdStr = String(query.nhaXuatBanId).trim();
    if (!mongoose.Types.ObjectId.isValid(nxbIdStr)) {
      throw new AppError(
        'Gia tri loc nhaXuatBanId khong dung dinh dang ObjectId',
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'nhaXuatBanId', message: 'nhaXuatBanId khong hop le' }]
      );
    }
    filter.nhaXuatBanId = nxbIdStr;
  }

  // 3. Loc theo maNXB
  if (query.maNXB !== undefined && String(query.maNXB).trim() !== '') {
    filter.maNXB = String(query.maNXB).trim().toUpperCase();
  }

  // 4. Loc theo conSachKhaDung ('true' | 'false')
  if (
    query.conSachKhaDung !== undefined &&
    String(query.conSachKhaDung).trim() !== ''
  ) {
    const val = String(query.conSachKhaDung).trim().toLowerCase();
    if (val === 'true') {
      filter.soQuyenKhaDung = { $gt: 0 };
    } else if (val === 'false') {
      filter.soQuyenKhaDung = 0;
    } else {
      throw new AppError(
        "Gia tri loc conSachKhaDung chi chap nhan 'true' hoac 'false'",
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'conSachKhaDung', message: 'conSachKhaDung khong hop le' }]
      );
    }
  }

  // 5. Tim kiem theo tuKhoa (maSach, tenSach, nguonGocTacGia, maNXB)
  const tuKhoa =
    typeof query.tuKhoa === 'string' && query.tuKhoa.trim() !== ''
      ? query.tuKhoa.trim()
      : typeof query.search === 'string' && query.search.trim() !== ''
        ? query.search.trim()
        : null;

  if (tuKhoa) {
    const escaped = tuKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { maSach: regex },
      { tenSach: regex },
      { nguonGocTacGia: regex },
      { maNXB: regex },
    ];
  }

  const [danhSach, tongSo] = await Promise.all([
    Sach.find(filter)
      .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
      .sort({ maSach: 1, ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Sach.countDocuments(filter),
  ]);

  return {
    danhSach,
    phanTrang: {
      page,
      limit,
      totalItems: tongSo,
      totalPages: Math.ceil(tongSo / limit) || 1,
    },
  };
};

/**
 * Lay chi tiet 1 Dau sach theo _id
 */
const layChiTietSach = async (id) => {
  const sach = await Sach.findById(id)
    .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
    .lean();

  if (!sach) {
    throw new AppError(
      'Khong tim thay dau sach',
      404,
      'KHONG_TIM_THAY_SACH'
    );
  }

  return sach;
};

/**
 * Tao moi Dau sach (Muc 4.5 docs/db.md & Muc 5.10 PROJECT.md)
 */
const taoSach = async (duLieu, nguoiThucHienId) => {
  // 1. Kiem tra Nha xuat ban ton tai va dang HOAT_DONG
  const nxb = await NhaXuatBan.findById(duLieu.nhaXuatBanId).lean();
  if (!nxb) {
    throw new AppError(
      'Nha xuat ban khong ton tai',
      404,
      'KHONG_TIM_THAY_NXB'
    );
  }

  if (nxb.trangThai === TRANG_THAI_NXB.NGUNG_HOAT_DONG) {
    throw new AppError(
      `Nha xuat ban '${nxb.tenNXB}' da ngung hoat dong, khong the them sach moi cho NXB nay`,
      400,
      'NXB_NGUNG_HOAT_DONG'
    );
  }

  // 2. Kiem tra trung dau sach (tenSach + nguonGocTacGia + nhaXuatBanId + namXuatBan)
  await kiemTraTrungDauSach({
    tenSach: duLieu.tenSach,
    nguonGocTacGia: duLieu.nguonGocTacGia,
    nhaXuatBanId: nxb._id,
    namXuatBan: duLieu.namXuatBan,
  });

  // 3. Kiem tra hoac tu sinh maSach
  const maSach = duLieu.maSach || (await sinhMaSachTiepTheo());
  const sachTrungMa = await Sach.findOne({
    maSach: taoRegexKhopChinhXacKhongPhanBietHoaThuong(maSach),
  }).lean();

  if (sachTrungMa) {
    throw new AppError(
      `Ma sach '${maSach}' da ton tai`,
      409,
      'MA_SACH_DA_TON_TAI'
    );
  }

  // 4. Tinh toan ton kho theo bat bien: soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon - soQuyenHuHong
  const tongSoQuyen = duLieu.tongSoQuyen;
  const soQuyenDangMuon = 0;
  const soQuyenHuHong = duLieu.soQuyenHuHong || 0;
  const soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon - soQuyenHuHong;

  const sachMoi = await Sach.create({
    maSach,
    tenSach: duLieu.tenSach,
    donGia: duLieu.donGia,
    tongSoQuyen,
    soQuyenDangMuon,
    soQuyenHuHong,
    soQuyenKhaDung,
    soQuyenDaMat: 0,
    namXuatBan: duLieu.namXuatBan,
    nhaXuatBanId: nxb._id,
    maNXB: nxb.maNXB,
    nguonGocTacGia: duLieu.nguonGocTacGia,
    trangThaiLuuThong:
      duLieu.trangThaiLuuThong || TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG,
    nguoiTaoId: nguoiThucHienId,
    nguoiCapNhatId: nguoiThucHienId,
  });

  return Sach.findById(sachMoi._id)
    .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
    .lean();
};

/**
 * Cap nhat thong tin co ban cua Dau sach
 */
const capNhatSach = async (id, duLieuCapNhat, nguoiThucHienId) => {
  const sach = await Sach.findById(id);
  if (!sach) {
    throw new AppError(
      'Khong tim thay dau sach',
      404,
      'KHONG_TIM_THAY_SACH'
    );
  }

  // 1. Kiem tra neu doi maSach
  if (duLieuCapNhat.maSach && duLieuCapNhat.maSach !== sach.maSach) {
    const sachTrungMa = await Sach.findOne({
      maSach: taoRegexKhopChinhXacKhongPhanBietHoaThuong(duLieuCapNhat.maSach),
      _id: { $ne: sach._id },
    }).lean();

    if (sachTrungMa) {
      throw new AppError(
        `Ma sach '${duLieuCapNhat.maSach}' da ton tai`,
        409,
        'MA_SACH_DA_TON_TAI'
      );
    }
    sach.maSach = duLieuCapNhat.maSach;
  }

  // 2. Kiem tra neu doi nhaXuatBanId
  if (
    duLieuCapNhat.nhaXuatBanId &&
    duLieuCapNhat.nhaXuatBanId !== sach.nhaXuatBanId.toString()
  ) {
    const nxbMoi = await NhaXuatBan.findById(duLieuCapNhat.nhaXuatBanId).lean();
    if (!nxbMoi) {
      throw new AppError(
        'Nha xuat ban khong ton tai',
        404,
        'KHONG_TIM_THAY_NXB'
      );
    }
    if (nxbMoi.trangThai === TRANG_THAI_NXB.NGUNG_HOAT_DONG) {
      throw new AppError(
        `Nha xuat ban '${nxbMoi.tenNXB}' da ngung hoat dong, khong the chuyen sach sang NXB nay`,
        400,
        'NXB_NGUNG_HOAT_DONG'
      );
    }
    sach.nhaXuatBanId = nxbMoi._id;
    sach.maNXB = nxbMoi.maNXB;
  }

  if (duLieuCapNhat.tenSach !== undefined) {
    sach.tenSach = duLieuCapNhat.tenSach;
  }
  if (duLieuCapNhat.donGia !== undefined) {
    sach.donGia = duLieuCapNhat.donGia;
  }
  if (duLieuCapNhat.namXuatBan !== undefined) {
    sach.namXuatBan = duLieuCapNhat.namXuatBan;
  }
  if (duLieuCapNhat.nguonGocTacGia !== undefined) {
    sach.nguonGocTacGia = duLieuCapNhat.nguonGocTacGia;
  }
  if (duLieuCapNhat.trangThaiLuuThong !== undefined) {
    sach.trangThaiLuuThong = duLieuCapNhat.trangThaiLuuThong;
  }

  // 3. Kiem tra trung dau sach sau khi ap dung cac thay doi
  await kiemTraTrungDauSach(
    {
      tenSach: sach.tenSach,
      nguonGocTacGia: sach.nguonGocTacGia,
      nhaXuatBanId: sach.nhaXuatBanId,
      namXuatBan: sach.namXuatBan,
    },
    sach._id
  );

  sach.nguoiCapNhatId = nguoiThucHienId;
  await sach.save();

  return Sach.findById(sach._id)
    .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
    .lean();
};

/**
 * Dieu chinh so luong ton kho thu cong (Muc 4.5 docs/db.md & Muc 5.10 PROJECT.md):
 * - Luon thoa bat bien: soQuyenKhaDung = tongSoQuyen - soQuyenDangMuon - soQuyenHuHong
 * - Chi cho phep khi: tongSoQuyenMoi >= soQuyenDangMuon + soQuyenHuHongMoi
 * - Bat buoc ghi nhat_ky_he_thong voi hanhDong = DIEU_CHINH_SO_LUONG_SACH kem lyDo (BR-12)
 */
const dieuChinhTonKho = async (id, duLieuDieuChinh, user) => {
  const sach = await Sach.findById(id);
  if (!sach) {
    throw new AppError(
      'Khong tim thay dau sach',
      404,
      'KHONG_TIM_THAY_SACH'
    );
  }

  const tongSoQuyenMoi =
    duLieuDieuChinh.tongSoQuyen !== undefined
      ? duLieuDieuChinh.tongSoQuyen
      : sach.tongSoQuyen;

  const soQuyenHuHongMoi =
    duLieuDieuChinh.soQuyenHuHong !== undefined
      ? duLieuDieuChinh.soQuyenHuHong
      : sach.soQuyenHuHong;

  const soQuyenToiThieu = sach.soQuyenDangMuon + soQuyenHuHongMoi;

  if (tongSoQuyenMoi < soQuyenToiThieu) {
    throw new AppError(
      `Khong the dieu chinh tongSoQuyen (${tongSoQuyenMoi}) nho hon tong so quyen dang muon (${sach.soQuyenDangMuon}) va so quyen hu hong (${soQuyenHuHongMoi})`,
      400,
      'VI_PHAM_BAT_BIEN_TON_KHO',
      {
        tongSoQuyenYeuCau: tongSoQuyenMoi,
        soQuyenDangMuon: sach.soQuyenDangMuon,
        soQuyenHuHong: soQuyenHuHongMoi,
        tongSoQuyenToiThieu: soQuyenToiThieu,
      }
    );
  }

  if (
    tongSoQuyenMoi === sach.tongSoQuyen &&
    soQuyenHuHongMoi === sach.soQuyenHuHong
  ) {
    throw new AppError(
      'So luong ton kho moi khong co su thay doi so voi hien tai',
      400,
      'DU_LIEU_KHONG_THAY_DOI'
    );
  }

  const duLieuTruoc = {
    tongSoQuyen: sach.tongSoQuyen,
    soQuyenDangMuon: sach.soQuyenDangMuon,
    soQuyenHuHong: sach.soQuyenHuHong,
    soQuyenKhaDung: sach.soQuyenKhaDung,
    soQuyenDaMat: sach.soQuyenDaMat,
  };

  const soQuyenKhaDungMoi =
    tongSoQuyenMoi - sach.soQuyenDangMuon - soQuyenHuHongMoi;

  sach.tongSoQuyen = tongSoQuyenMoi;
  sach.soQuyenHuHong = soQuyenHuHongMoi;
  sach.soQuyenKhaDung = soQuyenKhaDungMoi;
  sach.nguoiCapNhatId = user.taiKhoanId;

  await sach.save();

  const duLieuSau = {
    tongSoQuyen: sach.tongSoQuyen,
    soQuyenDangMuon: sach.soQuyenDangMuon,
    soQuyenHuHong: sach.soQuyenHuHong,
    soQuyenKhaDung: sach.soQuyenKhaDung,
    soQuyenDaMat: sach.soQuyenDaMat,
  };

  // Ghi nhat_ky_he_thong (BR-12)
  await NhatKyHeThong.create({
    hanhDong: HANH_DONG_NHAT_KY.DIEU_CHINH_SO_LUONG_SACH,
    doiTuongCollection: TEN_COLLECTION.SACH,
    doiTuongId: sach._id,
    nguoiThucHienId: user.taiKhoanId,
    vaiTroNguoiThucHien: user.vaiTro,
    duLieuTruoc,
    duLieuSau,
    lyDo: duLieuDieuChinh.lyDo,
    thoiDiem: new Date(),
  });

  return Sach.findById(sach._id)
    .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
    .lean();
};

/**
 * Doi trang thai luu thong Sach (DANG_LUU_THONG | TAM_NGUNG | NGUNG_LUU_THONG)
 */
const capNhatTrangThaiLuuThong = async (
  id,
  trangThaiLuuThong,
  nguoiThucHienId
) => {
  const sach = await Sach.findById(id);
  if (!sach) {
    throw new AppError(
      'Khong tim thay dau sach',
      404,
      'KHONG_TIM_THAY_SACH'
    );
  }

  sach.trangThaiLuuThong = trangThaiLuuThong;
  sach.nguoiCapNhatId = nguoiThucHienId;
  await sach.save();

  return Sach.findById(sach._id)
    .populate('nhaXuatBanId', 'maNXB tenNXB diaChi trangThai')
    .lean();
};

/**
 * Xoa Dau sach (BR-11 & Muc 5.2 docs/db.md):
 * - Cam xoa vat ly neu sach dang co soQuyenDangMuon > 0 hoac da tung phat sinh giao dich trong phieu_muon
 */
const xoaSach = async (id) => {
  const sach = await Sach.findById(id).lean();
  if (!sach) {
    throw new AppError(
      'Khong tim thay dau sach',
      404,
      'KHONG_TIM_THAY_SACH'
    );
  }

  const soPhieuMuonLienQuan = await PhieuMuon.countDocuments({
    'chiTietMuon.sachId': sach._id,
  });

  if (sach.soQuyenDangMuon > 0 || soPhieuMuonLienQuan > 0) {
    throw new AppError(
      `Khong the xoa dau sach '${sach.tenSach}' vi da phat sinh giao dich muon tra (${soPhieuMuonLienQuan} phieu muon). Vui long chuyen trangThaiLuuThong sang NGUNG_LUU_THONG.`,
      409,
      'SACH_DA_PHAT_SINH_GIAO_DICH',
      {
        sachId: sach._id,
        maSach: sach.maSach,
        soQuyenDangMuon: sach.soQuyenDangMuon,
        soPhieuMuonLienQuan,
      }
    );
  }

  await Sach.deleteOne({ _id: sach._id });

  return {
    _id: sach._id,
    maSach: sach.maSach,
    tenSach: sach.tenSach,
  };
};

module.exports = {
  layDanhSachSach,
  layChiTietSach,
  taoSach,
  capNhatSach,
  dieuChinhTonKho,
  capNhatTrangThaiLuuThong,
  xoaSach,
};

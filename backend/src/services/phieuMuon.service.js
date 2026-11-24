const mongoose = require('mongoose');
const {
  PhieuMuon,
  DocGia,
  NhanVien,
  Sach,
  KhoanPhat,
  CauHinhThuVien,
  NhatKyHeThong,
  TaiKhoan,
} = require('../models');
const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  TRANG_THAI_LUU_THONG_SACH,
  TRANG_THAI_PHIEU_MUON,
  TRANG_THAI_CHI_TIET_MUON,
  TINH_TRANG_KHI_TRA,
  LOAI_PHAT,
  TRANG_THAI_KHOAN_PHAT,
  HANH_DONG_NHAT_KY,
  MA_CAU_HINH,
  TEN_COLLECTION,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const MS_MOT_NGAY = 24 * 60 * 60 * 1000;

/**
 * Kiem tra loi MongoDB khong ho tro Transaction tren Standalone instance
 */
const laLoiKhongHoTroTransaction = (error) => {
  if (!error || !error.message) return false;
  return (
    error.message.includes('Transaction numbers are only allowed on a replica set') ||
    error.message.includes('transactions are not supported')
  );
};

/**
 * Lay cau hinh thu vien mac dinh
 */
const layCauHinhMacDinh = async (session = null) => {
  const query = CauHinhThuVien.findOne({ maCauHinh: MA_CAU_HINH.MAC_DINH });
  if (session) {
    query.session(session);
  }
  return query.lean();
};

/**
 * Chuan hoa moc thoi gian ve cuoi ngay (23:59:59.999) hoac dau ngay (00:00:00.000) de tinh ngay lich
 */
const duaVeDauNgay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const duaVeCuoiNgay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Tinh so ngay tre theo ngay lich (Muc 5.5 PROJECT.md)
 * Neu ngayTra <= hanTra (tinh theo ngay lich) -> soNgayTre = 0
 */
const tinhSoNgayTre = (hanTra, ngayDoiChieu = new Date()) => {
  const mocHanTra = duaVeDauNgay(hanTra);
  const mocDoiChieu = duaVeDauNgay(ngayDoiChieu);
  const chenhLechMs = mocDoiChieu.getTime() - mocHanTra.getTime();
  if (chenhLechMs <= 0) {
    return 0;
  }
  return Math.round(chenhLechMs / MS_MOT_NGAY);
};

/**
 * Format YYYYMMDD de sinh maPhieuMuon va maKhoanPhat
 */
const formatNgayYYYYMMDD = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

/**
 * Sinh maPhieuMuon duy nhat (VD: PM20261124-0001)
 */
const sinhMaPhieuMuonTiepTheo = async (session = null) => {
  const prefix = `PM${formatNgayYYYYMMDD()}-`;
  const regex = new RegExp(`^${prefix}\\d+$`);
  const query = PhieuMuon.findOne({ maPhieuMuon: regex }).sort({
    maPhieuMuon: -1,
  });
  if (session) {
    query.session(session);
  }
  const phieuCuoi = await query.lean();
  if (!phieuCuoi || !phieuCuoi.maPhieuMuon) {
    return `${prefix}0001`;
  }
  const soHienTai =
    parseInt(phieuCuoi.maPhieuMuon.replace(prefix, ''), 10) || 0;
  return `${prefix}${String(soHienTai + 1).padStart(4, '0')}`;
};

/**
 * Sinh maKhoanPhat duy nhat (VD: KP20261124-0001)
 */
const sinhSoThuTuKhoanPhatBatDau = async (session = null) => {
  const prefix = `KP${formatNgayYYYYMMDD()}-`;
  const regex = new RegExp(`^${prefix}\\d+$`);
  const query = KhoanPhat.findOne({ maKhoanPhat: regex }).sort({
    maKhoanPhat: -1,
  });
  if (session) {
    query.session(session);
  }
  const kpCuoi = await query.lean();
  if (!kpCuoi || !kpCuoi.maKhoanPhat) {
    return { prefix, nextNumber: 1 };
  }
  const soHienTai =
    parseInt(kpCuoi.maKhoanPhat.replace(prefix, ''), 10) || 0;
  return { prefix, nextNumber: soHienTai + 1 };
};

/**
 * Tu dong dong bo trangThai = QUA_HAN cho cac chiTietMuon dang DANG_MUON nhung da qua hanTra (BR-09)
 */
const dongBoTrangThaiQuaHan = async (filterPhieu = {}) => {
  const dauNgayHomNay = duaVeDauNgay(new Date());

  await PhieuMuon.updateMany(
    {
      ...filterPhieu,
      trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
      chiTietMuon: {
        $elemMatch: {
          trangThai: TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
          hanTra: { $lt: dauNgayHomNay },
        },
      },
    },
    {
      $set: {
        'chiTietMuon.$[elem].trangThai': TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
        'chiTietMuon.$[elem].ngayCapNhatChiTiet': new Date(),
      },
    },
    {
      arrayFilters: [
        {
          'elem.trangThai': TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
          'elem.hanTra': { $lt: dauNgayHomNay },
        },
      ],
    }
  );
};

/**
 * Lay nhanVienId tu req.user (neu user la QUAN_TRI hoac THU_THU)
 */
const layNhanVienThucHien = async (user, session = null) => {
  if (user.hoSoId) {
    const q = NhanVien.findById(user.hoSoId);
    if (session) q.session(session);
    const nv = await q.lean();
    if (nv) return nv;
  }

  const q = NhanVien.findOne({ taiKhoanId: user.taiKhoanId });
  if (session) q.session(session);
  const nv = await q.lean();
  if (!nv) {
    throw new AppError(
      'Khong tim thay ho so nhan vien cua tai khoan dang dang nhap',
      403,
      'KHONG_TIM_THAY_HO_SO_NHAN_VIEN'
    );
  }
  return nv;
};

/**
 * Lay danh sach Phieu muon (danh cho QUAN_TRI va THU_THU)
 */
const layDanhSachPhieuMuon = async (query = {}, boQuaDongBoQuaHan = false) => {
  if (!boQuaDongBoQuaHan) {
    await dongBoTrangThaiQuaHan();
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Loc theo trangThai phieu (DANG_MO | HOAN_TAT | DA_HUY)
  if (query.trangThai !== undefined && String(query.trangThai).trim() !== '') {
    const trangThai = String(query.trangThai).trim().toUpperCase();
    if (!Object.values(TRANG_THAI_PHIEU_MUON).includes(trangThai)) {
      throw new AppError(
        `Gia tri loc trangThai '${query.trangThai}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_PHIEU_MUON).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'trangThai', message: 'Gia tri loc trangThai khong hop le' }]
      );
    }
    filter.trangThai = trangThai;
  }

  // 2. Loc theo docGiaId
  if (query.docGiaId !== undefined && String(query.docGiaId).trim() !== '') {
    const dgId = String(query.docGiaId).trim();
    if (!mongoose.Types.ObjectId.isValid(dgId)) {
      throw new AppError(
        'Gia tri loc docGiaId khong dung dinh dang ObjectId',
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'docGiaId', message: 'docGiaId khong hop le' }]
      );
    }
    filter.docGiaId = dgId;
  }

  // 3. Loc theo maDocGia
  if (query.maDocGia !== undefined && String(query.maDocGia).trim() !== '') {
    filter.maDocGia = String(query.maDocGia).trim().toUpperCase();
  }

  // 4. Loc theo coSachQuaHan ('true' | 'false')
  if (
    query.coSachQuaHan !== undefined &&
    String(query.coSachQuaHan).trim() !== ''
  ) {
    const val = String(query.coSachQuaHan).trim().toLowerCase();
    if (val === 'true') {
      filter['chiTietMuon.trangThai'] = TRANG_THAI_CHI_TIET_MUON.QUA_HAN;
    } else if (val === 'false') {
      filter['chiTietMuon.trangThai'] = {
        $ne: TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
      };
    } else {
      throw new AppError(
        "Gia tri loc coSachQuaHan chi chap nhan 'true' hoac 'false'",
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'coSachQuaHan', message: 'coSachQuaHan khong hop le' }]
      );
    }
  }

  // 5. Loc theo khoang ngayMuon (tuNgay, denNgay)
  if (query.tuNgay || query.denNgay) {
    filter.ngayMuon = {};
    if (query.tuNgay) {
      const tuNgay = new Date(query.tuNgay);
      if (Number.isNaN(tuNgay.getTime())) {
        throw new AppError(
          'Gia tri loc tuNgay khong hop le',
          400,
          'DU_LIEU_KHONG_HOP_LE',
          [{ field: 'tuNgay', message: 'tuNgay khong hop le' }]
        );
      }
      filter.ngayMuon.$gte = duaVeDauNgay(tuNgay);
    }
    if (query.denNgay) {
      const denNgay = new Date(query.denNgay);
      if (Number.isNaN(denNgay.getTime())) {
        throw new AppError(
          'Gia tri loc denNgay khong hop le',
          400,
          'DU_LIEU_KHONG_HOP_LE',
          [{ field: 'denNgay', message: 'denNgay khong hop le' }]
        );
      }
      filter.ngayMuon.$lte = duaVeCuoiNgay(denNgay);
    }
  }

  // 6. Tim kiem theo tuKhoa (maPhieuMuon, maDocGia, chiTietMuon.maSach, chiTietMuon.tenSach)
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
      { maPhieuMuon: regex },
      { maDocGia: regex },
      { 'chiTietMuon.maSach': regex },
      { 'chiTietMuon.tenSach': regex },
    ];
  }

  const [danhSach, tongSo] = await Promise.all([
    PhieuMuon.find(filter)
      .populate(
        'docGiaId',
        'maDocGia hoLot ten dienThoai trangThaiQuyenMuon soSachDangMuon tongTienPhatChuaTra'
      )
      .populate('nhanVienLapId', 'msnv hoTenNV chucVu')
      .sort({ ngayMuon: -1, ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PhieuMuon.countDocuments(filter),
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
 * Doc gia xem lich su muon tra cua chinh minh (BR-02)
 */
const layLichSuMuonCuaDocGia = async (user, query = {}) => {
  const docGia = await DocGia.findOne({ taiKhoanId: user.taiKhoanId }).lean();
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia lien ket voi tai khoan nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  await dongBoTrangThaiQuaHan({ docGiaId: docGia._id });

  return layDanhSachPhieuMuon(
    {
      ...query,
      docGiaId: docGia._id.toString(),
    },
    true
  );
};

/**
 * Lay danh sach tat ca cac cuon sach dang qua han chua tra tren toan he thong (Muc 5.6 PROJECT.md)
 */
const layDanhSachSachQuaHan = async (query = {}) => {
  await dongBoTrangThaiQuaHan();

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const dsPhieuQuaHan = await PhieuMuon.find({
    trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
    'chiTietMuon.trangThai': TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
  })
    .populate(
      'docGiaId',
      'maDocGia hoLot ten dienThoai diaChi trangThaiQuyenMuon tongTienPhatChuaTra'
    )
    .populate('nhanVienLapId', 'msnv hoTenNV')
    .sort({ ngayMuon: 1 })
    .lean();

  const cauHinh = await layCauHinhMacDinh();
  const mucPhatMoiNgay =
    cauHinh && typeof cauHinh.tienPhatTraTreMoiNgay === 'number'
      ? cauHinh.tienPhatTraTreMoiNgay
      : 2000;

  const tatCaChiTietQuaHan = [];
  const homNay = new Date();

  for (const phieu of dsPhieuQuaHan) {
    for (const ct of phieu.chiTietMuon) {
      if (ct.trangThai === TRANG_THAI_CHI_TIET_MUON.QUA_HAN) {
        const soNgayTreTamTinh = tinhSoNgayTre(ct.hanTra, homNay);
        tatCaChiTietQuaHan.push({
          phieuMuonId: phieu._id,
          maPhieuMuon: phieu.maPhieuMuon,
          ngayMuon: phieu.ngayMuon,
          docGia: phieu.docGiaId,
          maDocGia: phieu.maDocGia,
          chiTietMuon: {
            ...ct,
            soNgayTreTamTinh,
            tienPhatTamTinh: soNgayTreTamTinh * mucPhatMoiNgay,
          },
        });
      }
    }
  }

  const tongSo = tatCaChiTietQuaHan.length;
  const danhSach = tatCaChiTietQuaHan.slice(skip, skip + limit);

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
 * Lay chi tiet 1 Phieu muon theo _id (BR-02: DOC_GIA chi duoc xem phieu cua chinh minh)
 */
const layChiTietPhieuMuon = async (id, user = null) => {
  await dongBoTrangThaiQuaHan({ _id: id });

  const phieuMuon = await PhieuMuon.findById(id)
    .populate(
      'docGiaId',
      'maDocGia hoLot ten dienThoai diaChi trangThaiQuyenMuon soSachDangMuon tongTienPhatChuaTra'
    )
    .populate('nhanVienLapId', 'msnv hoTenNV chucVu')
    .populate('nguoiHuyId', 'msnv hoTenNV chucVu')
    .populate('chiTietMuon.nhanVienXacNhanTraId', 'msnv hoTenNV chucVu')
    .lean();

  if (!phieuMuon) {
    throw new AppError(
      'Khong tim thay phieu muon',
      404,
      'KHONG_TIM_THAY_PHIEU_MUON'
    );
  }

  // BR-02: Neu nguoi goi la DOC_GIA, kiem tra phieu muon phai thuoc ve chinh doc gia do
  if (user && user.vaiTro === VAI_TRO.DOC_GIA) {
    const docGia = await DocGia.findOne({ taiKhoanId: user.taiKhoanId })
      .select('_id')
      .lean();
    const docGiaIdCuaPhieu =
      phieuMuon.docGiaId && phieuMuon.docGiaId._id
        ? phieuMuon.docGiaId._id.toString()
        : phieuMuon.docGiaId.toString();

    if (!docGia || docGia._id.toString() !== docGiaIdCuaPhieu) {
      throw new AppError(
        'Ban khong co quyen xem phieu muon cua doc gia khac (BR-02)',
        403,
        'KHONG_DU_QUYEN'
      );
    }
  }

  const danhSachKhoanPhat = await KhoanPhat.find({
    phieuMuonId: phieuMuon._id,
  })
    .populate('nguoiTaoId', 'msnv hoTenNV')
    .populate('nguoiXuLyId', 'msnv hoTenNV')
    .sort({ ngayTao: -1 })
    .lean();

  return {
    ...phieuMuon,
    danhSachKhoanPhat,
  };
};

/**
 * Logic cot loi: Lap Phieu muon (Muc 5.3 PROJECT.md, BR-01, BR-05, BR-06, BR-07, BR-12, BR-14)
 */
const thucThiLapPhieuMuon = async (duLieu, user, session = null) => {
  const nhanVien = await layNhanVienThucHien(user, session);
  const cauHinh = await layCauHinhMacDinh(session);

  const soNgayMuonMacDinh =
    cauHinh && typeof cauHinh.soNgayMuonMacDinh === 'number'
      ? cauHinh.soNgayMuonMacDinh
      : 14;
  const soSachMuonToiDa =
    cauHinh && typeof cauHinh.soSachMuonToiDa === 'number'
      ? cauHinh.soSachMuonToiDa
      : 5;
  const hanCheMuonKhiCoViPham =
    cauHinh && typeof cauHinh.hanCheMuonKhiCoViPham === 'boolean'
      ? cauHinh.hanCheMuonKhiCoViPham
      : true;

  // 1. Tim va kiem tra Doc gia
  const docGiaQuery = duLieu.docGiaId
    ? DocGia.findById(duLieu.docGiaId)
    : DocGia.findOne({ maDocGia: duLieu.maDocGia });
  if (session) docGiaQuery.session(session);
  const docGia = await docGiaQuery;

  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  if (docGia.trangThaiHoSo !== TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG) {
    throw new AppError(
      `Ho so doc gia '${docGia.maDocGia}' da ngung hoat dong, khong the lap phieu muon`,
      403,
      'HO_SO_DOC_GIA_NGUNG_HOAT_DONG'
    );
  }

  const tkDocGiaQuery = TaiKhoan.findById(docGia.taiKhoanId);
  if (session) tkDocGiaQuery.session(session);
  const tkDocGia = await tkDocGiaQuery.lean();

  if (!tkDocGia || tkDocGia.trangThai !== TRANG_THAI_TAI_KHOAN.HOAT_DONG) {
    throw new AppError(
      `Tai khoan cua doc gia '${docGia.maDocGia}' dang bi khoa hoac chua kich hoat, khong the lap phieu muon`,
      403,
      'TAI_KHOAN_DOC_GIA_KHONG_HOAT_DONG'
    );
  }

  if (docGia.trangThaiQuyenMuon !== TRANG_THAI_QUYEN_MUON.DUOC_MUON) {
    throw new AppError(
      docGia.lyDoHanCheMuon
        ? `Doc gia '${docGia.maDocGia}' dang bi han che quyen muon. Ly do: ${docGia.lyDoHanCheMuon}`
        : `Doc gia '${docGia.maDocGia}' dang bi han che quyen muon`,
      403,
      'DOC_GIA_BI_HAN_CHE_MUON'
    );
  }

  // Kiem tra vi pham (no phat hoac sach dang qua han chua tra) neu chinh sach bat hanCheMuonKhiCoViPham
  if (hanCheMuonKhiCoViPham) {
    if (docGia.tongTienPhatChuaTra > 0) {
      throw new AppError(
        `Doc gia '${docGia.maDocGia}' dang con no tien phat chua thanh toan (${docGia.tongTienPhatChuaTra} VND), khong the muon them sach`,
        403,
        'DOC_GIA_CON_NO_PHAT'
      );
    }

    const dauNgayHomNay = duaVeDauNgay(new Date());
    const phieuQuaHanQuery = PhieuMuon.findOne({
      docGiaId: docGia._id,
      trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
      chiTietMuon: {
        $elemMatch: {
          trangThai: {
            $in: [
              TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
              TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
            ],
          },
          hanTra: { $lt: dauNgayHomNay },
        },
      },
    });
    if (session) phieuQuaHanQuery.session(session);
    const coPhieuQuaHan = await phieuQuaHanQuery.lean();

    if (coPhieuQuaHan) {
      throw new AppError(
        `Doc gia '${docGia.maDocGia}' dang co sach qua han chua tra (Phieu: ${coPhieuQuaHan.maPhieuMuon}), vui long tra sach qua han truoc khi muon moi`,
        403,
        'DOC_GIA_CO_SACH_QUA_HAN_CHUA_TRA'
      );
    }
  }

  // 2. Kiem tra gioi han so sach muon (BR-06)
  const soLuongMuonMoi = duLieu.danhSachSach.length;
  const tongSauKhiMuon = docGia.soSachDangMuon + soLuongMuonMoi;

  if (tongSauKhiMuon > soSachMuonToiDa) {
    throw new AppError(
      `Vuot qua gioi han so sach duoc muon. Doc gia dang muon ${docGia.soSachDangMuon} quyen, yeu cau muon them ${soLuongMuonMoi} quyen (Toi da cho phep: ${soSachMuonToiDa} quyen)`,
      400,
      'VUOT_GIOI_HAN_SO_SACH_MUON',
      {
        soSachDangMuon: docGia.soSachDangMuon,
        soLuongYeuCauMuon: soLuongMuonMoi,
        soSachMuonToiDa,
      }
    );
  }

  // 3. Kiem tra va tru ton kho nguyen tu cho tung cuon sach (BR-05, BR-14)
  const ngayMuon = new Date();
  const hanTraMacDinh = duaVeCuoiNgay(
    new Date(ngayMuon.getTime() + soNgayMuonMacDinh * MS_MOT_NGAY)
  );

  const tapSachIdDaChon = new Set();
  const chiTietMuonArr = [];
  const dsSachDaTruTonKho = []; // Dung de rollback thu cong neu chạy tren Standalone MongoDB

  try {
    for (const item of duLieu.danhSachSach) {
      const sachQuery = item.sachId
        ? Sach.findById(item.sachId)
        : Sach.findOne({ maSach: item.maSach });
      if (session) sachQuery.session(session);
      const sach = await sachQuery.lean();

      if (!sach) {
        throw new AppError(
          `Khong tim thay dau sach (${item.sachId || item.maSach})`,
          404,
          'KHONG_TIM_THAY_SACH'
        );
      }

      const sachIdStr = sach._id.toString();
      if (tapSachIdDaChon.has(sachIdStr)) {
        throw new AppError(
          `Dau sach '${sach.maSach} - ${sach.tenSach}' bi trung lap trong danh sach muon`,
          400,
          'SACH_BI_TRUNG_TRONG_PHIEU'
        );
      }
      tapSachIdDaChon.add(sachIdStr);

      // Kiem tra doc gia co dang muon cuon sach nay chua tra trong phieu khac khong
      const dangMuonCuonNayQuery = PhieuMuon.findOne({
        docGiaId: docGia._id,
        trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
        chiTietMuon: {
          $elemMatch: {
            sachId: sach._id,
            trangThai: {
              $in: [
                TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
                TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
              ],
            },
          },
        },
      });
      if (session) dangMuonCuonNayQuery.session(session);
      const phieuDangMuonCuonNay = await dangMuonCuonNayQuery.lean();

      if (phieuDangMuonCuonNay) {
        throw new AppError(
          `Doc gia dang muon dau sach '${sach.maSach} - ${sach.tenSach}' chua tra (Phieu: ${phieuDangMuonCuonNay.maPhieuMuon})`,
          409,
          'DOC_GIA_DANG_MUON_DAU_SACH_NAY'
        );
      }

      if (sach.trangThaiLuuThong !== TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG) {
        throw new AppError(
          `Dau sach '${sach.maSach} - ${sach.tenSach}' hien khong duoc phep luu thong (Trang thai: ${sach.trangThaiLuuThong})`,
          400,
          'SACH_KHONG_DUOC_LUU_THONG'
        );
      }

      // Tinh hanTra rieng cho cuon sach nay (BR-07)
      const hanTraCuon = item.hanTra
        ? duaVeCuoiNgay(item.hanTra)
        : hanTraMacDinh;

      if (hanTraCuon.getTime() <= ngayMuon.getTime()) {
        throw new AppError(
          `Han tra cua sach '${sach.maSach}' phai lon hon thoi diem lap phieu muon`,
          400,
          'HAN_TRA_KHONG_HOP_LE'
        );
      }

      // Cap nhat nguyen tu: soQuyenKhaDung >= 1 va trangThaiLuuThong = DANG_LUU_THONG (BR-05, BR-14)
      const sachSauKhiTru = await Sach.findOneAndUpdate(
        {
          _id: sach._id,
          trangThaiLuuThong: TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG,
          soQuyenKhaDung: { $gte: 1 },
        },
        {
          $inc: {
            soQuyenDangMuon: 1,
            soQuyenKhaDung: -1,
          },
          $set: {
            nguoiCapNhatId: user.taiKhoanId,
          },
        },
        {
          returnDocument: 'after',
          ...(session ? { session } : {}),
        }
      );

      if (!sachSauKhiTru) {
        throw new AppError(
          `Dau sach '${sach.maSach} - ${sach.tenSach}' da het so luong kha dung (soQuyenKhaDung = 0)`,
          409,
          'SACH_HET_SO_LUONG_KHA_DUNG',
          {
            sachId: sach._id,
            maSach: sach.maSach,
            tenSach: sach.tenSach,
          }
        );
      }

      dsSachDaTruTonKho.push(sach._id);

      chiTietMuonArr.push({
        _id: new mongoose.Types.ObjectId(),
        sachId: sach._id,
        maSach: sach.maSach,
        tenSach: sach.tenSach,
        donGiaTaiThoiDiemMuon: sach.donGia,
        hanTra: hanTraCuon,
        ngayTraThucTe: null,
        trangThai: TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
        tinhTrangKhiTra: null,
        moTaHuHong: null,
        soNgayTre: 0,
        soLanDaGiaHan: 0,
        lichSuGiaHan: [],
        nhanVienXacNhanTraId: null,
        ngayCapNhatChiTiet: ngayMuon,
      });
    }

    // 4. Tao Phieu muon
    const maPhieuMuon = await sinhMaPhieuMuonTiepTheo(session);
    const [phieuMuonMoi] = await PhieuMuon.create(
      [
        {
          maPhieuMuon,
          docGiaId: docGia._id,
          maDocGia: docGia.maDocGia,
          nhanVienLapId: nhanVien._id,
          ngayMuon,
          trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
          ghiChu: duLieu.ghiChu || null,
          chiTietMuon: chiTietMuonArr,
        },
      ],
      session ? { session } : {}
    );

    // 5. Cap nhat soSachDangMuon cua Doc gia
    docGia.soSachDangMuon += soLuongMuonMoi;
    docGia.nguoiCapNhatId = user.taiKhoanId;
    await docGia.save(session ? { session } : {});

    // 6. Ghi nhat_ky_he_thong (BR-12)
    await NhatKyHeThong.create(
      [
        {
          hanhDong: HANH_DONG_NHAT_KY.LAP_PHIEU_MUON,
          doiTuongCollection: TEN_COLLECTION.PHIEU_MUON,
          doiTuongId: phieuMuonMoi._id,
          nguoiThucHienId: user.taiKhoanId,
          vaiTroNguoiThucHien: user.vaiTro,
          duLieuTruoc: null,
          duLieuSau: {
            maPhieuMuon: phieuMuonMoi.maPhieuMuon,
            maDocGia: docGia.maDocGia,
            soSachMuon: soLuongMuonMoi,
            danhSachMaSach: chiTietMuonArr.map((ct) => ct.maSach),
          },
          lyDo: duLieu.ghiChu || 'Lap phieu muon sach tai quay',
          thoiDiem: ngayMuon,
        },
      ],
      session ? { session } : {}
    );

    return phieuMuonMoi._id;
  } catch (err) {
    // Neu chay tren MongoDB Standalone (khong co session transaction), hoan lai ton kho cac cuon da tru
    if (!session && dsSachDaTruTonKho.length > 0) {
      await Sach.updateMany(
        { _id: { $in: dsSachDaTruTonKho } },
        { $inc: { soQuyenDangMuon: -1, soQuyenKhaDung: 1 } }
      );
    }
    throw err;
  }
};

/**
 * Wrapper Transaction cho Lap Phieu muon
 */
const lapPhieuMuon = async (duLieu, user) => {
  let phieuMuonId = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      phieuMuonId = await thucThiLapPhieuMuon(duLieu, user, session);
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      phieuMuonId = await thucThiLapPhieuMuon(duLieu, user, null);
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietPhieuMuon(phieuMuonId);
};

/**
 * Logic cot loi: Tra sach toan phan hoac tung phan, xu ly tra tre, sach hu hong va sach mat
 * (Muc 5.4, 5.5, 5.7, 5.8 PROJECT.md & Muc 4.5, 5.1 docs/db.md)
 */
const thucThiTraSach = async (phieuMuonId, duLieuTra, user, session = null) => {
  const nhanVien = await layNhanVienThucHien(user, session);
  const cauHinh = await layCauHinhMacDinh(session);

  const tienPhatTraTreMoiNgay =
    cauHinh && typeof cauHinh.tienPhatTraTreMoiNgay === 'number'
      ? cauHinh.tienPhatTraTreMoiNgay
      : 2000;
  const tyLeBoiThuongSachMat =
    cauHinh && typeof cauHinh.tyLeBoiThuongSachMat === 'number'
      ? cauHinh.tyLeBoiThuongSachMat
      : 1; // Mac dinh 100% donGiaTaiThoiDiemMuon neu PENDING DECISION (null)
  const tyLeBoiThuongSachHuHong =
    cauHinh && typeof cauHinh.tyLeBoiThuongSachHuHong === 'number'
      ? cauHinh.tyLeBoiThuongSachHuHong
      : 1;
  const hanCheMuonKhiCoViPham =
    cauHinh && typeof cauHinh.hanCheMuonKhiCoViPham === 'boolean'
      ? cauHinh.hanCheMuonKhiCoViPham
      : true;

  const phieuQuery = PhieuMuon.findById(phieuMuonId);
  if (session) phieuQuery.session(session);
  const phieuMuon = await phieuQuery;

  if (!phieuMuon) {
    throw new AppError(
      'Khong tim thay phieu muon',
      404,
      'KHONG_TIM_THAY_PHIEU_MUON'
    );
  }

  if (phieuMuon.trangThai !== TRANG_THAI_PHIEU_MUON.DANG_MO) {
    throw new AppError(
      `Phieu muon '${phieuMuon.maPhieuMuon}' hien o trang thai '${phieuMuon.trangThai}', khong the xac nhan tra sach`,
      400,
      'PHIEU_MUON_KHONG_O_TRANG_THAI_DANG_MO'
    );
  }

  const docGiaQuery = DocGia.findById(phieuMuon.docGiaId);
  if (session) docGiaQuery.session(session);
  const docGia = await docGiaQuery;

  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia cua phieu muon nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  const ngayTraThucTe = new Date();
  const { prefix: prefixKP, nextNumber: startKPNumber } =
    await sinhSoThuTuKhoanPhatBatDau(session);
  let currentKPNumber = startKPNumber;

  const dsKhoanPhatMoi = [];
  const dsNhatKyMoi = [];
  let tongTienPhatPhatSinh = 0;

  // Pha 1: Kiem tra toan bo danhSachTra truoc khi ghi bat ky thay doi nao vao CSDL
  // (Tranh lech ton kho tren MongoDB Standalone neu cuon sau bi loi 404/409/trung lap)
  const tapChiTietDaChon = new Set();
  const danhSachHopLe = [];

  for (const itemTra of duLieuTra.danhSachTra) {
    const chiTiet = phieuMuon.chiTietMuon.find((ct) => {
      if (itemTra.chiTietMuonId) {
        return ct._id.toString() === itemTra.chiTietMuonId;
      }
      return ct.sachId.toString() === itemTra.sachId;
    });

    if (!chiTiet) {
      throw new AppError(
        `Khong tim thay cuon sach (${itemTra.chiTietMuonId || itemTra.sachId}) trong phieu muon '${phieuMuon.maPhieuMuon}'`,
        404,
        'KHONG_TIM_THAY_CHI_TIET_MUON'
      );
    }

    const chiTietIdStr = chiTiet._id.toString();
    if (tapChiTietDaChon.has(chiTietIdStr)) {
      throw new AppError(
        `Cuon sach '${chiTiet.maSach} - ${chiTiet.tenSach}' bi trung lap trong danhSachTra`,
        400,
        'DU_LIEU_KHONG_HOP_LE'
      );
    }
    tapChiTietDaChon.add(chiTietIdStr);

    // Chong xac nhan tra trung (Muc 5.1 docs/db.md)
    if (
      ![
        TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
        TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
      ].includes(chiTiet.trangThai)
    ) {
      throw new AppError(
        `Cuon sach '${chiTiet.maSach} - ${chiTiet.tenSach}' da duoc xu ly truoc do (Trang thai hien tai: ${chiTiet.trangThai})`,
        409,
        'CHI_TIET_MUON_DA_DUOC_XU_LY',
        {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
          trangThaiHienTai: chiTiet.trangThai,
        }
      );
    }

    danhSachHopLe.push({
      itemTra,
      chiTiet,
      trangThaiTruoc: chiTiet.trangThai,
    });
  }

  // Pha 2: Thuc thi cap nhat ton kho, chi tiet muon, khoan phat va nhat ky
  for (const { itemTra, chiTiet, trangThaiTruoc } of danhSachHopLe) {
    const soNgayTre = tinhSoNgayTre(chiTiet.hanTra, ngayTraThucTe);
    const tinhTrang = itemTra.tinhTrangKhiTra;

    chiTiet.ngayTraThucTe = ngayTraThucTe;
    chiTiet.tinhTrangKhiTra = tinhTrang;
    chiTiet.moTaHuHong = itemTra.moTaHuHong || null;
    chiTiet.soNgayTre = soNgayTre;
    chiTiet.nhanVienXacNhanTraId = nhanVien._id;
    chiTiet.ngayCapNhatChiTiet = ngayTraThucTe;

    // 1. Cap nhat ton kho sach va trangThai chiTietMuon theo tinhTrangKhiTra (Muc 4.5 docs/db.md & BR-10)
    if (
      tinhTrang === TINH_TRANG_KHI_TRA.NGUYEN_VEN ||
      tinhTrang === TINH_TRANG_KHI_TRA.HU_HONG_NHE
    ) {
      chiTiet.trangThai =
        soNgayTre > 0
          ? TRANG_THAI_CHI_TIET_MUON.DA_TRA_TRE
          : TRANG_THAI_CHI_TIET_MUON.DA_TRA_DUNG_HAN;

      // Tra nguyen ven / hu hong nhe van luu thong duoc: soQuyenDangMuon -= 1, soQuyenKhaDung += 1
      await Sach.updateOne(
        { _id: chiTiet.sachId, soQuyenDangMuon: { $gte: 1 } },
        {
          $inc: {
            soQuyenDangMuon: -1,
            soQuyenKhaDung: 1,
          },
          $set: { nguoiCapNhatId: user.taiKhoanId },
        },
        session ? { session } : {}
      );

      // Neu HU_HONG_NHE va thu thu co nhap soTienBoiThuong > 0 thi tao khoan phat HU_HONG
      let soTienBoiThuongHuHongNhe = 0;
      if (
        tinhTrang === TINH_TRANG_KHI_TRA.HU_HONG_NHE &&
        itemTra.soTienBoiThuong !== null &&
        itemTra.soTienBoiThuong > 0
      ) {
        soTienBoiThuongHuHongNhe = itemTra.soTienBoiThuong;
        const maKhoanPhat = `${prefixKP}${String(currentKPNumber++).padStart(4, '0')}`;
        dsKhoanPhatMoi.push({
          maKhoanPhat,
          docGiaId: docGia._id,
          phieuMuonId: phieuMuon._id,
          chiTietMuonId: chiTiet._id,
          loaiPhat: LOAI_PHAT.HU_HONG,
          soNgayTre: null,
          mucPhatApDung: soTienBoiThuongHuHongNhe,
          soTienPhat: soTienBoiThuongHuHongNhe,
          soTienDaThanhToan: 0,
          trangThai: TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
          lyDo: `Boi thuong sach hu hong nhe '${chiTiet.maSach} - ${chiTiet.tenSach}': ${itemTra.moTaHuHong}`,
          nguoiTaoId: nhanVien._id,
        });
        tongTienPhatPhatSinh += soTienBoiThuongHuHongNhe;
      }

      dsNhatKyMoi.push({
        hanhDong: HANH_DONG_NHAT_KY.XAC_NHAN_TRA_SACH,
        doiTuongCollection: TEN_COLLECTION.PHIEU_MUON,
        doiTuongId: phieuMuon._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
          trangThai: trangThaiTruoc,
        },
        duLieuSau: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
          trangThai: chiTiet.trangThai,
          tinhTrangKhiTra: tinhTrang,
          soNgayTre,
          ...(soTienBoiThuongHuHongNhe > 0
            ? { soTienBoiThuong: soTienBoiThuongHuHongNhe }
            : {}),
        },
        lyDo: itemTra.moTaHuHong || 'Xac nhan tra sach',
        thoiDiem: ngayTraThucTe,
      });
    } else if (tinhTrang === TINH_TRANG_KHI_TRA.HU_HONG_NANG) {
      // Tra sach hu hong khong the luu thong: soQuyenDangMuon -= 1, soQuyenHuHong += 1 (soQuyenKhaDung khong doi - BR-10)
      chiTiet.trangThai = TRANG_THAI_CHI_TIET_MUON.HU_HONG;

      await Sach.updateOne(
        { _id: chiTiet.sachId, soQuyenDangMuon: { $gte: 1 } },
        {
          $inc: {
            soQuyenDangMuon: -1,
            soQuyenHuHong: 1,
          },
          $set: { nguoiCapNhatId: user.taiKhoanId },
        },
        session ? { session } : {}
      );

      // Tao khoan phat boi thuong sach hu hong
      const soTienBoiThuongHuHong =
        itemTra.soTienBoiThuong !== null
          ? itemTra.soTienBoiThuong
          : Math.round(
              chiTiet.donGiaTaiThoiDiemMuon * tyLeBoiThuongSachHuHong
            );

      if (soTienBoiThuongHuHong > 0) {
        const maKhoanPhat = `${prefixKP}${String(currentKPNumber++).padStart(4, '0')}`;
        dsKhoanPhatMoi.push({
          maKhoanPhat,
          docGiaId: docGia._id,
          phieuMuonId: phieuMuon._id,
          chiTietMuonId: chiTiet._id,
          loaiPhat: LOAI_PHAT.HU_HONG,
          soNgayTre: null,
          mucPhatApDung: soTienBoiThuongHuHong,
          soTienPhat: soTienBoiThuongHuHong,
          soTienDaThanhToan: 0,
          trangThai: TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
          lyDo: `Boi thuong sach hu hong '${chiTiet.maSach} - ${chiTiet.tenSach}': ${itemTra.moTaHuHong}`,
          nguoiTaoId: nhanVien._id,
        });
        tongTienPhatPhatSinh += soTienBoiThuongHuHong;
      }

      dsNhatKyMoi.push({
        hanhDong: HANH_DONG_NHAT_KY.GHI_NHAN_HU_HONG,
        doiTuongCollection: TEN_COLLECTION.PHIEU_MUON,
        doiTuongId: phieuMuon._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
        },
        duLieuSau: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
          trangThai: TRANG_THAI_CHI_TIET_MUON.HU_HONG,
          moTaHuHong: itemTra.moTaHuHong,
          soTienBoiThuong: soTienBoiThuongHuHong,
        },
        lyDo: itemTra.moTaHuHong,
        thoiDiem: ngayTraThucTe,
      });
    } else if (tinhTrang === TINH_TRANG_KHI_TRA.MAT) {
      // Ghi nhan mat sach: soQuyenDangMuon -= 1, tongSoQuyen -= 1, soQuyenDaMat += 1 (soQuyenKhaDung khong doi - BR-10)
      chiTiet.trangThai = TRANG_THAI_CHI_TIET_MUON.MAT_SACH;

      await Sach.updateOne(
        {
          _id: chiTiet.sachId,
          soQuyenDangMuon: { $gte: 1 },
          tongSoQuyen: { $gte: 1 },
        },
        {
          $inc: {
            soQuyenDangMuon: -1,
            tongSoQuyen: -1,
            soQuyenDaMat: 1,
          },
          $set: { nguoiCapNhatId: user.taiKhoanId },
        },
        session ? { session } : {}
      );

      // Tao khoan phat boi thuong mat sach
      const soTienBoiThuongMat =
        itemTra.soTienBoiThuong !== null
          ? itemTra.soTienBoiThuong
          : Math.round(chiTiet.donGiaTaiThoiDiemMuon * tyLeBoiThuongSachMat);

      if (soTienBoiThuongMat > 0) {
        const maKhoanPhat = `${prefixKP}${String(currentKPNumber++).padStart(4, '0')}`;
        dsKhoanPhatMoi.push({
          maKhoanPhat,
          docGiaId: docGia._id,
          phieuMuonId: phieuMuon._id,
          chiTietMuonId: chiTiet._id,
          loaiPhat: LOAI_PHAT.MAT_SACH,
          soNgayTre: null,
          mucPhatApDung: soTienBoiThuongMat,
          soTienPhat: soTienBoiThuongMat,
          soTienDaThanhToan: 0,
          trangThai: TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
          lyDo: `Boi thuong lam mat sach '${chiTiet.maSach} - ${chiTiet.tenSach}'`,
          nguoiTaoId: nhanVien._id,
        });
        tongTienPhatPhatSinh += soTienBoiThuongMat;
      }

      dsNhatKyMoi.push({
        hanhDong: HANH_DONG_NHAT_KY.GHI_NHAN_MAT_SACH,
        doiTuongCollection: TEN_COLLECTION.PHIEU_MUON,
        doiTuongId: phieuMuon._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
        },
        duLieuSau: {
          chiTietMuonId: chiTiet._id,
          maSach: chiTiet.maSach,
          trangThai: TRANG_THAI_CHI_TIET_MUON.MAT_SACH,
          soTienBoiThuong: soTienBoiThuongMat,
        },
        lyDo: itemTra.moTaHuHong || 'Doc gia bao mat sach',
        thoiDiem: ngayTraThucTe,
      });
    }

    // 2. Neu tra tre (soNgayTre > 0), tao khoan phat TRA_TRE (Muc 5.5 PROJECT.md)
    if (soNgayTre > 0 && tienPhatTraTreMoiNgay > 0) {
      const soTienPhatTre = soNgayTre * tienPhatTraTreMoiNgay;
      const maKhoanPhat = `${prefixKP}${String(currentKPNumber++).padStart(4, '0')}`;

      dsKhoanPhatMoi.push({
        maKhoanPhat,
        docGiaId: docGia._id,
        phieuMuonId: phieuMuon._id,
        chiTietMuonId: chiTiet._id,
        loaiPhat: LOAI_PHAT.TRA_TRE,
        soNgayTre,
        mucPhatApDung: tienPhatTraTreMoiNgay,
        soTienPhat: soTienPhatTre,
        soTienDaThanhToan: 0,
        trangThai: TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
        lyDo: `Tra sach '${chiTiet.maSach} - ${chiTiet.tenSach}' tre ${soNgayTre} ngay`,
        nguoiTaoId: nhanVien._id,
      });
      tongTienPhatPhatSinh += soTienPhatTre;
    }
  }

  // 3. Kiem tra trang thai tong the cua Phieu muon (BR-08: Tra tung phan)
  const conSachChuaTra = phieuMuon.chiTietMuon.some((ct) =>
    [
      TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
      TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
    ].includes(ct.trangThai)
  );

  phieuMuon.trangThai = conSachChuaTra
    ? TRANG_THAI_PHIEU_MUON.DANG_MO
    : TRANG_THAI_PHIEU_MUON.HOAN_TAT;

  if (duLieuTra.ghiChu) {
    phieuMuon.ghiChu = phieuMuon.ghiChu
      ? `${phieuMuon.ghiChu} | ${duLieuTra.ghiChu}`
      : duLieuTra.ghiChu;
  }

  await phieuMuon.save(session ? { session } : {});

  // 4. Luu cac khoan phat moi phat sinh (neu co)
  if (dsKhoanPhatMoi.length > 0) {
    await KhoanPhat.create(dsKhoanPhatMoi, session ? { session } : {});
  }

  // 5. Cap nhat Doc gia: giam soSachDangMuon, tang tongTienPhatChuaTra, ap dung han che muon neu co vi pham
  const soCuonDaXuLy = duLieuTra.danhSachTra.length;
  docGia.soSachDangMuon = Math.max(0, docGia.soSachDangMuon - soCuonDaXuLy);
  docGia.tongTienPhatChuaTra += tongTienPhatPhatSinh;

  if (
    hanCheMuonKhiCoViPham &&
    tongTienPhatPhatSinh > 0 &&
    docGia.trangThaiQuyenMuon === TRANG_THAI_QUYEN_MUON.DUOC_MUON
  ) {
    const duLieuTruocQuyenMuon = {
      trangThaiQuyenMuon: docGia.trangThaiQuyenMuon,
      lyDoHanCheMuon: docGia.lyDoHanCheMuon,
    };
    const lyDoHanChe = `Phat sinh khoan phat chua thanh toan (${docGia.tongTienPhatChuaTra} VND) tu phieu muon ${phieuMuon.maPhieuMuon}`;
    docGia.trangThaiQuyenMuon = TRANG_THAI_QUYEN_MUON.BI_HAN_CHE;
    docGia.lyDoHanCheMuon = lyDoHanChe;

    dsNhatKyMoi.push({
      hanhDong: HANH_DONG_NHAT_KY.HAN_CHE_QUYEN_MUON,
      doiTuongCollection: TEN_COLLECTION.DOC_GIA,
      doiTuongId: docGia._id,
      nguoiThucHienId: user.taiKhoanId,
      vaiTroNguoiThucHien: user.vaiTro,
      duLieuTruoc: duLieuTruocQuyenMuon,
      duLieuSau: {
        trangThaiQuyenMuon: docGia.trangThaiQuyenMuon,
        lyDoHanCheMuon: lyDoHanChe,
      },
      lyDo: lyDoHanChe,
      thoiDiem: ngayTraThucTe,
    });
  }

  docGia.nguoiCapNhatId = user.taiKhoanId;
  await docGia.save(session ? { session } : {});

  // 6. Ghi nhat_ky_he_thong
  if (dsNhatKyMoi.length > 0) {
    await NhatKyHeThong.create(dsNhatKyMoi, session ? { session } : {});
  }

  return phieuMuon._id;
};

/**
 * Wrapper Transaction cho Tra sach
 */
const traSach = async (phieuMuonId, duLieuTra, user) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await thucThiTraSach(phieuMuonId, duLieuTra, user, session);
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await thucThiTraSach(phieuMuonId, duLieuTra, user, null);
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietPhieuMuon(phieuMuonId);
};

/**
 * Gia han muon cho 1 cuon sach trong Phieu muon (Muc 5.9 PROJECT.md)
 */
const giaHanMuon = async (phieuMuonId, duLieuGiaHan, user) => {
  const nhanVien = await layNhanVienThucHien(user);
  const cauHinh = await layCauHinhMacDinh();

  const soLanGiaHanToiDa =
    cauHinh && typeof cauHinh.soLanGiaHanToiDa === 'number'
      ? cauHinh.soLanGiaHanToiDa
      : 1;
  const soNgayGiaHanMacDinh =
    cauHinh && typeof cauHinh.soNgayGiaHanMoiLan === 'number'
      ? cauHinh.soNgayGiaHanMoiLan
      : cauHinh && typeof cauHinh.soNgayMuonMacDinh === 'number'
        ? cauHinh.soNgayMuonMacDinh
        : 7;

  const phieuMuon = await PhieuMuon.findById(phieuMuonId);
  if (!phieuMuon) {
    throw new AppError(
      'Khong tim thay phieu muon',
      404,
      'KHONG_TIM_THAY_PHIEU_MUON'
    );
  }

  if (phieuMuon.trangThai !== TRANG_THAI_PHIEU_MUON.DANG_MO) {
    throw new AppError(
      'Chi co the gia han sach trong phieu muon dang mo (DANG_MO)',
      400,
      'PHIEU_MUON_KHONG_O_TRANG_THAI_DANG_MO'
    );
  }

  const docGia = await DocGia.findById(phieuMuon.docGiaId).lean();
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia cua phieu muon nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  if (docGia.trangThaiHoSo !== TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG) {
    throw new AppError(
      `Ho so doc gia '${docGia.maDocGia}' da ngung hoat dong, khong the gia han sach`,
      403,
      'HO_SO_DOC_GIA_NGUNG_HOAT_DONG'
    );
  }

  if (docGia.trangThaiQuyenMuon !== TRANG_THAI_QUYEN_MUON.DUOC_MUON) {
    throw new AppError(
      'Doc gia dang bi han che quyen muon, khong the gia han sach',
      403,
      'DOC_GIA_BI_HAN_CHE_MUON'
    );
  }

  const hanCheMuonKhiCoViPham =
    cauHinh && typeof cauHinh.hanCheMuonKhiCoViPham === 'boolean'
      ? cauHinh.hanCheMuonKhiCoViPham
      : true;

  if (hanCheMuonKhiCoViPham && docGia.tongTienPhatChuaTra > 0) {
    throw new AppError(
      `Doc gia '${docGia.maDocGia}' dang con no tien phat (${docGia.tongTienPhatChuaTra} VND), khong the gia han sach`,
      403,
      'DOC_GIA_CON_NO_PHAT'
    );
  }

  const chiTiet = phieuMuon.chiTietMuon.find((ct) => {
    if (duLieuGiaHan.chiTietMuonId) {
      return ct._id.toString() === duLieuGiaHan.chiTietMuonId;
    }
    return ct.sachId.toString() === duLieuGiaHan.sachId;
  });

  if (!chiTiet) {
    throw new AppError(
      'Khong tim thay cuon sach can gia han trong phieu muon',
      404,
      'KHONG_TIM_THAY_CHI_TIET_MUON'
    );
  }

  if (chiTiet.trangThai !== TRANG_THAI_CHI_TIET_MUON.DANG_MUON) {
    throw new AppError(
      `Chi co the gia han cuon sach dang o trang thai DANG_MUON (Trang thai hien tai: ${chiTiet.trangThai})`,
      400,
      'TRANG_THAI_SACH_KHONG_CHO_PHEP_GIA_HAN'
    );
  }

  if (tinhSoNgayTre(chiTiet.hanTra, new Date()) > 0) {
    throw new AppError(
      'Cuon sach nay da qua han tra, khong the gia han',
      400,
      'SACH_DA_QUA_HAN_KHONG_THE_GIA_HAN'
    );
  }

  if (chiTiet.soLanDaGiaHan >= soLanGiaHanToiDa) {
    throw new AppError(
      `Cuon sach '${chiTiet.maSach}' da dat gioi han so lan gia han toi da (${soLanGiaHanToiDa} lan)`,
      400,
      'VUOT_SO_LAN_GIA_HAN_TOI_DA',
      {
        soLanDaGiaHan: chiTiet.soLanDaGiaHan,
        soLanGiaHanToiDa,
      }
    );
  }

  const hanTraCu = new Date(chiTiet.hanTra);
  let hanTraMoi = null;

  if (duLieuGiaHan.hanTraMoi) {
    hanTraMoi = duaVeCuoiNgay(duLieuGiaHan.hanTraMoi);
  } else {
    const soNgayCongThem = duLieuGiaHan.soNgayGiaHan || soNgayGiaHanMacDinh;
    hanTraMoi = duaVeCuoiNgay(
      new Date(hanTraCu.getTime() + soNgayCongThem * MS_MOT_NGAY)
    );
  }

  if (hanTraMoi.getTime() <= hanTraCu.getTime()) {
    throw new AppError(
      'hanTraMoi phai lon hon hanTraCu hien tai',
      400,
      'HAN_TRA_MOI_KHONG_HOP_LE'
    );
  }

  const ngayDuyet = new Date();
  chiTiet.hanTra = hanTraMoi;
  chiTiet.soLanDaGiaHan += 1;
  chiTiet.lichSuGiaHan.push({
    hanTraCu,
    hanTraMoi,
    nguoiDuyetId: nhanVien._id,
    ngayDuyet,
    lyDo: duLieuGiaHan.lyDo || 'Gia han thoi gian muon sach',
  });
  chiTiet.ngayCapNhatChiTiet = ngayDuyet;

  await phieuMuon.save();

  await NhatKyHeThong.create({
    hanhDong: HANH_DONG_NHAT_KY.GIA_HAN_MUON,
    doiTuongCollection: TEN_COLLECTION.PHIEU_MUON,
    doiTuongId: phieuMuon._id,
    nguoiThucHienId: user.taiKhoanId,
    vaiTroNguoiThucHien: user.vaiTro,
    duLieuTruoc: {
      chiTietMuonId: chiTiet._id,
      maSach: chiTiet.maSach,
      hanTra: hanTraCu,
      soLanDaGiaHan: chiTiet.soLanDaGiaHan - 1,
    },
    duLieuSau: {
      chiTietMuonId: chiTiet._id,
      maSach: chiTiet.maSach,
      hanTra: hanTraMoi,
      soLanDaGiaHan: chiTiet.soLanDaGiaHan,
    },
    lyDo: duLieuGiaHan.lyDo || 'Gia han thoi gian muon sach',
    thoiDiem: ngayDuyet,
  });

  return layChiTietPhieuMuon(phieuMuon._id);
};

/**
 * Huy Phieu muon lap nham (BR-11 & Muc 5.2 docs/db.md):
 * - Chi cho phep huy khi phieu dang DANG_MO va tat ca chiTietMuon chua co cuon nao duoc tra/xu ly.
 * - Hoan lai soQuyenKhaDung cho cac dau sach va giam soSachDangMuon cua Doc gia.
 */
const thucThiHuyPhieuMuon = async (phieuMuonId, lyDoHuy, user, session = null) => {
  const nhanVien = await layNhanVienThucHien(user, session);

  const phieuQuery = PhieuMuon.findById(phieuMuonId);
  if (session) phieuQuery.session(session);
  const phieuMuon = await phieuQuery;

  if (!phieuMuon) {
    throw new AppError(
      'Khong tim thay phieu muon',
      404,
      'KHONG_TIM_THAY_PHIEU_MUON'
    );
  }

  if (phieuMuon.trangThai !== TRANG_THAI_PHIEU_MUON.DANG_MO) {
    throw new AppError(
      `Chi co the huy phieu muon dang o trang thai DANG_MO (Trang thai hien tai: ${phieuMuon.trangThai})`,
      400,
      'KHONG_THE_HUY_PHIEU_MUON'
    );
  }

  const coSachDaXuLy = phieuMuon.chiTietMuon.some(
    (ct) =>
      ![
        TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
        TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
      ].includes(ct.trangThai)
  );

  if (coSachDaXuLy) {
    throw new AppError(
      'Khong the huy phieu muon da phat sinh giao dich tra sach hoac xu ly vi pham',
      409,
      'PHIEU_MUON_DA_CO_SACH_TRA'
    );
  }

  const ngayHuy = new Date();

  // Hoan lai ton kho cho tung cuon sach trong phieu
  for (const ct of phieuMuon.chiTietMuon) {
    await Sach.updateOne(
      { _id: ct.sachId, soQuyenDangMuon: { $gte: 1 } },
      {
        $inc: {
          soQuyenDangMuon: -1,
          soQuyenKhaDung: 1,
        },
        $set: { nguoiCapNhatId: user.taiKhoanId },
      },
      session ? { session } : {}
    );
    ct.trangThai = TRANG_THAI_CHI_TIET_MUON.DA_XU_LY;
    ct.ngayCapNhatChiTiet = ngayHuy;
  }

  // Giam soSachDangMuon cua Doc gia
  const docGiaQuery = DocGia.findById(phieuMuon.docGiaId);
  if (session) docGiaQuery.session(session);
  const docGia = await docGiaQuery;
  if (docGia) {
    docGia.soSachDangMuon = Math.max(
      0,
      docGia.soSachDangMuon - phieuMuon.chiTietMuon.length
    );
    docGia.nguoiCapNhatId = user.taiKhoanId;
    await docGia.save(session ? { session } : {});
  }

  phieuMuon.trangThai = TRANG_THAI_PHIEU_MUON.DA_HUY;
  phieuMuon.nguoiHuyId = nhanVien._id;
  phieuMuon.ngayHuy = ngayHuy;
  phieuMuon.lyDoHuy = lyDoHuy;

  await phieuMuon.save(session ? { session } : {});

  return phieuMuon._id;
};

const huyPhieuMuon = async (phieuMuonId, { lyDoHuy }, user) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await thucThiHuyPhieuMuon(phieuMuonId, lyDoHuy, user, session);
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await thucThiHuyPhieuMuon(phieuMuonId, lyDoHuy, user, null);
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietPhieuMuon(phieuMuonId);
};

module.exports = {
  layDanhSachPhieuMuon,
  layLichSuMuonCuaDocGia,
  layDanhSachSachQuaHan,
  layChiTietPhieuMuon,
  lapPhieuMuon,
  traSach,
  giaHanMuon,
  huyPhieuMuon,
};

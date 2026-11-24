const mongoose = require('mongoose');
const {
  KhoanPhat,
  DocGia,
  NhanVien,
  PhieuMuon,
  NhatKyHeThong,
} = require('../models');
const {
  VAI_TRO,
  LOAI_PHAT,
  TRANG_THAI_KHOAN_PHAT,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_PHIEU_MUON,
  TRANG_THAI_CHI_TIET_MUON,
  HANH_DONG_NHAT_KY,
  TEN_COLLECTION,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

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
 * Dua moc thoi gian ve dau ngay (00:00:00.000)
 */
const duaVeDauNgay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Lay nhanVien thuc hien thao tac tu req.user
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
 * Kiem tra va tu dong mo lai quyen muon (DUOC_MUON) cho doc gia neu:
 * - tongTienPhatChuaTra === 0
 * - Khong con cuon sach nao dang qua han chua tra
 * - Doc gia dang o trangThaiQuyenMuon === BI_HAN_CHE
 */
const kiemTraMoLaiQuyenMuonSauKhiHetNo = async (docGia, user, session = null) => {
  if (
    docGia.tongTienPhatChuaTra > 0 ||
    docGia.trangThaiQuyenMuon !== TRANG_THAI_QUYEN_MUON.BI_HAN_CHE
  ) {
    return;
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
  const conSachQuaHan = await phieuQuaHanQuery.lean();

  if (!conSachQuaHan) {
    docGia.trangThaiQuyenMuon = TRANG_THAI_QUYEN_MUON.DUOC_MUON;
    docGia.lyDoHanCheMuon = null;
    docGia.nguoiCapNhatId = user.taiKhoanId;
  }
};

/**
 * Kiem tra va cap nhat chiTietMuon.trangThai -> DA_XU_LY (Muc 5.8 & 7.3 PROJECT.md):
 * Neu chiTietMuon dang la HU_HONG hoac MAT_SACH va tat ca khoan_phat cua chiTietMuonId do da ket thuc
 * (khong con khoan nao CHUA_THANH_TOAN hoac THANH_TOAN_MOT_PHAN) thi chuyen sang DA_XU_LY.
 */
const dongBoTrangThaiChiTietMuonSauXuLyPhat = async (
  phieuMuonId,
  chiTietMuonId,
  session = null
) => {
  const conPhatChuaXongQuery = KhoanPhat.findOne({
    phieuMuonId,
    chiTietMuonId,
    trangThai: {
      $in: [
        TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
        TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN,
      ],
    },
  });
  if (session) conPhatChuaXongQuery.session(session);
  const conPhatChuaXong = await conPhatChuaXongQuery.lean();

  if (conPhatChuaXong) {
    return;
  }

  const phieuQuery = PhieuMuon.findById(phieuMuonId);
  if (session) phieuQuery.session(session);
  const phieuMuon = await phieuQuery;

  if (!phieuMuon) return;

  const chiTiet = phieuMuon.chiTietMuon.find(
    (ct) => ct._id.toString() === chiTietMuonId.toString()
  );

  if (
    chiTiet &&
    [
      TRANG_THAI_CHI_TIET_MUON.HU_HONG,
      TRANG_THAI_CHI_TIET_MUON.MAT_SACH,
    ].includes(chiTiet.trangThai)
  ) {
    chiTiet.trangThai = TRANG_THAI_CHI_TIET_MUON.DA_XU_LY;
    chiTiet.ngayCapNhatChiTiet = new Date();
    await phieuMuon.save(session ? { session } : {});
  }
};

/**
 * Gan thong tin chiTietMuon tu phieuMuonId vao object khoanPhat de hien thi day du
 */
const ganThongTinChiTietSachChoKhoanPhat = (khoanPhat) => {
  let chiTietSach = null;
  if (
    khoanPhat.phieuMuonId &&
    Array.isArray(khoanPhat.phieuMuonId.chiTietMuon)
  ) {
    chiTietSach =
      khoanPhat.phieuMuonId.chiTietMuon.find(
        (ct) => ct._id.toString() === khoanPhat.chiTietMuonId.toString()
      ) || null;
  }

  const phieuMuonTomTat =
    khoanPhat.phieuMuonId && khoanPhat.phieuMuonId._id
      ? {
          _id: khoanPhat.phieuMuonId._id,
          maPhieuMuon: khoanPhat.phieuMuonId.maPhieuMuon,
          ngayMuon: khoanPhat.phieuMuonId.ngayMuon,
          trangThai: khoanPhat.phieuMuonId.trangThai,
        }
      : khoanPhat.phieuMuonId;

  const soTienConNo = Math.max(
    0,
    (khoanPhat.soTienPhat || 0) - (khoanPhat.soTienDaThanhToan || 0)
  );

  return {
    ...khoanPhat,
    phieuMuonId: phieuMuonTomTat,
    chiTietSach,
    soTienConNo,
  };
};

/**
 * Lay danh sach Khoan phat (loc theo trangThai, loaiPhat, docGiaId, phieuMuonId, tuKhoa, phan trang)
 */
const layDanhSachKhoanPhat = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Loc theo trangThai
  if (query.trangThai !== undefined && String(query.trangThai).trim() !== '') {
    const trangThai = String(query.trangThai).trim().toUpperCase();
    if (!Object.values(TRANG_THAI_KHOAN_PHAT).includes(trangThai)) {
      throw new AppError(
        `Gia tri loc trangThai '${query.trangThai}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_KHOAN_PHAT).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'trangThai', message: 'Gia tri loc trangThai khong hop le' }]
      );
    }
    filter.trangThai = trangThai;
  }

  // 2. Loc theo loaiPhat (TRA_TRE | HU_HONG | MAT_SACH)
  if (query.loaiPhat !== undefined && String(query.loaiPhat).trim() !== '') {
    const loaiPhat = String(query.loaiPhat).trim().toUpperCase();
    if (!Object.values(LOAI_PHAT).includes(loaiPhat)) {
      throw new AppError(
        `Gia tri loc loaiPhat '${query.loaiPhat}' khong hop le. Chi chap nhan: ${Object.values(LOAI_PHAT).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'loaiPhat', message: 'Gia tri loc loaiPhat khong hop le' }]
      );
    }
    filter.loaiPhat = loaiPhat;
  }

  // 3. Loc theo docGiaId
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

  // 4. Loc theo phieuMuonId
  if (
    query.phieuMuonId !== undefined &&
    String(query.phieuMuonId).trim() !== ''
  ) {
    const pmId = String(query.phieuMuonId).trim();
    if (!mongoose.Types.ObjectId.isValid(pmId)) {
      throw new AppError(
        'Gia tri loc phieuMuonId khong dung dinh dang ObjectId',
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'phieuMuonId', message: 'phieuMuonId khong hop le' }]
      );
    }
    filter.phieuMuonId = pmId;
  }

  // 5. Tim kiem theo tuKhoa (maKhoanPhat, lyDo, ghiChuXuLy)
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
      { maKhoanPhat: regex },
      { lyDo: regex },
      { ghiChuXuLy: regex },
    ];
  }

  const [danhSachRaw, tongSo] = await Promise.all([
    KhoanPhat.find(filter)
      .populate(
        'docGiaId',
        'maDocGia hoLot ten dienThoai trangThaiQuyenMuon tongTienPhatChuaTra'
      )
      .populate('phieuMuonId', 'maPhieuMuon ngayMuon trangThai chiTietMuon')
      .populate('nguoiTaoId', 'msnv hoTenNV chucVu')
      .populate('nguoiXuLyId', 'msnv hoTenNV chucVu')
      .sort({ ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    KhoanPhat.countDocuments(filter),
  ]);

  const danhSach = danhSachRaw.map(ganThongTinChiTietSachChoKhoanPhat);

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
 * Doc gia xem danh sach khoan phat cua chinh minh (BR-02)
 */
const layDanhSachKhoanPhatCaNhan = async (user, query = {}) => {
  const docGia = await DocGia.findOne({ taiKhoanId: user.taiKhoanId }).lean();
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia lien ket voi tai khoan nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  const ketQua = await layDanhSachKhoanPhat({
    ...query,
    docGiaId: docGia._id.toString(),
  });

  return {
    tongTienPhatChuaTra: docGia.tongTienPhatChuaTra,
    trangThaiQuyenMuon: docGia.trangThaiQuyenMuon,
    lyDoHanCheMuon: docGia.lyDoHanCheMuon,
    ...ketQua,
  };
};

/**
 * Lay chi tiet 1 Khoan phat theo _id (BR-02: DOC_GIA chi duoc xem khoan phat cua chinh minh)
 */
const layChiTietKhoanPhat = async (id, user = null) => {
  const khoanPhat = await KhoanPhat.findById(id)
    .populate(
      'docGiaId',
      'maDocGia hoLot ten dienThoai diaChi trangThaiQuyenMuon tongTienPhatChuaTra'
    )
    .populate('phieuMuonId', 'maPhieuMuon ngayMuon trangThai chiTietMuon')
    .populate('nguoiTaoId', 'msnv hoTenNV chucVu')
    .populate('nguoiXuLyId', 'msnv hoTenNV chucVu')
    .lean();

  if (!khoanPhat) {
    throw new AppError(
      'Khong tim thay khoan phat',
      404,
      'KHONG_TIM_THAY_KHOAN_PHAT'
    );
  }

  if (user && user.vaiTro === VAI_TRO.DOC_GIA) {
    const docGia = await DocGia.findOne({ taiKhoanId: user.taiKhoanId })
      .select('_id')
      .lean();
    const docGiaIdCuaPhat =
      khoanPhat.docGiaId && khoanPhat.docGiaId._id
        ? khoanPhat.docGiaId._id.toString()
        : khoanPhat.docGiaId.toString();

    if (!docGia || docGia._id.toString() !== docGiaIdCuaPhat) {
      throw new AppError(
        'Ban khong co quyen xem khoan phat cua doc gia khac (BR-02)',
        403,
        'KHONG_DU_QUYEN'
      );
    }
  }

  return ganThongTinChiTietSachChoKhoanPhat(khoanPhat);
};

/**
 * Logic cot loi: Xac nhan thu tien phat (toan bo hoac mot phan) trong Transaction
 */
const thucThiThanhToanPhat = async (
  id,
  { soTienThu, ghiChuXuLy },
  user,
  session = null
) => {
  const nhanVien = await layNhanVienThucHien(user, session);

  const kpQuery = KhoanPhat.findById(id);
  if (session) kpQuery.session(session);
  const khoanPhat = await kpQuery;

  if (!khoanPhat) {
    throw new AppError(
      'Khong tim thay khoan phat',
      404,
      'KHONG_TIM_THAY_KHOAN_PHAT'
    );
  }

  if (
    ![
      TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
      TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN,
    ].includes(khoanPhat.trangThai)
  ) {
    throw new AppError(
      `Khoan phat '${khoanPhat.maKhoanPhat}' hien o trang thai '${khoanPhat.trangThai}', khong the thu tien`,
      400,
      'TRANG_THAI_KHOAN_PHAT_KHONG_CHO_PHEP',
      {
        maKhoanPhat: khoanPhat.maKhoanPhat,
        trangThaiHienTai: khoanPhat.trangThai,
      }
    );
  }

  const soTienConNo = Math.max(
    0,
    khoanPhat.soTienPhat - khoanPhat.soTienDaThanhToan
  );

  const soTienThucThu = soTienThu !== null ? soTienThu : soTienConNo;

  if (soTienThucThu <= 0 || soTienThucThu > soTienConNo) {
    throw new AppError(
      `So tien thu (${soTienThucThu} VND) khong duoc vuot qua so tien con no (${soTienConNo} VND)`,
      400,
      'SO_TIEN_THU_KHONG_HOP_LE',
      {
        soTienPhat: khoanPhat.soTienPhat,
        soTienDaThanhToan: khoanPhat.soTienDaThanhToan,
        soTienConNo,
        soTienYeuCauThu: soTienThucThu,
      }
    );
  }

  const duLieuTruoc = {
    soTienPhat: khoanPhat.soTienPhat,
    soTienDaThanhToan: khoanPhat.soTienDaThanhToan,
    trangThai: khoanPhat.trangThai,
  };

  const ngayXuLy = new Date();
  khoanPhat.soTienDaThanhToan += soTienThucThu;
  khoanPhat.trangThai =
    khoanPhat.soTienDaThanhToan >= khoanPhat.soTienPhat
      ? TRANG_THAI_KHOAN_PHAT.DA_THANH_TOAN
      : TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN;
  khoanPhat.nguoiXuLyId = nhanVien._id;
  khoanPhat.ngayXuLy = ngayXuLy;
  khoanPhat.ghiChuXuLy =
    ghiChuXuLy ||
    `Xac nhan thu ${soTienThucThu} VND (Tong da thu: ${khoanPhat.soTienDaThanhToan}/${khoanPhat.soTienPhat} VND)`;

  await khoanPhat.save(session ? { session } : {});

  // Cap nhat Doc gia: giam tongTienPhatChuaTra va kiem tra mo lai quyen muon
  const docGiaQuery = DocGia.findById(khoanPhat.docGiaId);
  if (session) docGiaQuery.session(session);
  const docGia = await docGiaQuery;

  if (docGia) {
    docGia.tongTienPhatChuaTra = Math.max(
      0,
      docGia.tongTienPhatChuaTra - soTienThucThu
    );
    docGia.nguoiCapNhatId = user.taiKhoanId;
    await kiemTraMoLaiQuyenMuonSauKhiHetNo(docGia, user, session);
    await docGia.save(session ? { session } : {});
  }

  // Neu khoan phat da thanh toan du, dong bo trangThai chiTietMuon (HU_HONG/MAT_SACH -> DA_XU_LY)
  if (khoanPhat.trangThai === TRANG_THAI_KHOAN_PHAT.DA_THANH_TOAN) {
    await dongBoTrangThaiChiTietMuonSauXuLyPhat(
      khoanPhat.phieuMuonId,
      khoanPhat.chiTietMuonId,
      session
    );
  }

  const duLieuSau = {
    soTienPhat: khoanPhat.soTienPhat,
    soTienDaThanhToan: khoanPhat.soTienDaThanhToan,
    soTienVuaThu: soTienThucThu,
    trangThai: khoanPhat.trangThai,
  };

  // Ghi nhat_ky_he_thong (BR-12)
  await NhatKyHeThong.create(
    [
      {
        hanhDong: HANH_DONG_NHAT_KY.XAC_NHAN_THANH_TOAN_PHAT,
        doiTuongCollection: TEN_COLLECTION.KHOAN_PHAT,
        doiTuongId: khoanPhat._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc,
        duLieuSau,
        lyDo: khoanPhat.ghiChuXuLy,
        thoiDiem: ngayXuLy,
      },
    ],
    session ? { session } : {}
  );
};

const thanhToanKhoanPhat = async (id, payload, user) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await thucThiThanhToanPhat(id, payload, user, session);
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await thucThiThanhToanPhat(id, payload, user, null);
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietKhoanPhat(id);
};

/**
 * Logic cot loi: Mien phan tien phat con no (DUOC_MIEN) hoac Huy khoan phat ghi sai (DA_HUY)
 */
const thucThiMienHoacHuyKhoanPhat = async (
  id,
  { trangThaiMoi, ghiChuXuLy },
  user,
  session = null
) => {
  const nhanVien = await layNhanVienThucHien(user, session);

  const kpQuery = KhoanPhat.findById(id);
  if (session) kpQuery.session(session);
  const khoanPhat = await kpQuery;

  if (!khoanPhat) {
    throw new AppError(
      'Khong tim thay khoan phat',
      404,
      'KHONG_TIM_THAY_KHOAN_PHAT'
    );
  }

  if (
    ![
      TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
      TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN,
    ].includes(khoanPhat.trangThai)
  ) {
    throw new AppError(
      `Khoan phat '${khoanPhat.maKhoanPhat}' hien o trang thai '${khoanPhat.trangThai}', khong the chuyen sang '${trangThaiMoi}'`,
      400,
      'TRANG_THAI_KHOAN_PHAT_KHONG_CHO_PHEP'
    );
  }

  // Chi cho phep HUY khoan phat khi chua thu tien (soTienDaThanhToan === 0)
  if (
    trangThaiMoi === TRANG_THAI_KHOAN_PHAT.DA_HUY &&
    khoanPhat.soTienDaThanhToan > 0
  ) {
    throw new AppError(
      `Khoan phat '${khoanPhat.maKhoanPhat}' da thu mot phan tien (${khoanPhat.soTienDaThanhToan} VND), khong the huy. Neu muon mien phan con lai, vui long dung chuc nang mien phat (DUOC_MIEN).`,
      409,
      'KHOAN_PHAT_DA_THU_TIEN_KHONG_THE_HUY'
    );
  }

  const soTienConNoDuocGiam = Math.max(
    0,
    khoanPhat.soTienPhat - khoanPhat.soTienDaThanhToan
  );

  const duLieuTruoc = {
    soTienPhat: khoanPhat.soTienPhat,
    soTienDaThanhToan: khoanPhat.soTienDaThanhToan,
    trangThai: khoanPhat.trangThai,
  };

  const ngayXuLy = new Date();
  khoanPhat.trangThai = trangThaiMoi;
  khoanPhat.nguoiXuLyId = nhanVien._id;
  khoanPhat.ngayXuLy = ngayXuLy;
  khoanPhat.ghiChuXuLy = ghiChuXuLy;

  await khoanPhat.save(session ? { session } : {});

  // Cap nhat Doc gia: giam tongTienPhatChuaTra va kiem tra mo lai quyen muon
  const docGiaQuery = DocGia.findById(khoanPhat.docGiaId);
  if (session) docGiaQuery.session(session);
  const docGia = await docGiaQuery;

  if (docGia) {
    docGia.tongTienPhatChuaTra = Math.max(
      0,
      docGia.tongTienPhatChuaTra - soTienConNoDuocGiam
    );
    docGia.nguoiCapNhatId = user.taiKhoanId;
    await kiemTraMoLaiQuyenMuonSauKhiHetNo(docGia, user, session);
    await docGia.save(session ? { session } : {});
  }

  await dongBoTrangThaiChiTietMuonSauXuLyPhat(
    khoanPhat.phieuMuonId,
    khoanPhat.chiTietMuonId,
    session
  );

  const hanhDong =
    trangThaiMoi === TRANG_THAI_KHOAN_PHAT.DUOC_MIEN
      ? HANH_DONG_NHAT_KY.MIEN_PHAT
      : HANH_DONG_NHAT_KY.HUY_PHAT;

  await NhatKyHeThong.create(
    [
      {
        hanhDong,
        doiTuongCollection: TEN_COLLECTION.KHOAN_PHAT,
        doiTuongId: khoanPhat._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc,
        duLieuSau: {
          trangThai: khoanPhat.trangThai,
          soTienDuocGiam: soTienConNoDuocGiam,
          ghiChuXuLy,
        },
        lyDo: ghiChuXuLy,
        thoiDiem: ngayXuLy,
      },
    ],
    session ? { session } : {}
  );
};

const mienKhoanPhat = async (id, { ghiChuXuLy }, user) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await thucThiMienHoacHuyKhoanPhat(
        id,
        {
          trangThaiMoi: TRANG_THAI_KHOAN_PHAT.DUOC_MIEN,
          ghiChuXuLy,
        },
        user,
        session
      );
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await thucThiMienHoacHuyKhoanPhat(
        id,
        {
          trangThaiMoi: TRANG_THAI_KHOAN_PHAT.DUOC_MIEN,
          ghiChuXuLy,
        },
        user,
        null
      );
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietKhoanPhat(id);
};

const huyKhoanPhat = async (id, { ghiChuXuLy }, user) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await thucThiMienHoacHuyKhoanPhat(
        id,
        {
          trangThaiMoi: TRANG_THAI_KHOAN_PHAT.DA_HUY,
          ghiChuXuLy,
        },
        user,
        session
      );
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await thucThiMienHoacHuyKhoanPhat(
        id,
        {
          trangThaiMoi: TRANG_THAI_KHOAN_PHAT.DA_HUY,
          ghiChuXuLy,
        },
        user,
        null
      );
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietKhoanPhat(id);
};

module.exports = {
  layDanhSachKhoanPhat,
  layDanhSachKhoanPhatCaNhan,
  layChiTietKhoanPhat,
  thanhToanKhoanPhat,
  mienKhoanPhat,
  huyKhoanPhat,
};

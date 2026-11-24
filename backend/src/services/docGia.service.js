const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  TaiKhoan,
  DocGia,
  PhieuMuon,
  KhoanPhat,
  CauHinhThuVien,
  NhatKyHeThong,
} = require('../models');
const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  CACH_CAP_TAI_KHOAN_DOC_GIA,
  MA_CAU_HINH,
  HANH_DONG_NHAT_KY,
  TEN_COLLECTION,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

/**
 * Tao bieu thuc RegExp khop chinh xac chuoi khong phan biet hoa/thuong
 */
const taoRegexKhopChinhXacKhongPhanBietHoaThuong = (chuoi) => {
  const escaped = chuoi.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

/**
 * Tu dong sinh maDocGia tang dan (VD: DG0001, DG0002...)
 */
const sinhMaDocGiaTiepTheo = async (session = null) => {
  const query = DocGia.findOne({ maDocGia: /^DG\d+$/ }).sort({ maDocGia: -1 });
  if (session) {
    query.session(session);
  }
  const docGiaCuoi = await query.lean();
  if (!docGiaCuoi || !docGiaCuoi.maDocGia) {
    return 'DG0001';
  }
  const soHienTai = parseInt(docGiaCuoi.maDocGia.replace(/^DG/, ''), 10) || 0;
  const soTiepTheo = soHienTai + 1;
  return `DG${String(soTiepTheo).padStart(4, '0')}`;
};

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
const layCauHinhMacDinh = async () => {
  return CauHinhThuVien.findOne({ maCauHinh: MA_CAU_HINH.MAC_DINH }).lean();
};

/**
 * Lay danh sach Doc gia (tim kiem, loc theo trangThaiQuyenMuon, trangThaiHoSo, coSachDangMuon, coNoPhat, phan trang)
 */
const layDanhSachDocGia = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Loc theo trangThaiQuyenMuon
  if (
    query.trangThaiQuyenMuon !== undefined &&
    String(query.trangThaiQuyenMuon).trim() !== ''
  ) {
    const trangThaiQuyenMuon = String(query.trangThaiQuyenMuon)
      .trim()
      .toUpperCase();
    if (!Object.values(TRANG_THAI_QUYEN_MUON).includes(trangThaiQuyenMuon)) {
      throw new AppError(
        `Gia tri loc trangThaiQuyenMuon '${query.trangThaiQuyenMuon}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_QUYEN_MUON).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'trangThaiQuyenMuon',
            message: 'Gia tri loc trangThaiQuyenMuon khong hop le',
          },
        ]
      );
    }
    filter.trangThaiQuyenMuon = trangThaiQuyenMuon;
  }

  // 2. Loc theo trangThaiHoSo
  if (
    query.trangThaiHoSo !== undefined &&
    String(query.trangThaiHoSo).trim() !== ''
  ) {
    const trangThaiHoSo = String(query.trangThaiHoSo).trim().toUpperCase();
    if (!Object.values(TRANG_THAI_HO_SO_DOC_GIA).includes(trangThaiHoSo)) {
      throw new AppError(
        `Gia tri loc trangThaiHoSo '${query.trangThaiHoSo}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_HO_SO_DOC_GIA).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'trangThaiHoSo',
            message: 'Gia tri loc trangThaiHoSo khong hop le',
          },
        ]
      );
    }
    filter.trangThaiHoSo = trangThaiHoSo;
  }

  // 3. Loc theo coSachDangMuon ('true' | 'false')
  if (
    query.coSachDangMuon !== undefined &&
    String(query.coSachDangMuon).trim() !== ''
  ) {
    const val = String(query.coSachDangMuon).trim().toLowerCase();
    if (val === 'true') {
      filter.soSachDangMuon = { $gt: 0 };
    } else if (val === 'false') {
      filter.soSachDangMuon = 0;
    } else {
      throw new AppError(
        "Gia tri loc coSachDangMuon chi chap nhan 'true' hoac 'false'",
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'coSachDangMuon', message: 'coSachDangMuon khong hop le' }]
      );
    }
  }

  // 4. Loc theo coNoPhat ('true' | 'false')
  if (query.coNoPhat !== undefined && String(query.coNoPhat).trim() !== '') {
    const val = String(query.coNoPhat).trim().toLowerCase();
    if (val === 'true') {
      filter.tongTienPhatChuaTra = { $gt: 0 };
    } else if (val === 'false') {
      filter.tongTienPhatChuaTra = 0;
    } else {
      throw new AppError(
        "Gia tri loc coNoPhat chi chap nhan 'true' hoac 'false'",
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'coNoPhat', message: 'coNoPhat khong hop le' }]
      );
    }
  }

  // 5. Tim kiem theo tuKhoa (maDocGia, hoLot, ten, dienThoai, diaChi)
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
      { maDocGia: regex },
      { hoLot: regex },
      { ten: regex },
      { dienThoai: regex },
      { diaChi: regex },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ['$hoLot', ' ', '$ten'] },
            regex: escaped,
            options: 'i',
          },
        },
      },
    ];
  }

  const [danhSach, tongSo] = await Promise.all([
    DocGia.find(filter)
      .populate(
        'taiKhoanId',
        'tenDangNhap email vaiTro trangThai lyDoKhoa ngayKhoa lanDangNhapCuoi ngayTao'
      )
      .sort({ maDocGia: 1, ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DocGia.countDocuments(filter),
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
 * Lay chi tiet 1 Doc gia theo _id (danh cho QUAN_TRI va THU_THU)
 */
const layChiTietDocGia = async (id) => {
  const docGia = await DocGia.findById(id)
    .populate(
      'taiKhoanId',
      'tenDangNhap email vaiTro trangThai lyDoKhoa ngayKhoa nguoiKhoaId lanDangNhapCuoi ngayTao ngayCapNhat'
    )
    .lean();

  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  return docGia;
};

/**
 * Doc gia xem ho so ca nhan cua chinh minh (BR-02)
 */
const layHoSoCaNhanDocGia = async (taiKhoanId) => {
  const docGia = await DocGia.findOne({ taiKhoanId })
    .populate(
      'taiKhoanId',
      'tenDangNhap email vaiTro trangThai lanDangNhapCuoi ngayTao ngayCapNhat'
    )
    .lean();

  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia lien ket voi tai khoan nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  return docGia;
};

/**
 * Quan tri vien / Thu thu tao moi Tai khoan + Ho so Doc gia tai quay (Transaction - BR-14)
 */
const taoDocGia = async (duLieu, nguoiThucHienId) => {
  const cauHinh = await layCauHinhMacDinh();

  if (
    cauHinh &&
    cauHinh.cachCapTaiKhoanDocGia === CACH_CAP_TAI_KHOAN_DOC_GIA.CHI_TU_DANG_KY
  ) {
    throw new AppError(
      'Chinh sach thu vien hien tai chi cho phep doc gia tu dang ky tai khoan',
      403,
      'KHONG_CHO_PHEP_NHAN_VIEN_TAO_DOC_GIA'
    );
  }

  const yeuCauDienThoaiDuyNhat =
    cauHinh && typeof cauHinh.yeuCauDienThoaiDuyNhat === 'boolean'
      ? cauHinh.yeuCauDienThoaiDuyNhat
      : true;

  // 1. Kiem tra trung tenDangNhap, email, maDocGia, dienThoai
  const taiKhoanTrungTen = await TaiKhoan.findOne({
    tenDangNhap: duLieu.tenDangNhap,
  }).lean();
  if (taiKhoanTrungTen) {
    throw new AppError(
      `Ten dang nhap '${duLieu.tenDangNhap}' da duoc su dung`,
      409,
      'TEN_DANG_NHAP_DA_TON_TAI'
    );
  }

  if (duLieu.email) {
    const taiKhoanTrungEmail = await TaiKhoan.findOne({
      email: duLieu.email,
    }).lean();
    if (taiKhoanTrungEmail) {
      throw new AppError(
        `Email '${duLieu.email}' da duoc su dung`,
        409,
        'EMAIL_DA_TON_TAI'
      );
    }
  }

  if (duLieu.maDocGia) {
    const docGiaTrungMa = await DocGia.findOne({
      maDocGia: taoRegexKhopChinhXacKhongPhanBietHoaThuong(duLieu.maDocGia),
    }).lean();
    if (docGiaTrungMa) {
      throw new AppError(
        `Ma doc gia '${duLieu.maDocGia}' da ton tai`,
        409,
        'MA_DOC_GIA_DA_TON_TAI'
      );
    }
  }

  if (yeuCauDienThoaiDuyNhat) {
    const docGiaTrungSdt = await DocGia.findOne({
      dienThoai: duLieu.dienThoai,
    }).lean();
    if (docGiaTrungSdt) {
      throw new AppError(
        `So dien thoai '${duLieu.dienThoai}' da duoc dang ky cho doc gia '${docGiaTrungSdt.maDocGia}'`,
        409,
        'DIEN_THOAI_DA_TON_TAI'
      );
    }
  }

  const matKhauHash = await bcrypt.hash(duLieu.matKhau, SALT_ROUNDS);
  let docGiaMoi = null;

  // 2. Thuc thi tao tai_khoan va doc_gia trong Transaction
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const maDocGia =
        duLieu.maDocGia || (await sinhMaDocGiaTiepTheo(session));

      const [tk] = await TaiKhoan.create(
        [
          {
            tenDangNhap: duLieu.tenDangNhap,
            email: duLieu.email || null,
            matKhauHash,
            vaiTro: VAI_TRO.DOC_GIA,
            trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
          },
        ],
        { session }
      );

      const [dg] = await DocGia.create(
        [
          {
            taiKhoanId: tk._id,
            maDocGia,
            hoLot: duLieu.hoLot,
            ten: duLieu.ten,
            ngaySinh: duLieu.ngaySinh || null,
            phai: duLieu.phai || null,
            diaChi: duLieu.diaChi || null,
            dienThoai: duLieu.dienThoai,
            trangThaiQuyenMuon: TRANG_THAI_QUYEN_MUON.DUOC_MUON,
            soSachDangMuon: 0,
            tongTienPhatChuaTra: 0,
            trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
            nguoiTaoId: nguoiThucHienId,
            nguoiCapNhatId: nguoiThucHienId,
          },
        ],
        { session }
      );

      docGiaMoi = dg;
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      let tkFallback = null;
      try {
        const maDocGia = duLieu.maDocGia || (await sinhMaDocGiaTiepTheo(null));
        tkFallback = await TaiKhoan.create({
          tenDangNhap: duLieu.tenDangNhap,
          email: duLieu.email || null,
          matKhauHash,
          vaiTro: VAI_TRO.DOC_GIA,
          trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
        });

        docGiaMoi = await DocGia.create({
          taiKhoanId: tkFallback._id,
          maDocGia,
          hoLot: duLieu.hoLot,
          ten: duLieu.ten,
          ngaySinh: duLieu.ngaySinh || null,
          phai: duLieu.phai || null,
          diaChi: duLieu.diaChi || null,
          dienThoai: duLieu.dienThoai,
          trangThaiQuyenMuon: TRANG_THAI_QUYEN_MUON.DUOC_MUON,
          soSachDangMuon: 0,
          tongTienPhatChuaTra: 0,
          trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
          nguoiTaoId: nguoiThucHienId,
          nguoiCapNhatId: nguoiThucHienId,
        });
      } catch (fallbackErr) {
        if (tkFallback && tkFallback._id) {
          await TaiKhoan.deleteOne({ _id: tkFallback._id });
        }
        throw fallbackErr;
      }
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return layChiTietDocGia(docGiaMoi._id);
};

/**
 * Cap nhat thong tin ho so Doc gia (dung chung cho Nhan vien cap nhat va Doc gia tu cap nhat)
 */
const capNhatDocGia = async (docGiaId, duLieuCapNhat, nguoiThucHienId) => {
  const docGia = await DocGia.findById(docGiaId);
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  const maDocGiaCu = docGia.maDocGia;

  // 1. Kiem tra neu doi maDocGia
  if (
    duLieuCapNhat.maDocGia &&
    duLieuCapNhat.maDocGia !== docGia.maDocGia
  ) {
    const docGiaTrungMa = await DocGia.findOne({
      maDocGia: taoRegexKhopChinhXacKhongPhanBietHoaThuong(
        duLieuCapNhat.maDocGia
      ),
      _id: { $ne: docGia._id },
    }).lean();

    if (docGiaTrungMa) {
      throw new AppError(
        `Ma doc gia '${duLieuCapNhat.maDocGia}' da ton tai`,
        409,
        'MA_DOC_GIA_DA_TON_TAI'
      );
    }
    docGia.maDocGia = duLieuCapNhat.maDocGia;
  }

  // 2. Kiem tra neu doi dienThoai
  if (
    duLieuCapNhat.dienThoai &&
    duLieuCapNhat.dienThoai !== docGia.dienThoai
  ) {
    const cauHinh = await layCauHinhMacDinh();
    const yeuCauDienThoaiDuyNhat =
      cauHinh && typeof cauHinh.yeuCauDienThoaiDuyNhat === 'boolean'
        ? cauHinh.yeuCauDienThoaiDuyNhat
        : true;

    if (yeuCauDienThoaiDuyNhat) {
      const docGiaTrungSdt = await DocGia.findOne({
        dienThoai: duLieuCapNhat.dienThoai,
        _id: { $ne: docGia._id },
      }).lean();

      if (docGiaTrungSdt) {
        throw new AppError(
          `So dien thoai '${duLieuCapNhat.dienThoai}' da duoc su dung boi doc gia khac`,
          409,
          'DIEN_THOAI_DA_TON_TAI'
        );
      }
    }
    docGia.dienThoai = duLieuCapNhat.dienThoai;
  }

  // 3. Kiem tra neu doi email trong tai_khoan lien ket (kiem tra trung truoc, cap nhat sau khi luu docGia)
  if (duLieuCapNhat.email !== undefined && duLieuCapNhat.email !== null) {
    const tkTrungEmail = await TaiKhoan.findOne({
      email: duLieuCapNhat.email,
      _id: { $ne: docGia.taiKhoanId },
    }).lean();

    if (tkTrungEmail) {
      throw new AppError(
        `Email '${duLieuCapNhat.email}' da duoc su dung`,
        409,
        'EMAIL_DA_TON_TAI'
      );
    }
  }

  if (duLieuCapNhat.hoLot !== undefined) {
    docGia.hoLot = duLieuCapNhat.hoLot;
  }
  if (duLieuCapNhat.ten !== undefined) {
    docGia.ten = duLieuCapNhat.ten;
  }
  if (duLieuCapNhat.ngaySinh !== undefined) {
    docGia.ngaySinh = duLieuCapNhat.ngaySinh;
  }
  if (duLieuCapNhat.phai !== undefined) {
    docGia.phai = duLieuCapNhat.phai;
  }
  if (duLieuCapNhat.diaChi !== undefined) {
    docGia.diaChi = duLieuCapNhat.diaChi;
  }

  docGia.nguoiCapNhatId = nguoiThucHienId;
  await docGia.save();

  if (duLieuCapNhat.email !== undefined) {
    await TaiKhoan.updateOne(
      { _id: docGia.taiKhoanId },
      { $set: { email: duLieuCapNhat.email } }
    );
  }

  // Dong bo snapshot maDocGia trong phieu_muon neu maDocGia thay doi
  if (duLieuCapNhat.maDocGia && duLieuCapNhat.maDocGia !== maDocGiaCu) {
    await PhieuMuon.updateMany(
      { docGiaId: docGia._id },
      { $set: { maDocGia: docGia.maDocGia } }
    );
  }

  return layChiTietDocGia(docGia._id);
};

/**
 * Doc gia tu cap nhat thong tin ca nhan cua chinh minh (BR-02)
 */
const capNhatHoSoCaNhanDocGia = async (taiKhoanId, duLieuCapNhat) => {
  const docGia = await DocGia.findOne({ taiKhoanId }).lean();
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia lien ket voi tai khoan nay',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  return capNhatDocGia(docGia._id, duLieuCapNhat, taiKhoanId);
};

/**
 * Han che hoac mo quyen muon cua Doc gia (BR-04 & BR-12):
 * - Ghi nhat_ky_he_thong voi hanhDong: HAN_CHE_QUYEN_MUON hoac MO_QUYEN_MUON
 */
const capNhatQuyenMuonDocGia = async (
  id,
  { trangThaiQuyenMuon, lyDo },
  user
) => {
  const docGia = await DocGia.findById(id);
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  if (docGia.trangThaiQuyenMuon === trangThaiQuyenMuon) {
    throw new AppError(
      `Doc gia hien da o trang thai quyen muon '${trangThaiQuyenMuon}'`,
      400,
      'TRANG_THAI_KHONG_THAY_DOI'
    );
  }

  const duLieuTruoc = {
    trangThaiQuyenMuon: docGia.trangThaiQuyenMuon,
    lyDoHanCheMuon: docGia.lyDoHanCheMuon,
  };

  docGia.trangThaiQuyenMuon = trangThaiQuyenMuon;
  docGia.lyDoHanCheMuon =
    trangThaiQuyenMuon === TRANG_THAI_QUYEN_MUON.BI_HAN_CHE ? lyDo : null;
  docGia.nguoiCapNhatId = user.taiKhoanId;

  await docGia.save();

  const duLieuSau = {
    trangThaiQuyenMuon: docGia.trangThaiQuyenMuon,
    lyDoHanCheMuon: docGia.lyDoHanCheMuon,
  };

  const hanhDong =
    trangThaiQuyenMuon === TRANG_THAI_QUYEN_MUON.BI_HAN_CHE
      ? HANH_DONG_NHAT_KY.HAN_CHE_QUYEN_MUON
      : HANH_DONG_NHAT_KY.MO_QUYEN_MUON;

  await NhatKyHeThong.create({
    hanhDong,
    doiTuongCollection: TEN_COLLECTION.DOC_GIA,
    doiTuongId: docGia._id,
    nguoiThucHienId: user.taiKhoanId,
    vaiTroNguoiThucHien: user.vaiTro,
    duLieuTruoc,
    duLieuSau,
    lyDo: lyDo || 'Mo lai quyen muon cho doc gia',
    thoiDiem: new Date(),
  });

  return layChiTietDocGia(docGia._id);
};

/**
 * Khoa hoac mo khoa tai khoan dang nhap cua Doc gia (BR-03 & BR-12):
 * - Ghi nhat_ky_he_thong voi hanhDong: KHOA_TAI_KHOAN hoac MO_KHOA_TAI_KHOAN
 */
const capNhatTrangThaiTaiKhoanDocGia = async (
  id,
  { trangThai, lyDo },
  user
) => {
  const docGia = await DocGia.findById(id);
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  const taiKhoan = await TaiKhoan.findById(docGia.taiKhoanId);
  if (!taiKhoan) {
    throw new AppError(
      'Khong tim thay tai khoan lien ket voi doc gia nay',
      404,
      'TAI_KHOAN_KHONG_TON_TAI'
    );
  }

  if (taiKhoan.trangThai === trangThai) {
    throw new AppError(
      `Tai khoan cua doc gia hien da o trang thai '${trangThai}'`,
      400,
      'TRANG_THAI_KHONG_THAY_DOI'
    );
  }

  if (
    trangThai === TRANG_THAI_TAI_KHOAN.HOAT_DONG &&
    docGia.trangThaiHoSo === TRANG_THAI_HO_SO_DOC_GIA.NGUNG_HOAT_DONG
  ) {
    throw new AppError(
      `Khong the mo khoa tai khoan khi ho so doc gia '${docGia.maDocGia}' dang o trang thai NGUNG_HOAT_DONG. Vui long kich hoat lai ho so truoc.`,
      409,
      'HO_SO_DOC_GIA_NGUNG_HOAT_DONG'
    );
  }

  const duLieuTruoc = {
    trangThai: taiKhoan.trangThai,
    lyDoKhoa: taiKhoan.lyDoKhoa,
    ngayKhoa: taiKhoan.ngayKhoa,
    nguoiKhoaId: taiKhoan.nguoiKhoaId,
  };

  if (trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA) {
    taiKhoan.trangThai = TRANG_THAI_TAI_KHOAN.BI_KHOA;
    taiKhoan.lyDoKhoa = lyDo;
    taiKhoan.ngayKhoa = new Date();
    taiKhoan.nguoiKhoaId = user.taiKhoanId;
  } else {
    taiKhoan.trangThai = TRANG_THAI_TAI_KHOAN.HOAT_DONG;
    taiKhoan.lyDoKhoa = null;
    taiKhoan.ngayKhoa = null;
    taiKhoan.nguoiKhoaId = null;
  }

  await taiKhoan.save();

  docGia.nguoiCapNhatId = user.taiKhoanId;
  await docGia.save();

  const duLieuSau = {
    trangThai: taiKhoan.trangThai,
    lyDoKhoa: taiKhoan.lyDoKhoa,
    ngayKhoa: taiKhoan.ngayKhoa,
    nguoiKhoaId: taiKhoan.nguoiKhoaId,
  };

  const hanhDong =
    trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA
      ? HANH_DONG_NHAT_KY.KHOA_TAI_KHOAN
      : HANH_DONG_NHAT_KY.MO_KHOA_TAI_KHOAN;

  await NhatKyHeThong.create({
    hanhDong,
    doiTuongCollection: TEN_COLLECTION.TAI_KHOAN,
    doiTuongId: taiKhoan._id,
    nguoiThucHienId: user.taiKhoanId,
    vaiTroNguoiThucHien: user.vaiTro,
    duLieuTruoc,
    duLieuSau,
    lyDo: lyDo || 'Mo khoa tai khoan doc gia',
    thoiDiem: new Date(),
  });

  return layChiTietDocGia(docGia._id);
};

/**
 * Chuyen trang thai ho so Doc gia (HOAT_DONG / NGUNG_HOAT_DONG - Soft delete theo BR-11 & Muc 5.2 docs/db.md):
 * - Khi chuyen sang NGUNG_HOAT_DONG: Kiem tra doc gia khong con sach dang muon va khong con no phat,
 *   dong thoi tu dong khoa tai_khoan lien ket.
 */
const capNhatTrangThaiHoSoDocGia = async (
  id,
  { trangThaiHoSo, lyDo },
  user
) => {
  const docGia = await DocGia.findById(id);
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  if (docGia.trangThaiHoSo === trangThaiHoSo) {
    throw new AppError(
      `Ho so doc gia hien da o trang thai '${trangThaiHoSo}'`,
      400,
      'TRANG_THAI_KHONG_THAY_DOI'
    );
  }

  if (trangThaiHoSo === TRANG_THAI_HO_SO_DOC_GIA.NGUNG_HOAT_DONG) {
    if (docGia.soSachDangMuon > 0 || docGia.tongTienPhatChuaTra > 0) {
      throw new AppError(
        `Khong the ngung hoat dong ho so doc gia '${docGia.maDocGia}' khi van con sach dang muon (${docGia.soSachDangMuon} quyen) hoac con no phat (${docGia.tongTienPhatChuaTra} VND)`,
        409,
        'DOC_GIA_CON_NGHIA_VU_CHUA_HOAN_TAT',
        {
          docGiaId: docGia._id,
          maDocGia: docGia.maDocGia,
          soSachDangMuon: docGia.soSachDangMuon,
          tongTienPhatChuaTra: docGia.tongTienPhatChuaTra,
        }
      );
    }

    // Tu dong khoa tai_khoan khi chuyen ho so sang NGUNG_HOAT_DONG theo Muc 5.2 docs/db.md
    const taiKhoan = await TaiKhoan.findById(docGia.taiKhoanId);
    if (taiKhoan && taiKhoan.trangThai !== TRANG_THAI_TAI_KHOAN.BI_KHOA) {
      const duLieuTruocTK = {
        trangThai: taiKhoan.trangThai,
        lyDoKhoa: taiKhoan.lyDoKhoa,
      };

      const lyDoKhoa =
        lyDo || 'Ho so doc gia chuyen sang trang thai NGUNG_HOAT_DONG';
      taiKhoan.trangThai = TRANG_THAI_TAI_KHOAN.BI_KHOA;
      taiKhoan.lyDoKhoa = lyDoKhoa;
      taiKhoan.ngayKhoa = new Date();
      taiKhoan.nguoiKhoaId = user.taiKhoanId;
      await taiKhoan.save();

      await NhatKyHeThong.create({
        hanhDong: HANH_DONG_NHAT_KY.KHOA_TAI_KHOAN,
        doiTuongCollection: TEN_COLLECTION.TAI_KHOAN,
        doiTuongId: taiKhoan._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc: duLieuTruocTK,
        duLieuSau: {
          trangThai: taiKhoan.trangThai,
          lyDoKhoa: taiKhoan.lyDoKhoa,
        },
        lyDo: lyDoKhoa,
        thoiDiem: new Date(),
      });
    }
  } else if (trangThaiHoSo === TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG) {
    // Neu kich hoat lai ho so doc gia thi mo khoa tai_khoan
    const taiKhoan = await TaiKhoan.findById(docGia.taiKhoanId);
    if (taiKhoan && taiKhoan.trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA) {
      const duLieuTruocTK = {
        trangThai: taiKhoan.trangThai,
        lyDoKhoa: taiKhoan.lyDoKhoa,
      };

      taiKhoan.trangThai = TRANG_THAI_TAI_KHOAN.HOAT_DONG;
      taiKhoan.lyDoKhoa = null;
      taiKhoan.ngayKhoa = null;
      taiKhoan.nguoiKhoaId = null;
      await taiKhoan.save();

      await NhatKyHeThong.create({
        hanhDong: HANH_DONG_NHAT_KY.MO_KHOA_TAI_KHOAN,
        doiTuongCollection: TEN_COLLECTION.TAI_KHOAN,
        doiTuongId: taiKhoan._id,
        nguoiThucHienId: user.taiKhoanId,
        vaiTroNguoiThucHien: user.vaiTro,
        duLieuTruoc: duLieuTruocTK,
        duLieuSau: {
          trangThai: taiKhoan.trangThai,
          lyDoKhoa: null,
        },
        lyDo: lyDo || 'Kich hoat lai ho so doc gia',
        thoiDiem: new Date(),
      });
    }
  }

  docGia.trangThaiHoSo = trangThaiHoSo;
  docGia.nguoiCapNhatId = user.taiKhoanId;
  await docGia.save();

  return layChiTietDocGia(docGia._id);
};

/**
 * Xoa Doc gia (BR-11 & Muc 5.2 docs/db.md):
 * - Cam xoa vat ly neu con sach chua tra (soSachDangMuon > 0), con no phat (tongTienPhatChuaTra > 0)
 *   hoac da tung phat sinh lich su giao dich (phieu_muon, khoan_phat).
 */
const xoaDocGia = async (id) => {
  const docGia = await DocGia.findById(id).lean();
  if (!docGia) {
    throw new AppError(
      'Khong tim thay ho so doc gia',
      404,
      'KHONG_TIM_THAY_DOC_GIA'
    );
  }

  const [soPhieuMuon, soKhoanPhat] = await Promise.all([
    PhieuMuon.countDocuments({ docGiaId: docGia._id }),
    KhoanPhat.countDocuments({ docGiaId: docGia._id }),
  ]);

  if (
    docGia.soSachDangMuon > 0 ||
    docGia.tongTienPhatChuaTra > 0 ||
    soPhieuMuon > 0 ||
    soKhoanPhat > 0
  ) {
    throw new AppError(
      `Khong the xoa doc gia '${docGia.maDocGia}' vi da phat sinh giao dich hoac con nghia vu chua hoan tat (${soPhieuMuon} phieu muon, ${soKhoanPhat} khoan phat). Vui long chuyen trangThaiHoSo sang NGUNG_HOAT_DONG va khoa tai khoan.`,
      409,
      'DOC_GIA_DA_PHAT_SINH_GIAO_DICH',
      {
        docGiaId: docGia._id,
        maDocGia: docGia.maDocGia,
        soSachDangMuon: docGia.soSachDangMuon,
        tongTienPhatChuaTra: docGia.tongTienPhatChuaTra,
        soPhieuMuon,
        soKhoanPhat,
      }
    );
  }

  // Xoa dong thoi doc_gia va tai_khoan lien ket
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await DocGia.deleteOne({ _id: docGia._id }, { session });
      await TaiKhoan.deleteOne({ _id: docGia.taiKhoanId }, { session });
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await DocGia.deleteOne({ _id: docGia._id });
      await TaiKhoan.deleteOne({ _id: docGia.taiKhoanId });
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return {
    _id: docGia._id,
    taiKhoanId: docGia.taiKhoanId,
    maDocGia: docGia.maDocGia,
    hoTen: `${docGia.hoLot} ${docGia.ten}`,
  };
};

module.exports = {
  layDanhSachDocGia,
  layChiTietDocGia,
  layHoSoCaNhanDocGia,
  taoDocGia,
  capNhatDocGia,
  capNhatHoSoCaNhanDocGia,
  capNhatQuyenMuonDocGia,
  capNhatTrangThaiTaiKhoanDocGia,
  capNhatTrangThaiHoSoDocGia,
  xoaDocGia,
};

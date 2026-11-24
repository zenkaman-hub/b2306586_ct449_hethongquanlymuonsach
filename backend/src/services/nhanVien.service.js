const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  TaiKhoan,
  NhanVien,
  PhieuMuon,
  KhoanPhat,
  NhatKyHeThong,
} = require('../models');
const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  TRANG_THAI_LAM_VIEC,
  HANH_DONG_NHAT_KY,
  TEN_COLLECTION,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;
const VAI_TRO_NHAN_VIEN = [VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU];

/**
 * Tao bieu thuc RegExp khop chinh xac chuoi khong phan biet hoa/thuong
 */
const taoRegexKhopChinhXacKhongPhanBietHoaThuong = (chuoi) => {
  const escaped = chuoi.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

/**
 * Tu dong sinh msnv tang dan (VD: NV0001, NV0002...)
 */
const sinhMsnvTiepTheo = async (session = null) => {
  const query = NhanVien.findOne({ msnv: /^NV\d+$/ }).sort({ msnv: -1 });
  if (session) {
    query.session(session);
  }
  const nvCuoi = await query.lean();
  if (!nvCuoi || !nvCuoi.msnv) {
    return 'NV0001';
  }
  const soHienTai = parseInt(nvCuoi.msnv.replace(/^NV/, ''), 10) || 0;
  const soTiepTheo = soHienTai + 1;
  return `NV${String(soTiepTheo).padStart(4, '0')}`;
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
 * Lay danh sach Nhan vien (tim kiem, loc theo trangThaiLamViec, vaiTro, trangThai tai khoan, phan trang)
 */
const layDanhSachNhanVien = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  // 1. Loc theo trangThaiLamViec
  if (
    query.trangThaiLamViec !== undefined &&
    String(query.trangThaiLamViec).trim() !== ''
  ) {
    const trangThaiLamViec = String(query.trangThaiLamViec)
      .trim()
      .toUpperCase();
    if (!Object.values(TRANG_THAI_LAM_VIEC).includes(trangThaiLamViec)) {
      throw new AppError(
        `Gia tri loc trangThaiLamViec '${query.trangThaiLamViec}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_LAM_VIEC).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'trangThaiLamViec',
            message: 'Gia tri loc trangThaiLamViec khong hop le',
          },
        ]
      );
    }
    filter.trangThaiLamViec = trangThaiLamViec;
  }

  // 2. Loc theo vaiTro (QUAN_TRI | THU_THU) hoac trangThai tai khoan
  const taiKhoanFilter = {};
  let coLocTaiKhoan = false;

  if (query.vaiTro !== undefined && String(query.vaiTro).trim() !== '') {
    const vaiTro = String(query.vaiTro).trim().toUpperCase();
    if (!VAI_TRO_NHAN_VIEN.includes(vaiTro)) {
      throw new AppError(
        `Gia tri loc vaiTro '${query.vaiTro}' khong hop le. Chi chap nhan: ${VAI_TRO_NHAN_VIEN.join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'vaiTro', message: 'Gia tri loc vaiTro khong hop le' }]
      );
    }
    taiKhoanFilter.vaiTro = vaiTro;
    coLocTaiKhoan = true;
  }

  if (query.trangThai !== undefined && String(query.trangThai).trim() !== '') {
    const trangThai = String(query.trangThai).trim().toUpperCase();
    if (!Object.values(TRANG_THAI_TAI_KHOAN).includes(trangThai)) {
      throw new AppError(
        `Gia tri loc trangThai '${query.trangThai}' khong hop le. Chi chap nhan: ${Object.values(TRANG_THAI_TAI_KHOAN).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'trangThai', message: 'Gia tri loc trangThai khong hop le' }]
      );
    }
    taiKhoanFilter.trangThai = trangThai;
    coLocTaiKhoan = true;
  }

  if (coLocTaiKhoan) {
    if (!taiKhoanFilter.vaiTro) {
      taiKhoanFilter.vaiTro = { $in: VAI_TRO_NHAN_VIEN };
    }
    const dsTaiKhoan = await TaiKhoan.find(taiKhoanFilter)
      .select('_id')
      .lean();
    filter.taiKhoanId = { $in: dsTaiKhoan.map((tk) => tk._id) };
  }

  // 3. Tim kiem theo tuKhoa (msnv, hoTenNV, chucVu, soDienThoai, diaChi)
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
      { msnv: regex },
      { hoTenNV: regex },
      { chucVu: regex },
      { soDienThoai: regex },
      { diaChi: regex },
    ];
  }

  const [danhSach, tongSo] = await Promise.all([
    NhanVien.find(filter)
      .populate(
        'taiKhoanId',
        'tenDangNhap email vaiTro trangThai lyDoKhoa ngayKhoa lanDangNhapCuoi ngayTao'
      )
      .sort({ msnv: 1, ngayTao: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NhanVien.countDocuments(filter),
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
 * Lay chi tiet 1 Nhan vien theo _id
 */
const layChiTietNhanVien = async (id) => {
  const nhanVien = await NhanVien.findById(id)
    .populate(
      'taiKhoanId',
      'tenDangNhap email vaiTro trangThai lyDoKhoa ngayKhoa nguoiKhoaId lanDangNhapCuoi ngayTao ngayCapNhat'
    )
    .lean();

  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  return nhanVien;
};

/**
 * Nhan vien (QUAN_TRI / THU_THU) xem ho so nhan su cua chinh minh
 */
const layHoSoCaNhanNhanVien = async (taiKhoanId) => {
  const nhanVien = await NhanVien.findOne({ taiKhoanId })
    .populate(
      'taiKhoanId',
      'tenDangNhap email vaiTro trangThai lanDangNhapCuoi ngayTao ngayCapNhat'
    )
    .lean();

  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien lien ket voi tai khoan nay',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  return nhanVien;
};

/**
 * Quan tri vien tao moi Tai khoan + Ho so Nhan vien (Transaction - BR-14)
 */
const taoNhanVien = async (duLieu, nguoiThucHienId) => {
  // 1. Kiem tra trung tenDangNhap, email, msnv, soDienThoai
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

  if (duLieu.msnv) {
    const nvTrungMa = await NhanVien.findOne({
      msnv: taoRegexKhopChinhXacKhongPhanBietHoaThuong(duLieu.msnv),
    }).lean();
    if (nvTrungMa) {
      throw new AppError(
        `Ma so nhan vien '${duLieu.msnv}' da ton tai`,
        409,
        'MSNV_DA_TON_TAI'
      );
    }
  }

  const nvTrungSdt = await NhanVien.findOne({
    soDienThoai: duLieu.soDienThoai,
  }).lean();
  if (nvTrungSdt) {
    throw new AppError(
      `So dien thoai '${duLieu.soDienThoai}' da duoc su dung cho nhan vien '${nvTrungSdt.msnv}'`,
      409,
      'DIEN_THOAI_DA_TON_TAI'
    );
  }

  const matKhauHash = await bcrypt.hash(duLieu.matKhau, SALT_ROUNDS);
  let nhanVienMoi = null;

  // 2. Thuc thi tao tai_khoan va nhan_vien trong Transaction
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const msnv = duLieu.msnv || (await sinhMsnvTiepTheo(session));

      const [tk] = await TaiKhoan.create(
        [
          {
            tenDangNhap: duLieu.tenDangNhap,
            email: duLieu.email || null,
            matKhauHash,
            vaiTro: duLieu.vaiTro || VAI_TRO.THU_THU,
            trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
          },
        ],
        { session }
      );

      const [nv] = await NhanVien.create(
        [
          {
            taiKhoanId: tk._id,
            msnv,
            hoTenNV: duLieu.hoTenNV,
            chucVu: duLieu.chucVu,
            diaChi: duLieu.diaChi || null,
            soDienThoai: duLieu.soDienThoai,
            trangThaiLamViec: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
            nguoiTaoId: nguoiThucHienId,
            nguoiCapNhatId: nguoiThucHienId,
          },
        ],
        { session }
      );

      nhanVienMoi = nv;
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      let tkFallback = null;
      try {
        const msnv = duLieu.msnv || (await sinhMsnvTiepTheo(null));
        tkFallback = await TaiKhoan.create({
          tenDangNhap: duLieu.tenDangNhap,
          email: duLieu.email || null,
          matKhauHash,
          vaiTro: duLieu.vaiTro || VAI_TRO.THU_THU,
          trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
        });

        nhanVienMoi = await NhanVien.create({
          taiKhoanId: tkFallback._id,
          msnv,
          hoTenNV: duLieu.hoTenNV,
          chucVu: duLieu.chucVu,
          diaChi: duLieu.diaChi || null,
          soDienThoai: duLieu.soDienThoai,
          trangThaiLamViec: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
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

  return layChiTietNhanVien(nhanVienMoi._id);
};

/**
 * Quan tri vien cap nhat thong tin ho so Nhan vien
 */
const capNhatNhanVien = async (id, duLieuCapNhat, user) => {
  const nhanVien = await NhanVien.findById(id);
  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  // 1. Kiem tra neu doi msnv
  if (duLieuCapNhat.msnv && duLieuCapNhat.msnv !== nhanVien.msnv) {
    const nvTrungMa = await NhanVien.findOne({
      msnv: taoRegexKhopChinhXacKhongPhanBietHoaThuong(duLieuCapNhat.msnv),
      _id: { $ne: nhanVien._id },
    }).lean();

    if (nvTrungMa) {
      throw new AppError(
        `Ma so nhan vien '${duLieuCapNhat.msnv}' da ton tai`,
        409,
        'MSNV_DA_TON_TAI'
      );
    }
    nhanVien.msnv = duLieuCapNhat.msnv;
  }

  // 2. Kiem tra neu doi soDienThoai
  if (
    duLieuCapNhat.soDienThoai &&
    duLieuCapNhat.soDienThoai !== nhanVien.soDienThoai
  ) {
    const nvTrungSdt = await NhanVien.findOne({
      soDienThoai: duLieuCapNhat.soDienThoai,
      _id: { $ne: nhanVien._id },
    }).lean();

    if (nvTrungSdt) {
      throw new AppError(
        `So dien thoai '${duLieuCapNhat.soDienThoai}' da duoc su dung boi nhan vien khac`,
        409,
        'DIEN_THOAI_DA_TON_TAI'
      );
    }
    nhanVien.soDienThoai = duLieuCapNhat.soDienThoai;
  }

  // 3. Kiem tra neu doi email hoac vaiTro trong tai_khoan lien ket
  const updateTaiKhoan = {};

  if (duLieuCapNhat.email !== undefined) {
    if (duLieuCapNhat.email !== null) {
      const tkTrungEmail = await TaiKhoan.findOne({
        email: duLieuCapNhat.email,
        _id: { $ne: nhanVien.taiKhoanId },
      }).lean();

      if (tkTrungEmail) {
        throw new AppError(
          `Email '${duLieuCapNhat.email}' da duoc su dung`,
          409,
          'EMAIL_DA_TON_TAI'
        );
      }
    }
    updateTaiKhoan.email = duLieuCapNhat.email;
  }

  if (duLieuCapNhat.vaiTro !== undefined) {
    // Khong cho phep Quan tri vien tu ha quyen cua chinh minh
    if (
      nhanVien.taiKhoanId.toString() === user.taiKhoanId.toString() &&
      duLieuCapNhat.vaiTro !== VAI_TRO.QUAN_TRI
    ) {
      throw new AppError(
        'Quan tri vien khong the tu ha vai tro cua chinh minh',
        400,
        'KHONG_THE_TU_HA_QUYEN_QUAN_TRI'
      );
    }
    updateTaiKhoan.vaiTro = duLieuCapNhat.vaiTro;
  }

  if (duLieuCapNhat.hoTenNV !== undefined) {
    nhanVien.hoTenNV = duLieuCapNhat.hoTenNV;
  }
  if (duLieuCapNhat.chucVu !== undefined) {
    nhanVien.chucVu = duLieuCapNhat.chucVu;
  }
  if (duLieuCapNhat.diaChi !== undefined) {
    nhanVien.diaChi = duLieuCapNhat.diaChi;
  }

  nhanVien.nguoiCapNhatId = user.taiKhoanId;
  await nhanVien.save();

  if (Object.keys(updateTaiKhoan).length > 0) {
    await TaiKhoan.updateOne(
      { _id: nhanVien.taiKhoanId },
      { $set: updateTaiKhoan }
    );
  }

  return layChiTietNhanVien(nhanVien._id);
};

/**
 * Chuyen trang thai lam viec cua Nhan vien (DANG_LAM_VIEC / NGHI_VIEC - Soft delete theo BR-11 & Muc 5.2 docs/db.md):
 * - Khong cho phep Quan tri vien tu chuyen chinh minh sang NGHI_VIEC.
 * - Khi chuyen sang NGHI_VIEC: tu dong khoa tai_khoan lien ket va ghi nhat_ky_he_thong (BR-12).
 */
const capNhatTrangThaiLamViecNhanVien = async (
  id,
  { trangThaiLamViec, lyDo },
  user
) => {
  const nhanVien = await NhanVien.findById(id);
  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  if (
    nhanVien.taiKhoanId.toString() === user.taiKhoanId.toString() &&
    trangThaiLamViec === TRANG_THAI_LAM_VIEC.NGHI_VIEC
  ) {
    throw new AppError(
      'Quan tri vien khong the tu chuyen trang thai lam viec cua chinh minh sang NGHI_VIEC',
      400,
      'KHONG_THE_TU_KHOA_CHINH_MINH'
    );
  }

  if (nhanVien.trangThaiLamViec === trangThaiLamViec) {
    throw new AppError(
      `Nhan vien hien da o trang thai lam viec '${trangThaiLamViec}'`,
      400,
      'TRANG_THAI_KHONG_THAY_DOI'
    );
  }

  const taiKhoan = await TaiKhoan.findById(nhanVien.taiKhoanId);

  if (trangThaiLamViec === TRANG_THAI_LAM_VIEC.NGHI_VIEC) {
    if (taiKhoan && taiKhoan.trangThai !== TRANG_THAI_TAI_KHOAN.BI_KHOA) {
      const duLieuTruocTK = {
        trangThai: taiKhoan.trangThai,
        lyDoKhoa: taiKhoan.lyDoKhoa,
      };

      const lyDoKhoa =
        lyDo || 'Nhan vien chuyen sang trang thai NGHI_VIEC';
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
  } else if (trangThaiLamViec === TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC) {
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
        lyDo: lyDo || 'Nhan vien quay tro lai lam viec (DANG_LAM_VIEC)',
        thoiDiem: new Date(),
      });
    }
  }

  nhanVien.trangThaiLamViec = trangThaiLamViec;
  nhanVien.nguoiCapNhatId = user.taiKhoanId;
  await nhanVien.save();

  return layChiTietNhanVien(nhanVien._id);
};

/**
 * Khoa hoac mo khoa tai khoan dang nhap cua Nhan vien (BR-03 & BR-12):
 * - Khong cho phep Quan tri vien tu khoa tai khoan cua chinh minh.
 * - Khong cho phep mo khoa tai khoan neu nhan vien dang o trang thai NGHI_VIEC.
 * - Ghi nhat_ky_he_thong (KHOA_TAI_KHOAN / MO_KHOA_TAI_KHOAN).
 */
const capNhatTrangThaiTaiKhoanNhanVien = async (
  id,
  { trangThai, lyDo },
  user
) => {
  const nhanVien = await NhanVien.findById(id);
  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  if (
    nhanVien.taiKhoanId.toString() === user.taiKhoanId.toString() &&
    trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA
  ) {
    throw new AppError(
      'Quan tri vien khong the tu khoa tai khoan cua chinh minh',
      400,
      'KHONG_THE_TU_KHOA_CHINH_MINH'
    );
  }

  if (
    trangThai === TRANG_THAI_TAI_KHOAN.HOAT_DONG &&
    nhanVien.trangThaiLamViec === TRANG_THAI_LAM_VIEC.NGHI_VIEC
  ) {
    throw new AppError(
      `Nhan vien '${nhanVien.msnv}' dang o trang thai NGHI_VIEC. Vui long chuyen trangThaiLamViec sang DANG_LAM_VIEC truoc khi mo khoa tai khoan.`,
      409,
      'NHAN_VIEN_DANG_NGHI_VIEC'
    );
  }

  const taiKhoan = await TaiKhoan.findById(nhanVien.taiKhoanId);
  if (!taiKhoan) {
    throw new AppError(
      'Khong tim thay tai khoan lien ket voi nhan vien nay',
      404,
      'TAI_KHOAN_KHONG_TON_TAI'
    );
  }

  if (taiKhoan.trangThai === trangThai) {
    throw new AppError(
      `Tai khoan cua nhan vien hien da o trang thai '${trangThai}'`,
      400,
      'TRANG_THAI_KHONG_THAY_DOI'
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

  nhanVien.nguoiCapNhatId = user.taiKhoanId;
  await nhanVien.save();

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
    lyDo: lyDo || 'Mo khoa tai khoan nhan vien',
    thoiDiem: new Date(),
  });

  return layChiTietNhanVien(nhanVien._id);
};

/**
 * Xoa Nhan vien (BR-11 & Muc 5.2 docs/db.md):
 * - Khong cho phep Quan tri vien tu xoa chinh minh.
 * - Cam xoa vat ly neu nhan vien da tung lap phieu muon, huy phieu, xac nhan tra sach,
 *   duyet gia han hoac tao/xu ly khoan phat.
 */
const xoaNhanVien = async (id, user) => {
  const nhanVien = await NhanVien.findById(id).lean();
  if (!nhanVien) {
    throw new AppError(
      'Khong tim thay ho so nhan vien',
      404,
      'KHONG_TIM_THAY_NHAN_VIEN'
    );
  }

  if (nhanVien.taiKhoanId.toString() === user.taiKhoanId.toString()) {
    throw new AppError(
      'Quan tri vien khong the tu xoa ho so va tai khoan cua chinh minh',
      400,
      'KHONG_THE_TU_XOA_CHINH_MINH'
    );
  }

  const [soPhieuMuonLienQuan, soKhoanPhatLienQuan, soNhatKyLienQuan] =
    await Promise.all([
      PhieuMuon.countDocuments({
        $or: [
          { nhanVienLapId: nhanVien._id },
          { nguoiHuyId: nhanVien._id },
          { 'chiTietMuon.nhanVienXacNhanTraId': nhanVien._id },
          { 'chiTietMuon.lichSuGiaHan.nguoiDuyetId': nhanVien._id },
        ],
      }),
      KhoanPhat.countDocuments({
        $or: [{ nguoiTaoId: nhanVien._id }, { nguoiXuLyId: nhanVien._id }],
      }),
      NhatKyHeThong.countDocuments({
        nguoiThucHienId: nhanVien.taiKhoanId,
      }),
    ]);

  if (
    soPhieuMuonLienQuan > 0 ||
    soKhoanPhatLienQuan > 0 ||
    soNhatKyLienQuan > 0
  ) {
    throw new AppError(
      `Khong the xoa nhan vien '${nhanVien.msnv}' vi da tung tham gia xu ly nghiep vu (${soPhieuMuonLienQuan} phieu muon, ${soKhoanPhatLienQuan} khoan phat, ${soNhatKyLienQuan} nhat ky he thong). Vui long chuyen trangThaiLamViec sang NGHI_VIEC va khoa tai khoan.`,
      409,
      'NHAN_VIEN_DA_PHAT_SINH_GIAO_DICH',
      {
        nhanVienId: nhanVien._id,
        msnv: nhanVien.msnv,
        soPhieuMuonLienQuan,
        soKhoanPhatLienQuan,
        soNhatKyLienQuan,
      }
    );
  }

  // Xoa dong thoi nhan_vien va tai_khoan lien ket trong Transaction
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await NhanVien.deleteOne({ _id: nhanVien._id }, { session });
      await TaiKhoan.deleteOne({ _id: nhanVien.taiKhoanId }, { session });
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      await NhanVien.deleteOne({ _id: nhanVien._id });
      await TaiKhoan.deleteOne({ _id: nhanVien.taiKhoanId });
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  return {
    _id: nhanVien._id,
    taiKhoanId: nhanVien.taiKhoanId,
    msnv: nhanVien.msnv,
    hoTenNV: nhanVien.hoTenNV,
  };
};

module.exports = {
  layDanhSachNhanVien,
  layChiTietNhanVien,
  layHoSoCaNhanNhanVien,
  taoNhanVien,
  capNhatNhanVien,
  capNhatTrangThaiLamViecNhanVien,
  capNhatTrangThaiTaiKhoanNhanVien,
  xoaNhanVien,
};

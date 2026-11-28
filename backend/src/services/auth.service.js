const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  TaiKhoan,
  DocGia,
  NhanVien,
  CauHinhThuVien,
} = require('../models');
const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  CACH_CAP_TAI_KHOAN_DOC_GIA,
  MA_CAU_HINH,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

// Ký JWT token cho tài khoản
const taoJwtToken = (taiKhoan, hoSoId = null) => {
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_dev';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(
    {
      sub: taiKhoan._id.toString(),
      tenDangNhap: taiKhoan.tenDangNhap,
      vaiTro: taiKhoan.vaiTro,
      hoSoId: hoSoId ? hoSoId.toString() : null,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Sinh mã độc giả tăng dần (DG0001, DG0002...)
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

// Kiểm tra lỗi MongoDB Standalone không hỗ trợ transaction
const laLoiKhongHoTroTransaction = (error) => {
  if (!error || !error.message) return false;
  return (
    error.message.includes('Transaction numbers are only allowed on a replica set') ||
    error.message.includes('transactions are not supported')
  );
};

// Đăng ký tài khoản độc giả (dùng transaction đảm bảo nguyên tử theo BR-14)
const dangKyDocGia = async (duLieu) => {
  const cauHinh = await CauHinhThuVien.findOne({
    maCauHinh: MA_CAU_HINH.MAC_DINH,
  }).lean();

  if (
    cauHinh &&
    cauHinh.cachCapTaiKhoanDocGia === CACH_CAP_TAI_KHOAN_DOC_GIA.CHI_NHAN_VIEN_TAO
  ) {
    throw new AppError(
      'Thu vien hien khong cho phep doc gia tu dang ky tai khoan truc tuyen',
      403,
      'KHONG_CHO_PHEP_TU_DANG_KY'
    );
  }

  const yeuCauDienThoaiDuyNhat =
    cauHinh && typeof cauHinh.yeuCauDienThoaiDuyNhat === 'boolean'
      ? cauHinh.yeuCauDienThoaiDuyNhat
      : true;

  const yeuCauXacMinh =
    cauHinh && typeof cauHinh.yeuCauXacMinhTaiKhoanDocGia === 'boolean'
      ? cauHinh.yeuCauXacMinhTaiKhoanDocGia
      : false;

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

  if (yeuCauDienThoaiDuyNhat) {
    const docGiaTrungSdt = await DocGia.findOne({
      dienThoai: duLieu.dienThoai,
    }).lean();
    if (docGiaTrungSdt) {
      throw new AppError(
        `So dien thoai '${duLieu.dienThoai}' da duoc dang ky`,
        409,
        'DIEN_THOAI_DA_TON_TAI'
      );
    }
  }

  const matKhauHash = await bcrypt.hash(duLieu.matKhau, SALT_ROUNDS);
  const trangThaiTaiKhoan = yeuCauXacMinh
    ? TRANG_THAI_TAI_KHOAN.CHO_XAC_MINH
    : TRANG_THAI_TAI_KHOAN.HOAT_DONG;

  let taiKhoanMoi = null;
  let docGiaMoi = null;

  // Tạo tài khoản và hồ sơ trong transaction (có fallback rollback cho Standalone)
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const maDocGia = await sinhMaDocGiaTiepTheo(session);

      const [tk] = await TaiKhoan.create(
        [
          {
            tenDangNhap: duLieu.tenDangNhap,
            email: duLieu.email || null,
            matKhauHash,
            vaiTro: VAI_TRO.DOC_GIA,
            trangThai: trangThaiTaiKhoan,
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
            nguoiTaoId: tk._id,
            nguoiCapNhatId: tk._id,
          },
        ],
        { session }
      );

      taiKhoanMoi = tk;
      docGiaMoi = dg;
    });
  } catch (err) {
    if (laLoiKhongHoTroTransaction(err)) {
      // Fallback cho MongoDB Standalone: rollback thủ công nếu tạo hồ sơ thất bại
      let tkFallback = null;
      try {
        const maDocGia = await sinhMaDocGiaTiepTheo(null);
        tkFallback = await TaiKhoan.create({
          tenDangNhap: duLieu.tenDangNhap,
          email: duLieu.email || null,
          matKhauHash,
          vaiTro: VAI_TRO.DOC_GIA,
          trangThai: trangThaiTaiKhoan,
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
          nguoiTaoId: tkFallback._id,
          nguoiCapNhatId: tkFallback._id,
        });
        taiKhoanMoi = tkFallback;
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

  const token =
    taiKhoanMoi.trangThai === TRANG_THAI_TAI_KHOAN.HOAT_DONG
      ? taoJwtToken(taiKhoanMoi, docGiaMoi._id)
      : null;

  return {
    token,
    taiKhoan: {
      _id: taiKhoanMoi._id,
      tenDangNhap: taiKhoanMoi.tenDangNhap,
      email: taiKhoanMoi.email,
      vaiTro: taiKhoanMoi.vaiTro,
      trangThai: taiKhoanMoi.trangThai,
      ngayTao: taiKhoanMoi.ngayTao,
    },
    hoSoDocGia: {
      _id: docGiaMoi._id,
      maDocGia: docGiaMoi.maDocGia,
      hoLot: docGiaMoi.hoLot,
      ten: docGiaMoi.ten,
      ngaySinh: docGiaMoi.ngaySinh,
      phai: docGiaMoi.phai,
      diaChi: docGiaMoi.diaChi,
      dienThoai: docGiaMoi.dienThoai,
      trangThaiQuyenMuon: docGiaMoi.trangThaiQuyenMuon,
      soSachDangMuon: docGiaMoi.soSachDangMuon,
      tongTienPhatChuaTra: docGiaMoi.tongTienPhatChuaTra,
      trangThaiHoSo: docGiaMoi.trangThaiHoSo,
    },
  };
};

// Đăng nhập hệ thống
const dangNhap = async ({ tenDangNhap, matKhau }) => {
  const taiKhoan = await TaiKhoan.findOne({ tenDangNhap });
  if (!taiKhoan) {
    throw new AppError(
      'Ten dang nhap hoac mat khau khong chinh xac',
      401,
      'SAI_THONG_TIN_DANG_NHAP'
    );
  }

  const matKhauHopLe = await bcrypt.compare(matKhau, taiKhoan.matKhauHash);
  if (!matKhauHopLe) {
    throw new AppError(
      'Ten dang nhap hoac mat khau khong chinh xac',
      401,
      'SAI_THONG_TIN_DANG_NHAP'
    );
  }

  // BR-03: Tài khoản bị khóa không được đăng nhập
  if (taiKhoan.trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA) {
    throw new AppError(
      taiKhoan.lyDoKhoa
        ? `Tai khoan da bi khoa. Ly do: ${taiKhoan.lyDoKhoa}`
        : 'Tai khoan cua ban da bi khoa, vui long lien he thu vien',
      403,
      'TAI_KHOAN_BI_KHOA'
    );
  }

  if (taiKhoan.trangThai === TRANG_THAI_TAI_KHOAN.CHO_XAC_MINH) {
    throw new AppError(
      'Tai khoan dang cho xac minh, chua the dang nhap',
      403,
      'TAI_KHOAN_CHO_XAC_MINH'
    );
  }

  // BR-04: Độc giả bị hạn chế quyền mượn vẫn đăng nhập tra cứu được
  let hoSo = null;
  if (taiKhoan.vaiTro === VAI_TRO.DOC_GIA) {
    hoSo = await DocGia.findOne({ taiKhoanId: taiKhoan._id }).lean();
  } else {
    hoSo = await NhanVien.findOne({ taiKhoanId: taiKhoan._id }).lean();
  }

  taiKhoan.lanDangNhapCuoi = new Date();
  await taiKhoan.save();

  const token = taoJwtToken(taiKhoan, hoSo ? hoSo._id : null);

  return {
    token,
    taiKhoan: {
      _id: taiKhoan._id,
      tenDangNhap: taiKhoan.tenDangNhap,
      email: taiKhoan.email,
      vaiTro: taiKhoan.vaiTro,
      trangThai: taiKhoan.trangThai,
      lanDangNhapCuoi: taiKhoan.lanDangNhapCuoi,
    },
    hoSo,
  };
};

// Đổi mật khẩu tài khoản hiện tại
const doiMatKhau = async (taiKhoanId, { matKhauHienTai, matKhauMoi }) => {
  const taiKhoan = await TaiKhoan.findById(taiKhoanId);
  if (!taiKhoan) {
    throw new AppError(
      'Khong tim thay tai khoan',
      404,
      'TAI_KHOAN_KHONG_TON_TAI'
    );
  }

  const khopMatKhauCu = await bcrypt.compare(
    matKhauHienTai,
    taiKhoan.matKhauHash
  );
  if (!khopMatKhauCu) {
    throw new AppError(
      'Mat khau hien tai khong chinh xac',
      400,
      'MAT_KHAU_HIEN_TAI_KHONG_DUNG'
    );
  }

  taiKhoan.matKhauHash = await bcrypt.hash(matKhauMoi, SALT_ROUNDS);
  taiKhoan.ngayDoiMatKhauCuoi = new Date();
  await taiKhoan.save();

  return {
    ngayDoiMatKhauCuoi: taiKhoan.ngayDoiMatKhauCuoi,
  };
};

// Lấy thông tin tài khoản và hồ sơ người dùng hiện tại
const layThongTinHienTai = async (taiKhoanId) => {
  const taiKhoan = await TaiKhoan.findById(taiKhoanId)
    .select('-matKhauHash')
    .lean();

  if (!taiKhoan) {
    throw new AppError(
      'Khong tim thay tai khoan',
      404,
      'TAI_KHOAN_KHONG_TON_TAI'
    );
  }

  let hoSo = null;
  if (taiKhoan.vaiTro === VAI_TRO.DOC_GIA) {
    hoSo = await DocGia.findOne({ taiKhoanId: taiKhoan._id }).lean();
  } else {
    hoSo = await NhanVien.findOne({ taiKhoanId: taiKhoan._id }).lean();
  }

  return {
    taiKhoan,
    hoSo,
  };
};

module.exports = {
  dangKyDocGia,
  dangNhap,
  doiMatKhau,
  layThongTinHienTai,
};

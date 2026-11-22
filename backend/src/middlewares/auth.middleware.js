const jwt = require('jsonwebtoken');
const { TaiKhoan, DocGia, NhanVien } = require('../models');
const { VAI_TRO, TRANG_THAI_TAI_KHOAN } = require('../constants/enums');
const AppError = require('../utils/AppError');

/**
 * Middleware xac thuc JWT Token va kiem tra trang thai tai khoan (BR-03)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Vui long dang nhap de thuc hien thao tac nay',
        401,
        'CHUA_XAC_THUC'
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(
        'Khong tim thay token xac thuc',
        401,
        'CHUA_XAC_THUC'
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_dev';
    const decoded = jwt.verify(token, jwtSecret);

    const taiKhoan = await TaiKhoan.findById(decoded.sub).lean();
    if (!taiKhoan) {
      throw new AppError(
        'Tai khoan khong ton tai hoac da bi xoa',
        401,
        'TAI_KHOAN_KHONG_TON_TAI'
      );
    }

    // BR-03: Tai khoan bi khoa khong duoc phep truy cap
    if (taiKhoan.trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA) {
      throw new AppError(
        taiKhoan.lyDoKhoa
          ? `Tai khoan da bi khoa. Ly do: ${taiKhoan.lyDoKhoa}`
          : 'Tai khoan cua ban da bi khoa',
        403,
        'TAI_KHOAN_BI_KHOA'
      );
    }

    if (taiKhoan.trangThai === TRANG_THAI_TAI_KHOAN.CHO_XAC_MINH) {
      throw new AppError(
        'Tai khoan dang cho xac minh, chua the truy cap he thong',
        403,
        'TAI_KHOAN_CHO_XAC_MINH'
      );
    }

    // Kiem tra neu token duoc cap truoc thoi diem doi mat khau gan nhat
    if (taiKhoan.ngayDoiMatKhauCuoi && decoded.iat) {
      const passwordChangedTimestamp = Math.floor(
        new Date(taiKhoan.ngayDoiMatKhauCuoi).getTime() / 1000
      );
      if (decoded.iat < passwordChangedTimestamp) {
        throw new AppError(
          'Mat khau da thay doi, vui long dang nhap lai',
          401,
          'TOKEN_HET_HIEU_LUC'
        );
      }
    }

    // Lay hoSoId tuong ung voi vaiTro
    let hoSoId = decoded.hoSoId || null;
    if (!hoSoId) {
      if (taiKhoan.vaiTro === VAI_TRO.DOC_GIA) {
        const docGia = await DocGia.findOne({ taiKhoanId: taiKhoan._id })
          .select('_id maDocGia trangThaiQuyenMuon')
          .lean();
        hoSoId = docGia ? docGia._id : null;
      } else {
        const nhanVien = await NhanVien.findOne({ taiKhoanId: taiKhoan._id })
          .select('_id msnv')
          .lean();
        hoSoId = nhanVien ? nhanVien._id : null;
      }
    }

    req.user = {
      taiKhoanId: taiKhoan._id,
      tenDangNhap: taiKhoan.tenDangNhap,
      email: taiKhoan.email,
      vaiTro: taiKhoan.vaiTro,
      trangThai: taiKhoan.trangThai,
      hoSoId,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Middleware phan quyen theo danh sach vai tro (QUAN_TRI, THU_THU, DOC_GIA)
 * @param  {...string} dsVaiTroChoPhep
 */
const authorize = (...dsVaiTroChoPhep) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          'Vui long dang nhap truoc khi kiem tra quyen',
          401,
          'CHUA_XAC_THUC'
        )
      );
    }

    if (!dsVaiTroChoPhep.includes(req.user.vaiTro)) {
      return next(
        new AppError(
          'Ban khong co quyen truy cap chuc nang nay',
          403,
          'KHONG_DU_QUYEN',
          {
            vaiTroHienTai: req.user.vaiTro,
            vaiTroYeuCau: dsVaiTroChoPhep,
          }
        )
      );
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
};

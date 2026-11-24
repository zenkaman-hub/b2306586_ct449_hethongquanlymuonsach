const { CACH_CAP_TAI_KHOAN_DOC_GIA } = require('../constants/enums');
const AppError = require('../utils/AppError');

/**
 * Chuan hoa chuoi: cat khoang trang dau/cuoi va gop nhieu khoang trang lien tiep thanh 1
 */
const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

/**
 * Kiem tra so nguyen >= min
 */
const laSoNguyenToiThieu = (val, min) =>
  typeof val === 'number' && Number.isInteger(val) && val >= min;

/**
 * Kiem tra so thuc >= min
 */
const laSoThucToiThieu = (val, min) =>
  typeof val === 'number' && Number.isFinite(val) && val >= min;

/**
 * Validate du lieu khi Quan tri vien cap nhat Cau hinh thu vien (PUT /api/settings)
 * Tat ca cac truong deu theo chuan Muc 4.9 docs/db.md
 */
const validateCapNhatCauHinh = (body = {}) => {
  const errors = [];
  const duLieuCapNhat = {};

  // Cac truong so nguyen >= 1 (cho phep null)
  const dsTruongSoNguyenMin1 = [
    'soNgayMuonMacDinh',
    'soSachMuonToiDa',
    'soNgayGiaHanMoiLan',
    'nguongSoNgayQuaHanKhoaMuon',
  ];

  for (const field of dsTruongSoNguyenMin1) {
    if (body[field] !== undefined) {
      if (body[field] === null) {
        duLieuCapNhat[field] = null;
      } else {
        const val =
          typeof body[field] === 'string' && body[field].trim() !== ''
            ? Number(body[field])
            : body[field];
        if (!laSoNguyenToiThieu(val, 1)) {
          errors.push({
            field,
            message: `${field} phai la so nguyen >= 1 (hoac null)`,
          });
        } else {
          duLieuCapNhat[field] = val;
        }
      }
    }
  }

  // Cac truong so nguyen >= 0 (cho phep null)
  const dsTruongSoNguyenMin0 = ['soLanGiaHanToiDa', 'soNgayNhacTraTruocHan'];

  for (const field of dsTruongSoNguyenMin0) {
    if (body[field] !== undefined) {
      if (body[field] === null) {
        duLieuCapNhat[field] = null;
      } else {
        const val =
          typeof body[field] === 'string' && body[field].trim() !== ''
            ? Number(body[field])
            : body[field];
        if (!laSoNguyenToiThieu(val, 0)) {
          errors.push({
            field,
            message: `${field} phai la so nguyen >= 0 (hoac null)`,
          });
        } else {
          duLieuCapNhat[field] = val;
        }
      }
    }
  }

  // Cac truong so thuc >= 0 (cho phep null)
  const dsTruongSoThucMin0 = [
    'tienPhatTraTreMoiNgay',
    'tyLeBoiThuongSachMat',
    'tyLeBoiThuongSachHuHong',
  ];

  for (const field of dsTruongSoThucMin0) {
    if (body[field] !== undefined) {
      if (body[field] === null) {
        duLieuCapNhat[field] = null;
      } else {
        const val =
          typeof body[field] === 'string' && body[field].trim() !== ''
            ? Number(body[field])
            : body[field];
        if (!laSoThucToiThieu(val, 0)) {
          errors.push({
            field,
            message: `${field} phai la so khong am >= 0 (hoac null)`,
          });
        } else {
          duLieuCapNhat[field] = val;
        }
      }
    }
  }

  // Cac truong Boolean (cho phep null)
  const dsTruongBoolean = [
    'hanCheMuonKhiCoViPham',
    'choPhepDatTruoc',
    'yeuCauXacMinhTaiKhoanDocGia',
    'yeuCauDienThoaiDuyNhat',
  ];

  for (const field of dsTruongBoolean) {
    if (body[field] !== undefined) {
      if (body[field] === null) {
        duLieuCapNhat[field] = null;
      } else if (typeof body[field] !== 'boolean') {
        errors.push({
          field,
          message: `${field} phai la kieu boolean (true/false hoac null)`,
        });
      } else {
        duLieuCapNhat[field] = body[field];
      }
    }
  }

  // Truong Enum cachCapTaiKhoanDocGia
  if (body.cachCapTaiKhoanDocGia !== undefined) {
    if (body.cachCapTaiKhoanDocGia === null) {
      duLieuCapNhat.cachCapTaiKhoanDocGia = null;
    } else if (typeof body.cachCapTaiKhoanDocGia !== 'string') {
      errors.push({
        field: 'cachCapTaiKhoanDocGia',
        message: 'cachCapTaiKhoanDocGia phai la kieu chuoi (string) hoac null',
      });
    } else {
      const val = body.cachCapTaiKhoanDocGia.trim().toUpperCase();
      if (!Object.values(CACH_CAP_TAI_KHOAN_DOC_GIA).includes(val)) {
        errors.push({
          field: 'cachCapTaiKhoanDocGia',
          message: `cachCapTaiKhoanDocGia phai thuoc mot trong cac gia tri: ${Object.values(CACH_CAP_TAI_KHOAN_DOC_GIA).join(', ')}`,
        });
      } else {
        duLieuCapNhat.cachCapTaiKhoanDocGia = val;
      }
    }
  }

  // Truong lyDo (tuy chon nhung khuyen khich de ghi nhat_ky_he_thong)
  let lyDo = 'Cap nhat cau hinh chinh sach thu vien';
  if (body.lyDo !== undefined && body.lyDo !== null) {
    if (typeof body.lyDo !== 'string') {
      errors.push({
        field: 'lyDo',
        message: 'lyDo phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.lyDo);
      if (cleaned) {
        lyDo = cleaned;
      }
    }
  }

  if (errors.length > 0) {
    throw new AppError(
      errors[0].message,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      errors
    );
  }

  if (Object.keys(duLieuCapNhat).length === 0) {
    throw new AppError(
      'Khong co tham so cau hinh nao duoc gui len de cap nhat',
      400,
      'DU_LIEU_KHONG_HOP_LE'
    );
  }

  return {
    duLieuCapNhat,
    lyDo,
  };
};

module.exports = {
  validateCapNhatCauHinh,
};

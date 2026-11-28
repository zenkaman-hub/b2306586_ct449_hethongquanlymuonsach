const { TRANG_THAI_NXB } = require('../constants/enums');
const AppError = require('../utils/AppError');

const MA_NXB_REGEX = /^[A-Za-z0-9_-]{2,20}$/;

const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

// Kiểm tra dữ liệu tạo mới nhà xuất bản
const validateTaoNXB = (body = {}) => {
  const errors = [];

  let maNXB = null;
  if (body.maNXB !== undefined && body.maNXB !== null && body.maNXB !== '') {
    if (typeof body.maNXB !== 'string') {
      errors.push({
        field: 'maNXB',
        message: 'maNXB phai la kieu chuoi (string)',
      });
    } else {
      maNXB = body.maNXB.trim().toUpperCase();
      if (maNXB && !MA_NXB_REGEX.test(maNXB)) {
        errors.push({
          field: 'maNXB',
          message:
            'maNXB phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      }
    }
  }

  let tenNXB = '';
  if (body.tenNXB === undefined || body.tenNXB === null) {
    errors.push({
      field: 'tenNXB',
      message: 'tenNXB la bat buoc',
    });
  } else if (typeof body.tenNXB !== 'string') {
    errors.push({
      field: 'tenNXB',
      message: 'tenNXB phai la kieu chuoi (string)',
    });
  } else {
    tenNXB = chuanHoaKhoangTrang(body.tenNXB);
    if (!tenNXB) {
      errors.push({
        field: 'tenNXB',
        message: 'tenNXB la bat buoc',
      });
    }
  }

  let diaChi = null;
  if (body.diaChi !== undefined && body.diaChi !== null) {
    if (typeof body.diaChi !== 'string') {
      errors.push({
        field: 'diaChi',
        message: 'diaChi phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.diaChi);
      diaChi = cleaned !== '' ? cleaned : null;
    }
  }

  let trangThai = TRANG_THAI_NXB.HOAT_DONG;
  if (body.trangThai !== undefined && body.trangThai !== null && body.trangThai !== '') {
    if (typeof body.trangThai !== 'string') {
      errors.push({
        field: 'trangThai',
        message: 'trangThai phai la kieu chuoi (string)',
      });
    } else {
      trangThai = body.trangThai.trim().toUpperCase();
      if (!Object.values(TRANG_THAI_NXB).includes(trangThai)) {
        errors.push({
          field: 'trangThai',
          message: `trangThai phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_NXB).join(', ')}`,
        });
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

  return {
    maNXB,
    tenNXB,
    diaChi,
    trangThai,
  };
};

// Kiểm tra dữ liệu cập nhật nhà xuất bản
const validateCapNhatNXB = (body = {}) => {
  const errors = [];
  const duLieuCapNhat = {};

  if (body.maNXB !== undefined) {
    if (typeof body.maNXB !== 'string') {
      errors.push({
        field: 'maNXB',
        message: 'maNXB phai la kieu chuoi (string)',
      });
    } else {
      const maNXB = body.maNXB.trim().toUpperCase();
      if (!maNXB || !MA_NXB_REGEX.test(maNXB)) {
        errors.push({
          field: 'maNXB',
          message:
            'maNXB phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      } else {
        duLieuCapNhat.maNXB = maNXB;
      }
    }
  }

  if (body.tenNXB !== undefined) {
    if (typeof body.tenNXB !== 'string') {
      errors.push({
        field: 'tenNXB',
        message: 'tenNXB phai la kieu chuoi (string)',
      });
    } else {
      const tenNXB = chuanHoaKhoangTrang(body.tenNXB);
      if (!tenNXB) {
        errors.push({
          field: 'tenNXB',
          message: 'tenNXB khong duoc de trong',
        });
      } else {
        duLieuCapNhat.tenNXB = tenNXB;
      }
    }
  }

  if (body.diaChi !== undefined) {
    if (body.diaChi === null) {
      duLieuCapNhat.diaChi = null;
    } else if (typeof body.diaChi !== 'string') {
      errors.push({
        field: 'diaChi',
        message: 'diaChi phai la kieu chuoi (string) hoac null',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.diaChi);
      duLieuCapNhat.diaChi = cleaned !== '' ? cleaned : null;
    }
  }

  if (body.trangThai !== undefined) {
    if (typeof body.trangThai !== 'string') {
      errors.push({
        field: 'trangThai',
        message: 'trangThai phai la kieu chuoi (string)',
      });
    } else {
      const trangThai = body.trangThai.trim().toUpperCase();
      if (!Object.values(TRANG_THAI_NXB).includes(trangThai)) {
        errors.push({
          field: 'trangThai',
          message: `trangThai phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_NXB).join(', ')}`,
        });
      } else {
        duLieuCapNhat.trangThai = trangThai;
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
      'Khong co du lieu nao duoc gui len de cap nhat',
      400,
      'DU_LIEU_KHONG_HOP_LE'
    );
  }

  return duLieuCapNhat;
};

// Kiểm tra dữ liệu đổi trạng thái nhà xuất bản
const validateCapNhatTrangThaiNXB = (body = {}) => {
  const trangThai =
    typeof body.trangThai === 'string'
      ? body.trangThai.trim().toUpperCase()
      : '';

  if (!Object.values(TRANG_THAI_NXB).includes(trangThai)) {
    throw new AppError(
      `trangThai phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_NXB).join(', ')}`,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'trangThai', message: 'Trang thai nha xuat ban khong hop le' }]
    );
  }

  return { trangThai };
};

module.exports = {
  validateTaoNXB,
  validateCapNhatNXB,
  validateCapNhatTrangThaiNXB,
};

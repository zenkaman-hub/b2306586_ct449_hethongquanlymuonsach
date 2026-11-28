const AppError = require('../utils/AppError');

const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

const laSoDuong = (val) =>
  typeof val === 'number' && Number.isFinite(val) && val > 0;

// Kiểm tra dữ liệu thu tiền phạt (bỏ trống soTienThu sẽ thu toàn bộ nợ còn lại)
const validateThanhToanPhat = (body = {}) => {
  const errors = [];

  const rawMoney =
    body.soTienThu !== undefined ? body.soTienThu : body.soTienThanhToan;

  let soTienThu = null;
  if (rawMoney !== undefined && rawMoney !== null && rawMoney !== '') {
    const parsedMoney =
      typeof rawMoney === 'string' ? Number(rawMoney) : rawMoney;
    if (!laSoDuong(parsedMoney)) {
      errors.push({
        field: 'soTienThu',
        message: 'soTienThu phai la so duong (> 0)',
      });
    } else {
      soTienThu = parsedMoney;
    }
  }

  const rawGhiChu =
    body.ghiChuXuLy !== undefined ? body.ghiChuXuLy : body.ghiChu;
  let ghiChuXuLy = null;

  if (rawGhiChu !== undefined && rawGhiChu !== null) {
    if (typeof rawGhiChu !== 'string') {
      errors.push({
        field: 'ghiChuXuLy',
        message: 'ghiChuXuLy phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(rawGhiChu);
      ghiChuXuLy = cleaned !== '' ? cleaned : null;
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
    soTienThu,
    ghiChuXuLy,
  };
};

// Kiểm tra dữ liệu miễn hoặc hủy khoản phạt (bắt buộc có lý do theo BR-12)
const validateMienHoacHuyPhat = (body = {}, tenThaoTac = 'xu ly phat') => {
  const rawGhiChu =
    body.ghiChuXuLy !== undefined
      ? body.ghiChuXuLy
      : body.lyDo !== undefined
        ? body.lyDo
        : body.ghiChu;

  if (rawGhiChu === undefined || rawGhiChu === null) {
    throw new AppError(
      `Vui long nhap ghiChuXuLy (hoac lyDo) khi ${tenThaoTac} (BR-12)`,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'ghiChuXuLy', message: 'ghiChuXuLy la bat buoc' }]
    );
  }

  if (typeof rawGhiChu !== 'string') {
    throw new AppError(
      'ghiChuXuLy phai la kieu chuoi (string)',
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'ghiChuXuLy', message: 'ghiChuXuLy phai la kieu chuoi (string)' }]
    );
  }

  const ghiChuXuLy = chuanHoaKhoangTrang(rawGhiChu);
  if (!ghiChuXuLy) {
    throw new AppError(
      'ghiChuXuLy khong duoc de trong',
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'ghiChuXuLy', message: 'ghiChuXuLy khong duoc de trong' }]
    );
  }

  return { ghiChuXuLy };
};

module.exports = {
  validateThanhToanPhat,
  validateMienHoacHuyPhat,
};

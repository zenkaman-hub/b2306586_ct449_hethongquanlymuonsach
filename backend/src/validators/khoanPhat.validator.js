const AppError = require('../utils/AppError');

/**
 * Chuan hoa chuoi: cat khoang trang dau/cuoi va gop nhieu khoang trang lien tiep thanh 1
 */
const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

/**
 * Kiem tra so thuc duong (> 0)
 */
const laSoDuong = (val) =>
  typeof val === 'number' && Number.isFinite(val) && val > 0;

/**
 * Validate du lieu khi xac nhan thu tien phat (POST /api/fines/:id/pay)
 * - soTienThu: tuy chon (neu khong truyen hoac null thi mac dinh thu toan bo so tien con no)
 * - ghiChuXuLy (hoac ghiChu): tuy chon
 */
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

/**
 * Validate du lieu khi mien phat (PATCH /api/fines/:id/waive)
 * hoac huy khoan phat ghi nhan sai (PATCH /api/fines/:id/cancel)
 * Bat buoc phai co ghiChuXuLy / lyDo (BR-12)
 */
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

const { PHAI } = require('../constants/enums');
const AppError = require('../utils/AppError');

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const PHONE_REGEX = /^[0-9+()\-\s]{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kiểm tra dữ liệu đăng ký độc giả
const validateDangKyDocGia = (body = {}) => {
  const errors = [];

  const tenDangNhap =
    typeof body.tenDangNhap === 'string' ? body.tenDangNhap.trim().toLowerCase() : '';
  const matKhau = typeof body.matKhau === 'string' ? body.matKhau : '';
  const hoLot = typeof body.hoLot === 'string' ? body.hoLot.trim() : '';
  const ten = typeof body.ten === 'string' ? body.ten.trim() : '';
  const dienThoai = typeof body.dienThoai === 'string' ? body.dienThoai.trim() : '';
  const email =
    typeof body.email === 'string' && body.email.trim() !== ''
      ? body.email.trim().toLowerCase()
      : null;
  const diaChi =
    typeof body.diaChi === 'string' && body.diaChi.trim() !== ''
      ? body.diaChi.trim()
      : null;
  const phai = body.phai ? String(body.phai).trim().toUpperCase() : null;

  if (!tenDangNhap) {
    errors.push({ field: 'tenDangNhap', message: 'tenDangNhap la bat buoc' });
  } else if (!USERNAME_REGEX.test(tenDangNhap)) {
    errors.push({
      field: 'tenDangNhap',
      message:
        'tenDangNhap phai tu 3-30 ky tu, khong chua khoang trang hoac ky tu dac biet',
    });
  }

  if (!matKhau) {
    errors.push({ field: 'matKhau', message: 'matKhau la bat buoc' });
  } else if (matKhau.length < 6) {
    errors.push({
      field: 'matKhau',
      message: 'matKhau phai co it nhat 6 ky tu',
    });
  }

  if (!hoLot) {
    errors.push({ field: 'hoLot', message: 'hoLot la bat buoc' });
  }

  if (!ten) {
    errors.push({ field: 'ten', message: 'ten la bat buoc' });
  }

  if (!dienThoai) {
    errors.push({ field: 'dienThoai', message: 'dienThoai la bat buoc' });
  } else if (!PHONE_REGEX.test(dienThoai)) {
    errors.push({
      field: 'dienThoai',
      message: 'dienThoai khong hop le (8-15 ky tu so)',
    });
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'email khong dung dinh dang' });
  }

  if (phai && !Object.values(PHAI).includes(phai)) {
    errors.push({
      field: 'phai',
      message: `phai phai thuoc mot trong cac gia tri: ${Object.values(PHAI).join(', ')}`,
    });
  }

  let ngaySinh = null;
  if (body.ngaySinh) {
    const parsedDate = new Date(body.ngaySinh);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push({ field: 'ngaySinh', message: 'ngaySinh khong hop le' });
    } else {
      ngaySinh = parsedDate;
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
    tenDangNhap,
    matKhau,
    email,
    hoLot,
    ten,
    ngaySinh,
    phai,
    diaChi,
    dienThoai,
  };
};

// Kiểm tra dữ liệu đăng nhập
const validateDangNhap = (body = {}) => {
  const errors = [];
  const tenDangNhap =
    typeof body.tenDangNhap === 'string' ? body.tenDangNhap.trim().toLowerCase() : '';
  const matKhau = typeof body.matKhau === 'string' ? body.matKhau : '';

  if (!tenDangNhap) {
    errors.push({ field: 'tenDangNhap', message: 'Vui long nhap tenDangNhap' });
  }
  if (!matKhau) {
    errors.push({ field: 'matKhau', message: 'Vui long nhap matKhau' });
  }

  if (errors.length > 0) {
    throw new AppError(
      errors[0].message,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      errors
    );
  }

  return { tenDangNhap, matKhau };
};

// Kiểm tra dữ liệu đổi mật khẩu
const validateDoiMatKhau = (body = {}) => {
  const errors = [];
  const matKhauHienTai =
    typeof body.matKhauHienTai === 'string' ? body.matKhauHienTai : '';
  const matKhauMoi =
    typeof body.matKhauMoi === 'string' ? body.matKhauMoi : '';

  if (!matKhauHienTai) {
    errors.push({
      field: 'matKhauHienTai',
      message: 'Vui long nhap matKhauHienTai',
    });
  }
  if (!matKhauMoi) {
    errors.push({ field: 'matKhauMoi', message: 'Vui long nhap matKhauMoi' });
  } else if (matKhauMoi.length < 6) {
    errors.push({
      field: 'matKhauMoi',
      message: 'matKhauMoi phai co it nhat 6 ky tu',
    });
  } else if (matKhauHienTai && matKhauMoi === matKhauHienTai) {
    errors.push({
      field: 'matKhauMoi',
      message: 'matKhauMoi phai khac matKhauHienTai',
    });
  }

  if (errors.length > 0) {
    throw new AppError(
      errors[0].message,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      errors
    );
  }

  return { matKhauHienTai, matKhauMoi };
};

module.exports = {
  validateDangKyDocGia,
  validateDangNhap,
  validateDoiMatKhau,
};

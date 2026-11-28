const {
  VAI_TRO,
  TRANG_THAI_LAM_VIEC,
  TRANG_THAI_TAI_KHOAN,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const MSNV_REGEX = /^[A-Za-z0-9_-]{2,20}$/;
const PHONE_REGEX = /^[0-9+()\-\s]{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VAI_TRO_NHAN_VIEN = [VAI_TRO.QUAN_TRI, VAI_TRO.THU_THU];

const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

// Kiểm tra dữ liệu tạo mới nhân viên
const validateTaoNhanVien = (body = {}) => {
  const errors = [];

  let tenDangNhap = '';
  if (body.tenDangNhap === undefined || body.tenDangNhap === null) {
    errors.push({
      field: 'tenDangNhap',
      message: 'tenDangNhap la bat buoc',
    });
  } else if (typeof body.tenDangNhap !== 'string') {
    errors.push({
      field: 'tenDangNhap',
      message: 'tenDangNhap phai la kieu chuoi (string)',
    });
  } else {
    tenDangNhap = body.tenDangNhap.trim().toLowerCase();
    if (!tenDangNhap) {
      errors.push({
        field: 'tenDangNhap',
        message: 'tenDangNhap la bat buoc',
      });
    } else if (!USERNAME_REGEX.test(tenDangNhap)) {
      errors.push({
        field: 'tenDangNhap',
        message:
          'tenDangNhap phai tu 3-30 ky tu, khong chua khoang trang hoac ky tu dac biet',
      });
    }
  }

  let matKhau = '';
  if (body.matKhau === undefined || body.matKhau === null) {
    errors.push({ field: 'matKhau', message: 'matKhau la bat buoc' });
  } else if (typeof body.matKhau !== 'string') {
    errors.push({
      field: 'matKhau',
      message: 'matKhau phai la kieu chuoi (string)',
    });
  } else {
    matKhau = body.matKhau;
    if (matKhau.length < 6) {
      errors.push({
        field: 'matKhau',
        message: 'matKhau phai co it nhat 6 ky tu',
      });
    }
  }

  let vaiTro = VAI_TRO.THU_THU;
  if (
    body.vaiTro !== undefined &&
    body.vaiTro !== null &&
    body.vaiTro !== ''
  ) {
    if (typeof body.vaiTro !== 'string') {
      errors.push({
        field: 'vaiTro',
        message: 'vaiTro phai la kieu chuoi (string)',
      });
    } else {
      vaiTro = body.vaiTro.trim().toUpperCase();
      if (!VAI_TRO_NHAN_VIEN.includes(vaiTro)) {
        errors.push({
          field: 'vaiTro',
          message: `vaiTro cua nhan vien chi duoc phep la: ${VAI_TRO_NHAN_VIEN.join(', ')}`,
        });
      }
    }
  }

  // Để trống sẽ tự sinh mã (NV0001...)
  let msnv = null;
  if (body.msnv !== undefined && body.msnv !== null && body.msnv !== '') {
    if (typeof body.msnv !== 'string') {
      errors.push({
        field: 'msnv',
        message: 'msnv phai la kieu chuoi (string)',
      });
    } else {
      msnv = body.msnv.trim().toUpperCase();
      if (msnv && !MSNV_REGEX.test(msnv)) {
        errors.push({
          field: 'msnv',
          message:
            'msnv phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      }
    }
  }

  let hoTenNV = '';
  if (body.hoTenNV === undefined || body.hoTenNV === null) {
    errors.push({ field: 'hoTenNV', message: 'hoTenNV la bat buoc' });
  } else if (typeof body.hoTenNV !== 'string') {
    errors.push({
      field: 'hoTenNV',
      message: 'hoTenNV phai la kieu chuoi (string)',
    });
  } else {
    hoTenNV = chuanHoaKhoangTrang(body.hoTenNV);
    if (!hoTenNV) {
      errors.push({ field: 'hoTenNV', message: 'hoTenNV la bat buoc' });
    }
  }

  let chucVu = '';
  if (body.chucVu === undefined || body.chucVu === null) {
    errors.push({ field: 'chucVu', message: 'chucVu la bat buoc' });
  } else if (typeof body.chucVu !== 'string') {
    errors.push({
      field: 'chucVu',
      message: 'chucVu phai la kieu chuoi (string)',
    });
  } else {
    chucVu = chuanHoaKhoangTrang(body.chucVu);
    if (!chucVu) {
      errors.push({ field: 'chucVu', message: 'chucVu la bat buoc' });
    }
  }

  let soDienThoai = '';
  if (body.soDienThoai === undefined || body.soDienThoai === null) {
    errors.push({
      field: 'soDienThoai',
      message: 'soDienThoai la bat buoc',
    });
  } else if (typeof body.soDienThoai !== 'string') {
    errors.push({
      field: 'soDienThoai',
      message: 'soDienThoai phai la kieu chuoi (string)',
    });
  } else {
    soDienThoai = body.soDienThoai.trim();
    if (!soDienThoai) {
      errors.push({
        field: 'soDienThoai',
        message: 'soDienThoai la bat buoc',
      });
    } else if (!PHONE_REGEX.test(soDienThoai)) {
      errors.push({
        field: 'soDienThoai',
        message: 'soDienThoai khong hop le (8-15 ky tu so)',
      });
    }
  }

  let email = null;
  if (body.email !== undefined && body.email !== null && body.email !== '') {
    if (typeof body.email !== 'string') {
      errors.push({
        field: 'email',
        message: 'email phai la kieu chuoi (string)',
      });
    } else {
      email = body.email.trim().toLowerCase();
      if (email && !EMAIL_REGEX.test(email)) {
        errors.push({
          field: 'email',
          message: 'email khong dung dinh dang',
        });
      }
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
    vaiTro,
    email,
    msnv,
    hoTenNV,
    chucVu,
    diaChi,
    soDienThoai,
  };
};

// Kiểm tra dữ liệu cập nhật hồ sơ nhân viên
const validateCapNhatNhanVien = (body = {}) => {
  const errors = [];
  const duLieuCapNhat = {};

  if (
    body.trangThaiLamViec !== undefined ||
    body.trangThai !== undefined ||
    body.lyDoKhoa !== undefined
  ) {
    throw new AppError(
      'Khong duoc cap nhat truc tiep trangThaiLamViec hoac trangThai tai khoan qua API cap nhat thong tin nhan vien. Vui long dung API PATCH /work-status hoac PATCH /account-status.',
      400,
      'KHONG_SUA_TRUC_TIEP_TRANG_THAI'
    );
  }

  if (body.msnv !== undefined) {
    if (typeof body.msnv !== 'string') {
      errors.push({
        field: 'msnv',
        message: 'msnv phai la kieu chuoi (string)',
      });
    } else {
      const msnv = body.msnv.trim().toUpperCase();
      if (!msnv || !MSNV_REGEX.test(msnv)) {
        errors.push({
          field: 'msnv',
          message:
            'msnv phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      } else {
        duLieuCapNhat.msnv = msnv;
      }
    }
  }

  if (body.hoTenNV !== undefined) {
    if (typeof body.hoTenNV !== 'string') {
      errors.push({
        field: 'hoTenNV',
        message: 'hoTenNV phai la kieu chuoi (string)',
      });
    } else {
      const hoTenNV = chuanHoaKhoangTrang(body.hoTenNV);
      if (!hoTenNV) {
        errors.push({
          field: 'hoTenNV',
          message: 'hoTenNV khong duoc de trong',
        });
      } else {
        duLieuCapNhat.hoTenNV = hoTenNV;
      }
    }
  }

  if (body.chucVu !== undefined) {
    if (typeof body.chucVu !== 'string') {
      errors.push({
        field: 'chucVu',
        message: 'chucVu phai la kieu chuoi (string)',
      });
    } else {
      const chucVu = chuanHoaKhoangTrang(body.chucVu);
      if (!chucVu) {
        errors.push({
          field: 'chucVu',
          message: 'chucVu khong duoc de trong',
        });
      } else {
        duLieuCapNhat.chucVu = chucVu;
      }
    }
  }

  if (body.soDienThoai !== undefined) {
    if (typeof body.soDienThoai !== 'string') {
      errors.push({
        field: 'soDienThoai',
        message: 'soDienThoai phai la kieu chuoi (string)',
      });
    } else {
      const soDienThoai = body.soDienThoai.trim();
      if (!soDienThoai || !PHONE_REGEX.test(soDienThoai)) {
        errors.push({
          field: 'soDienThoai',
          message: 'soDienThoai khong hop le (8-15 ky tu so)',
        });
      } else {
        duLieuCapNhat.soDienThoai = soDienThoai;
      }
    }
  }

  if (body.email !== undefined) {
    if (body.email === null || body.email === '') {
      duLieuCapNhat.email = null;
    } else if (typeof body.email !== 'string') {
      errors.push({
        field: 'email',
        message: 'email phai la kieu chuoi (string) hoac null',
      });
    } else {
      const email = body.email.trim().toLowerCase();
      if (!email) {
        duLieuCapNhat.email = null;
      } else if (!EMAIL_REGEX.test(email)) {
        errors.push({
          field: 'email',
          message: 'email khong dung dinh dang',
        });
      } else {
        duLieuCapNhat.email = email;
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

  if (body.vaiTro !== undefined) {
    if (typeof body.vaiTro !== 'string') {
      errors.push({
        field: 'vaiTro',
        message: 'vaiTro phai la kieu chuoi (string)',
      });
    } else {
      const vaiTro = body.vaiTro.trim().toUpperCase();
      if (!VAI_TRO_NHAN_VIEN.includes(vaiTro)) {
        errors.push({
          field: 'vaiTro',
          message: `vaiTro cua nhan vien chi duoc phep la: ${VAI_TRO_NHAN_VIEN.join(', ')}`,
        });
      } else {
        duLieuCapNhat.vaiTro = vaiTro;
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

// Kiểm tra dữ liệu đổi trạng thái làm việc của nhân viên
const validateCapNhatTrangThaiLamViec = (body = {}) => {
  const errors = [];

  const trangThaiLamViec =
    typeof body.trangThaiLamViec === 'string'
      ? body.trangThaiLamViec.trim().toUpperCase()
      : '';

  if (!Object.values(TRANG_THAI_LAM_VIEC).includes(trangThaiLamViec)) {
    errors.push({
      field: 'trangThaiLamViec',
      message: `trangThaiLamViec phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_LAM_VIEC).join(', ')}`,
    });
  }

  let lyDo = null;
  if (body.lyDo !== undefined && body.lyDo !== null) {
    if (typeof body.lyDo !== 'string') {
      errors.push({
        field: 'lyDo',
        message: 'lyDo phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.lyDo);
      lyDo = cleaned !== '' ? cleaned : null;
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
    trangThaiLamViec,
    lyDo,
  };
};

// Kiểm tra dữ liệu khóa hoặc mở khóa tài khoản nhân viên
const validateCapNhatTrangThaiTaiKhoanNV = (body = {}) => {
  const errors = [];
  const dsChoPhep = [
    TRANG_THAI_TAI_KHOAN.HOAT_DONG,
    TRANG_THAI_TAI_KHOAN.BI_KHOA,
  ];

  const trangThai =
    typeof body.trangThai === 'string'
      ? body.trangThai.trim().toUpperCase()
      : '';

  if (!dsChoPhep.includes(trangThai)) {
    errors.push({
      field: 'trangThai',
      message: `trangThai phai thuoc mot trong cac gia tri: ${dsChoPhep.join(', ')}`,
    });
  }

  const rawLyDo = body.lyDoKhoa !== undefined ? body.lyDoKhoa : body.lyDo;
  let lyDo = null;

  if (rawLyDo !== undefined && rawLyDo !== null) {
    if (typeof rawLyDo !== 'string') {
      errors.push({
        field: 'lyDoKhoa',
        message: 'lyDoKhoa phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(rawLyDo);
      lyDo = cleaned !== '' ? cleaned : null;
    }
  }

  if (trangThai === TRANG_THAI_TAI_KHOAN.BI_KHOA && !lyDo) {
    errors.push({
      field: 'lyDoKhoa',
      message: 'Vui long nhap lyDoKhoa khi khoa tai khoan nhan vien (BR-12)',
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

  return {
    trangThai,
    lyDo,
  };
};

module.exports = {
  validateTaoNhanVien,
  validateCapNhatNhanVien,
  validateCapNhatTrangThaiLamViec,
  validateCapNhatTrangThaiTaiKhoanNV,
};

const {
  PHAI,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  TRANG_THAI_TAI_KHOAN,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const MA_DOC_GIA_REGEX = /^[A-Za-z0-9_-]{2,20}$/;
const PHONE_REGEX = /^[0-9+()\-\s]{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

// Kiểm tra dữ liệu tạo mới độc giả tại quầy
const validateTaoDocGia = (body = {}) => {
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

  // Để trống sẽ tự sinh mã (DG0001...)
  let maDocGia = null;
  if (
    body.maDocGia !== undefined &&
    body.maDocGia !== null &&
    body.maDocGia !== ''
  ) {
    if (typeof body.maDocGia !== 'string') {
      errors.push({
        field: 'maDocGia',
        message: 'maDocGia phai la kieu chuoi (string)',
      });
    } else {
      maDocGia = body.maDocGia.trim().toUpperCase();
      if (maDocGia && !MA_DOC_GIA_REGEX.test(maDocGia)) {
        errors.push({
          field: 'maDocGia',
          message:
            'maDocGia phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      }
    }
  }

  let hoLot = '';
  if (body.hoLot === undefined || body.hoLot === null) {
    errors.push({ field: 'hoLot', message: 'hoLot la bat buoc' });
  } else if (typeof body.hoLot !== 'string') {
    errors.push({
      field: 'hoLot',
      message: 'hoLot phai la kieu chuoi (string)',
    });
  } else {
    hoLot = chuanHoaKhoangTrang(body.hoLot);
    if (!hoLot) {
      errors.push({ field: 'hoLot', message: 'hoLot la bat buoc' });
    }
  }

  let ten = '';
  if (body.ten === undefined || body.ten === null) {
    errors.push({ field: 'ten', message: 'ten la bat buoc' });
  } else if (typeof body.ten !== 'string') {
    errors.push({
      field: 'ten',
      message: 'ten phai la kieu chuoi (string)',
    });
  } else {
    ten = chuanHoaKhoangTrang(body.ten);
    if (!ten) {
      errors.push({ field: 'ten', message: 'ten la bat buoc' });
    }
  }

  let dienThoai = '';
  if (body.dienThoai === undefined || body.dienThoai === null) {
    errors.push({ field: 'dienThoai', message: 'dienThoai la bat buoc' });
  } else if (typeof body.dienThoai !== 'string') {
    errors.push({
      field: 'dienThoai',
      message: 'dienThoai phai la kieu chuoi (string)',
    });
  } else {
    dienThoai = body.dienThoai.trim();
    if (!dienThoai) {
      errors.push({ field: 'dienThoai', message: 'dienThoai la bat buoc' });
    } else if (!PHONE_REGEX.test(dienThoai)) {
      errors.push({
        field: 'dienThoai',
        message: 'dienThoai khong hop le (8-15 ky tu so)',
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

  let ngaySinh = null;
  if (
    body.ngaySinh !== undefined &&
    body.ngaySinh !== null &&
    body.ngaySinh !== ''
  ) {
    if (typeof body.ngaySinh !== 'string') {
      errors.push({
        field: 'ngaySinh',
        message: 'ngaySinh phai la chuoi ngay hop le (VD: YYYY-MM-DD)',
      });
    } else {
      const parsedDate = new Date(body.ngaySinh.trim());
      if (Number.isNaN(parsedDate.getTime())) {
        errors.push({
          field: 'ngaySinh',
          message: 'ngaySinh khong hop le',
        });
      } else if (parsedDate > new Date()) {
        errors.push({
          field: 'ngaySinh',
          message: 'ngaySinh khong duoc lon hon ngay hien tai',
        });
      } else {
        ngaySinh = parsedDate;
      }
    }
  }

  let phai = null;
  if (body.phai !== undefined && body.phai !== null && body.phai !== '') {
    if (typeof body.phai !== 'string') {
      errors.push({
        field: 'phai',
        message: 'phai phai la kieu chuoi (string)',
      });
    } else {
      phai = body.phai.trim().toUpperCase();
      if (!Object.values(PHAI).includes(phai)) {
        errors.push({
          field: 'phai',
          message: `phai phai thuoc mot trong cac gia tri: ${Object.values(PHAI).join(', ')}`,
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
    email,
    maDocGia,
    hoLot,
    ten,
    ngaySinh,
    phai,
    diaChi,
    dienThoai,
  };
};

// Kiểm tra dữ liệu cập nhật hồ sơ độc giả (choPhepSuaMaDocGia = true với quản trị/thủ thư)
const validateCapNhatDocGia = (body = {}, choPhepSuaMaDocGia = false) => {
  const errors = [];
  const duLieuCapNhat = {};

  // Chặn sửa trực tiếp trạng thái và số liệu thống kê qua API cập nhật hồ sơ
  if (
    body.trangThaiQuyenMuon !== undefined ||
    body.lyDoHanCheMuon !== undefined ||
    body.soSachDangMuon !== undefined ||
    body.tongTienPhatChuaTra !== undefined ||
    body.trangThaiHoSo !== undefined ||
    body.trangThai !== undefined
  ) {
    throw new AppError(
      'Khong duoc cap nhat truc tiep cac truong trang thai quyen muon, ho so hoac so lieu thong ke qua API cap nhat thong tin ca nhan. Vui long dung cac API PATCH trang thai chuyen biet.',
      400,
      'KHONG_SUA_TRUC_TIEP_TRANG_THAI'
    );
  }

  if (body.maDocGia !== undefined) {
    if (!choPhepSuaMaDocGia) {
      throw new AppError(
        'Doc gia khong duoc phep tu thay doi maDocGia',
        403,
        'KHONG_DU_QUYEN'
      );
    }
    if (typeof body.maDocGia !== 'string') {
      errors.push({
        field: 'maDocGia',
        message: 'maDocGia phai la kieu chuoi (string)',
      });
    } else {
      const maDocGia = body.maDocGia.trim().toUpperCase();
      if (!maDocGia || !MA_DOC_GIA_REGEX.test(maDocGia)) {
        errors.push({
          field: 'maDocGia',
          message:
            'maDocGia phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      } else {
        duLieuCapNhat.maDocGia = maDocGia;
      }
    }
  }

  if (body.hoLot !== undefined) {
    if (typeof body.hoLot !== 'string') {
      errors.push({
        field: 'hoLot',
        message: 'hoLot phai la kieu chuoi (string)',
      });
    } else {
      const hoLot = chuanHoaKhoangTrang(body.hoLot);
      if (!hoLot) {
        errors.push({ field: 'hoLot', message: 'hoLot khong duoc de trong' });
      } else {
        duLieuCapNhat.hoLot = hoLot;
      }
    }
  }

  if (body.ten !== undefined) {
    if (typeof body.ten !== 'string') {
      errors.push({
        field: 'ten',
        message: 'ten phai la kieu chuoi (string)',
      });
    } else {
      const ten = chuanHoaKhoangTrang(body.ten);
      if (!ten) {
        errors.push({ field: 'ten', message: 'ten khong duoc de trong' });
      } else {
        duLieuCapNhat.ten = ten;
      }
    }
  }

  if (body.dienThoai !== undefined) {
    if (typeof body.dienThoai !== 'string') {
      errors.push({
        field: 'dienThoai',
        message: 'dienThoai phai la kieu chuoi (string)',
      });
    } else {
      const dienThoai = body.dienThoai.trim();
      if (!dienThoai || !PHONE_REGEX.test(dienThoai)) {
        errors.push({
          field: 'dienThoai',
          message: 'dienThoai khong hop le (8-15 ky tu so)',
        });
      } else {
        duLieuCapNhat.dienThoai = dienThoai;
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

  if (body.ngaySinh !== undefined) {
    if (body.ngaySinh === null || body.ngaySinh === '') {
      duLieuCapNhat.ngaySinh = null;
    } else if (typeof body.ngaySinh !== 'string') {
      errors.push({
        field: 'ngaySinh',
        message: 'ngaySinh phai la chuoi ngay hop le (VD: YYYY-MM-DD) hoac null',
      });
    } else {
      const cleanedDate = body.ngaySinh.trim();
      if (!cleanedDate) {
        duLieuCapNhat.ngaySinh = null;
      } else {
        const parsedDate = new Date(cleanedDate);
        if (Number.isNaN(parsedDate.getTime())) {
          errors.push({
            field: 'ngaySinh',
            message: 'ngaySinh khong hop le',
          });
        } else if (parsedDate > new Date()) {
          errors.push({
            field: 'ngaySinh',
            message: 'ngaySinh khong duoc lon hon ngay hien tai',
          });
        } else {
          duLieuCapNhat.ngaySinh = parsedDate;
        }
      }
    }
  }

  if (body.phai !== undefined) {
    if (body.phai === null || body.phai === '') {
      duLieuCapNhat.phai = null;
    } else if (typeof body.phai !== 'string') {
      errors.push({
        field: 'phai',
        message: 'phai phai la kieu chuoi (string) hoac null',
      });
    } else {
      const phai = body.phai.trim().toUpperCase();
      if (!Object.values(PHAI).includes(phai)) {
        errors.push({
          field: 'phai',
          message: `phai phai thuoc mot trong cac gia tri: ${Object.values(PHAI).join(', ')}`,
        });
      } else {
        duLieuCapNhat.phai = phai;
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

// Kiểm tra dữ liệu cập nhật quyền mượn (DUOC_MUON / BI_HAN_CHE)
const validateCapNhatQuyenMuon = (body = {}) => {
  const errors = [];

  const trangThaiQuyenMuon =
    typeof body.trangThaiQuyenMuon === 'string'
      ? body.trangThaiQuyenMuon.trim().toUpperCase()
      : '';

  if (!Object.values(TRANG_THAI_QUYEN_MUON).includes(trangThaiQuyenMuon)) {
    errors.push({
      field: 'trangThaiQuyenMuon',
      message: `trangThaiQuyenMuon phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_QUYEN_MUON).join(', ')}`,
    });
  }

  const rawLyDo =
    body.lyDoHanCheMuon !== undefined ? body.lyDoHanCheMuon : body.lyDo;
  let lyDo = null;

  if (rawLyDo !== undefined && rawLyDo !== null) {
    if (typeof rawLyDo !== 'string') {
      errors.push({
        field: 'lyDoHanCheMuon',
        message: 'lyDoHanCheMuon phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(rawLyDo);
      lyDo = cleaned !== '' ? cleaned : null;
    }
  }

  if (
    trangThaiQuyenMuon === TRANG_THAI_QUYEN_MUON.BI_HAN_CHE &&
    !lyDo
  ) {
    errors.push({
      field: 'lyDoHanCheMuon',
      message: 'Vui long nhap lyDoHanCheMuon khi han che quyen muon cua doc gia (BR-12)',
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
    trangThaiQuyenMuon,
    lyDo,
  };
};

// Kiểm tra dữ liệu khóa hoặc mở khóa tài khoản độc giả
const validateCapNhatTrangThaiTaiKhoan = (body = {}) => {
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
      message: 'Vui long nhap lyDoKhoa khi khoa tai khoan doc gia (BR-12)',
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

// Kiểm tra dữ liệu đổi trạng thái hồ sơ độc giả
const validateCapNhatTrangThaiHoSo = (body = {}) => {
  const errors = [];

  const trangThaiHoSo =
    typeof body.trangThaiHoSo === 'string'
      ? body.trangThaiHoSo.trim().toUpperCase()
      : '';

  if (!Object.values(TRANG_THAI_HO_SO_DOC_GIA).includes(trangThaiHoSo)) {
    errors.push({
      field: 'trangThaiHoSo',
      message: `trangThaiHoSo phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_HO_SO_DOC_GIA).join(', ')}`,
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
    trangThaiHoSo,
    lyDo,
  };
};

module.exports = {
  validateTaoDocGia,
  validateCapNhatDocGia,
  validateCapNhatQuyenMuon,
  validateCapNhatTrangThaiTaiKhoan,
  validateCapNhatTrangThaiHoSo,
};

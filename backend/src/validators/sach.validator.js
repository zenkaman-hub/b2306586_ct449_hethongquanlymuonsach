const mongoose = require('mongoose');
const { TRANG_THAI_LUU_THONG_SACH } = require('../constants/enums');
const AppError = require('../utils/AppError');

const MA_SACH_REGEX = /^[A-Za-z0-9_-]{2,20}$/;

/**
 * Chuan hoa chuoi: cat khoang trang dau/cuoi va gop nhieu khoang trang lien tiep thanh 1
 */
const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

/**
 * Kiem tra so nguyen khong am
 */
const laSoNguyenKhongAm = (val) =>
  typeof val === 'number' && Number.isInteger(val) && val >= 0;

/**
 * Kiem tra so thuc khong am
 */
const laSoKhongAm = (val) =>
  typeof val === 'number' && Number.isFinite(val) && val >= 0;

/**
 * Validate du lieu khi tao moi Dau sach
 */
const validateTaoSach = (body = {}) => {
  const errors = [];

  // 1. maSach (tuy chon - neu bo trong tu sinh S0001, S0002...)
  let maSach = null;
  if (body.maSach !== undefined && body.maSach !== null && body.maSach !== '') {
    if (typeof body.maSach !== 'string') {
      errors.push({
        field: 'maSach',
        message: 'maSach phai la kieu chuoi (string)',
      });
    } else {
      maSach = body.maSach.trim().toUpperCase();
      if (maSach && !MA_SACH_REGEX.test(maSach)) {
        errors.push({
          field: 'maSach',
          message:
            'maSach phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      }
    }
  }

  // 2. tenSach (bat buoc)
  let tenSach = '';
  if (body.tenSach === undefined || body.tenSach === null) {
    errors.push({ field: 'tenSach', message: 'tenSach la bat buoc' });
  } else if (typeof body.tenSach !== 'string') {
    errors.push({
      field: 'tenSach',
      message: 'tenSach phai la kieu chuoi (string)',
    });
  } else {
    tenSach = chuanHoaKhoangTrang(body.tenSach);
    if (!tenSach) {
      errors.push({ field: 'tenSach', message: 'tenSach la bat buoc' });
    }
  }

  // 3. donGia (bat buoc, >= 0)
  const donGia =
    typeof body.donGia === 'string' && body.donGia.trim() !== ''
      ? Number(body.donGia)
      : body.donGia;
  if (donGia === undefined || donGia === null) {
    errors.push({ field: 'donGia', message: 'donGia la bat buoc' });
  } else if (!laSoKhongAm(donGia)) {
    errors.push({
      field: 'donGia',
      message: 'donGia phai la so khong am (>= 0)',
    });
  }

  // 4. tongSoQuyen (bat buoc, so nguyen >= 0)
  const tongSoQuyen =
    typeof body.tongSoQuyen === 'string' && body.tongSoQuyen.trim() !== ''
      ? Number(body.tongSoQuyen)
      : body.tongSoQuyen;
  if (tongSoQuyen === undefined || tongSoQuyen === null) {
    errors.push({ field: 'tongSoQuyen', message: 'tongSoQuyen la bat buoc' });
  } else if (!laSoNguyenKhongAm(tongSoQuyen)) {
    errors.push({
      field: 'tongSoQuyen',
      message: 'tongSoQuyen phai la so nguyen khong am (>= 0)',
    });
  }

  // 5. soQuyenHuHong (tuy chon khi khoi tao, mac dinh 0)
  let soQuyenHuHong = 0;
  if (
    body.soQuyenHuHong !== undefined &&
    body.soQuyenHuHong !== null &&
    body.soQuyenHuHong !== ''
  ) {
    const parsedHuHong =
      typeof body.soQuyenHuHong === 'string'
        ? Number(body.soQuyenHuHong)
        : body.soQuyenHuHong;
    if (!laSoNguyenKhongAm(parsedHuHong)) {
      errors.push({
        field: 'soQuyenHuHong',
        message: 'soQuyenHuHong phai la so nguyen khong am (>= 0)',
      });
    } else {
      soQuyenHuHong = parsedHuHong;
    }
  }

  if (
    laSoNguyenKhongAm(tongSoQuyen) &&
    laSoNguyenKhongAm(soQuyenHuHong) &&
    soQuyenHuHong > tongSoQuyen
  ) {
    errors.push({
      field: 'soQuyenHuHong',
      message: 'soQuyenHuHong khong duoc vuot qua tongSoQuyen',
    });
  }

  // 6. namXuatBan (bat buoc, so nguyen >= 1000 va <= nam hien tai + 1)
  const namXuatBan =
    typeof body.namXuatBan === 'string' && body.namXuatBan.trim() !== ''
      ? Number(body.namXuatBan)
      : body.namXuatBan;
  const namToiDa = new Date().getFullYear() + 1;
  if (namXuatBan === undefined || namXuatBan === null) {
    errors.push({ field: 'namXuatBan', message: 'namXuatBan la bat buoc' });
  } else if (
    typeof namXuatBan !== 'number' ||
    !Number.isInteger(namXuatBan) ||
    namXuatBan < 1000 ||
    namXuatBan > namToiDa
  ) {
    errors.push({
      field: 'namXuatBan',
      message: `namXuatBan phai la so nguyen hop le (1000 - ${namToiDa})`,
    });
  }

  // 7. nhaXuatBanId (bat buoc, ObjectId hop le)
  let nhaXuatBanId = '';
  if (body.nhaXuatBanId === undefined || body.nhaXuatBanId === null) {
    errors.push({ field: 'nhaXuatBanId', message: 'nhaXuatBanId la bat buoc' });
  } else if (
    typeof body.nhaXuatBanId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(body.nhaXuatBanId.trim())
  ) {
    errors.push({
      field: 'nhaXuatBanId',
      message: 'nhaXuatBanId khong dung dinh dang ObjectId',
    });
  } else {
    nhaXuatBanId = body.nhaXuatBanId.trim();
  }

  // 8. nguonGocTacGia (bat buoc)
  let nguonGocTacGia = '';
  if (body.nguonGocTacGia === undefined || body.nguonGocTacGia === null) {
    errors.push({
      field: 'nguonGocTacGia',
      message: 'nguonGocTacGia la bat buoc',
    });
  } else if (typeof body.nguonGocTacGia !== 'string') {
    errors.push({
      field: 'nguonGocTacGia',
      message: 'nguonGocTacGia phai la kieu chuoi (string)',
    });
  } else {
    nguonGocTacGia = chuanHoaKhoangTrang(body.nguonGocTacGia);
    if (!nguonGocTacGia) {
      errors.push({
        field: 'nguonGocTacGia',
        message: 'nguonGocTacGia la bat buoc',
      });
    }
  }

  // 9. trangThaiLuuThong (tuy chon, mac dinh DANG_LUU_THONG)
  let trangThaiLuuThong = TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG;
  if (
    body.trangThaiLuuThong !== undefined &&
    body.trangThaiLuuThong !== null &&
    body.trangThaiLuuThong !== ''
  ) {
    if (typeof body.trangThaiLuuThong !== 'string') {
      errors.push({
        field: 'trangThaiLuuThong',
        message: 'trangThaiLuuThong phai la kieu chuoi (string)',
      });
    } else {
      trangThaiLuuThong = body.trangThaiLuuThong.trim().toUpperCase();
      if (!Object.values(TRANG_THAI_LUU_THONG_SACH).includes(trangThaiLuuThong)) {
        errors.push({
          field: 'trangThaiLuuThong',
          message: `trangThaiLuuThong phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_LUU_THONG_SACH).join(', ')}`,
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
    maSach,
    tenSach,
    donGia,
    tongSoQuyen,
    soQuyenHuHong,
    namXuatBan,
    nhaXuatBanId,
    nguonGocTacGia,
    trangThaiLuuThong,
  };
};

/**
 * Validate du lieu khi cap nhat thong tin co ban cua Sach
 * (Khong cho phep sua truc tiep soQuyenDangMuon/soQuyenKhaDung qua endpoint PUT;
 *  neu muon dieu chinh ton kho tongSoQuyen/soQuyenHuHong thi dung PATCH /:id/inventory kem lyDo)
 */
const validateCapNhatSach = (body = {}) => {
  const errors = [];
  const duLieuCapNhat = {};

  if (
    body.tongSoQuyen !== undefined ||
    body.soQuyenDangMuon !== undefined ||
    body.soQuyenHuHong !== undefined ||
    body.soQuyenKhaDung !== undefined ||
    body.soQuyenDaMat !== undefined
  ) {
    throw new AppError(
      'Khong duoc cap nhat truc tiep so luong ton kho qua API cap nhat thong tin sach. Vui long su dung API dieu chinh ton kho (PATCH /api/books/:id/inventory) kem ly do.',
      400,
      'KHONG_SUA_TRUC_TIEP_TON_KHO'
    );
  }

  if (body.maSach !== undefined) {
    if (typeof body.maSach !== 'string') {
      errors.push({
        field: 'maSach',
        message: 'maSach phai la kieu chuoi (string)',
      });
    } else {
      const maSach = body.maSach.trim().toUpperCase();
      if (!maSach || !MA_SACH_REGEX.test(maSach)) {
        errors.push({
          field: 'maSach',
          message:
            'maSach phai tu 2-20 ky tu (chu, so, gach ngang hoac gach duoi)',
        });
      } else {
        duLieuCapNhat.maSach = maSach;
      }
    }
  }

  if (body.tenSach !== undefined) {
    if (typeof body.tenSach !== 'string') {
      errors.push({
        field: 'tenSach',
        message: 'tenSach phai la kieu chuoi (string)',
      });
    } else {
      const tenSach = chuanHoaKhoangTrang(body.tenSach);
      if (!tenSach) {
        errors.push({
          field: 'tenSach',
          message: 'tenSach khong duoc de trong',
        });
      } else {
        duLieuCapNhat.tenSach = tenSach;
      }
    }
  }

  if (body.donGia !== undefined) {
    const donGia =
      typeof body.donGia === 'string' && body.donGia.trim() !== ''
        ? Number(body.donGia)
        : body.donGia;
    if (!laSoKhongAm(donGia)) {
      errors.push({
        field: 'donGia',
        message: 'donGia phai la so khong am (>= 0)',
      });
    } else {
      duLieuCapNhat.donGia = donGia;
    }
  }

  if (body.namXuatBan !== undefined) {
    const namXuatBan =
      typeof body.namXuatBan === 'string' && body.namXuatBan.trim() !== ''
        ? Number(body.namXuatBan)
        : body.namXuatBan;
    const namToiDa = new Date().getFullYear() + 1;
    if (
      typeof namXuatBan !== 'number' ||
      !Number.isInteger(namXuatBan) ||
      namXuatBan < 1000 ||
      namXuatBan > namToiDa
    ) {
      errors.push({
        field: 'namXuatBan',
        message: `namXuatBan phai la so nguyen hop le (1000 - ${namToiDa})`,
      });
    } else {
      duLieuCapNhat.namXuatBan = namXuatBan;
    }
  }

  if (body.nhaXuatBanId !== undefined) {
    if (
      typeof body.nhaXuatBanId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(body.nhaXuatBanId.trim())
    ) {
      errors.push({
        field: 'nhaXuatBanId',
        message: 'nhaXuatBanId khong dung dinh dang ObjectId',
      });
    } else {
      duLieuCapNhat.nhaXuatBanId = body.nhaXuatBanId.trim();
    }
  }

  if (body.nguonGocTacGia !== undefined) {
    if (typeof body.nguonGocTacGia !== 'string') {
      errors.push({
        field: 'nguonGocTacGia',
        message: 'nguonGocTacGia phai la kieu chuoi (string)',
      });
    } else {
      const nguonGocTacGia = chuanHoaKhoangTrang(body.nguonGocTacGia);
      if (!nguonGocTacGia) {
        errors.push({
          field: 'nguonGocTacGia',
          message: 'nguonGocTacGia khong duoc de trong',
        });
      } else {
        duLieuCapNhat.nguonGocTacGia = nguonGocTacGia;
      }
    }
  }

  if (body.trangThaiLuuThong !== undefined) {
    if (typeof body.trangThaiLuuThong !== 'string') {
      errors.push({
        field: 'trangThaiLuuThong',
        message: 'trangThaiLuuThong phai la kieu chuoi (string)',
      });
    } else {
      const trangThaiLuuThong = body.trangThaiLuuThong.trim().toUpperCase();
      if (!Object.values(TRANG_THAI_LUU_THONG_SACH).includes(trangThaiLuuThong)) {
        errors.push({
          field: 'trangThaiLuuThong',
          message: `trangThaiLuuThong phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_LUU_THONG_SACH).join(', ')}`,
        });
      } else {
        duLieuCapNhat.trangThaiLuuThong = trangThaiLuuThong;
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

/**
 * Validate du lieu khi dieu chinh so luong ton kho thu cong (Muc 4.5 docs/db.md & Muc 5.10 PROJECT.md)
 * Bat buoc phai co lyDo de ghi nhat_ky_he_thong (BR-12)
 */
const validateDieuChinhTonKho = (body = {}) => {
  const errors = [];
  const ketQua = {};

  if (body.tongSoQuyen !== undefined) {
    const tongSoQuyen =
      typeof body.tongSoQuyen === 'string' && body.tongSoQuyen.trim() !== ''
        ? Number(body.tongSoQuyen)
        : body.tongSoQuyen;
    if (!laSoNguyenKhongAm(tongSoQuyen)) {
      errors.push({
        field: 'tongSoQuyen',
        message: 'tongSoQuyen phai la so nguyen khong am (>= 0)',
      });
    } else {
      ketQua.tongSoQuyen = tongSoQuyen;
    }
  }

  if (body.soQuyenHuHong !== undefined) {
    const soQuyenHuHong =
      typeof body.soQuyenHuHong === 'string' && body.soQuyenHuHong.trim() !== ''
        ? Number(body.soQuyenHuHong)
        : body.soQuyenHuHong;
    if (!laSoNguyenKhongAm(soQuyenHuHong)) {
      errors.push({
        field: 'soQuyenHuHong',
        message: 'soQuyenHuHong phai la so nguyen khong am (>= 0)',
      });
    } else {
      ketQua.soQuyenHuHong = soQuyenHuHong;
    }
  }

  if (
    ketQua.tongSoQuyen === undefined &&
    ketQua.soQuyenHuHong === undefined
  ) {
    errors.push({
      field: 'tongSoQuyen',
      message:
        'Phai cung cap it nhat mot trong hai truong: tongSoQuyen hoac soQuyenHuHong',
    });
  }

  if (body.lyDo === undefined || body.lyDo === null) {
    errors.push({
      field: 'lyDo',
      message: 'lyDo dieu chinh so luong sach la bat buoc (BR-12)',
    });
  } else if (typeof body.lyDo !== 'string') {
    errors.push({
      field: 'lyDo',
      message: 'lyDo phai la kieu chuoi (string)',
    });
  } else {
    const lyDo = chuanHoaKhoangTrang(body.lyDo);
    if (!lyDo) {
      errors.push({
        field: 'lyDo',
        message: 'lyDo dieu chinh so luong sach khong duoc de trong',
      });
    } else {
      ketQua.lyDo = lyDo;
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

  return ketQua;
};

/**
 * Validate du lieu khi doi trang thai luu thong sach
 */
const validateCapNhatTrangThaiSach = (body = {}) => {
  const trangThaiLuuThong =
    typeof body.trangThaiLuuThong === 'string'
      ? body.trangThaiLuuThong.trim().toUpperCase()
      : '';

  if (!Object.values(TRANG_THAI_LUU_THONG_SACH).includes(trangThaiLuuThong)) {
    throw new AppError(
      `trangThaiLuuThong phai thuoc mot trong cac gia tri: ${Object.values(TRANG_THAI_LUU_THONG_SACH).join(', ')}`,
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [
        {
          field: 'trangThaiLuuThong',
          message: 'Trang thai luu thong sach khong hop le',
        },
      ]
    );
  }

  return { trangThaiLuuThong };
};

module.exports = {
  validateTaoSach,
  validateCapNhatSach,
  validateDieuChinhTonKho,
  validateCapNhatTrangThaiSach,
};

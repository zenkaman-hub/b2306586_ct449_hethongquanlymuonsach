const mongoose = require('mongoose');
const { TINH_TRANG_KHI_TRA } = require('../constants/enums');
const AppError = require('../utils/AppError');

/**
 * Chuan hoa chuoi: cat khoang trang dau/cuoi va gop nhieu khoang trang lien tiep thanh 1
 */
const chuanHoaKhoangTrang = (str) =>
  typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';

/**
 * Kiem tra so thuc khong am
 */
const laSoKhongAm = (val) =>
  typeof val === 'number' && Number.isFinite(val) && val >= 0;

/**
 * Validate du lieu khi lap Phieu muon moi (POST /api/loans)
 * Ho tro truyen docGiaId (ObjectId) hoac maDocGia (String)
 * Ho tro truyen danhSachSach (mang ObjectId hoac mang Object { sachId / maSach, hanTra })
 */
const validateLapPhieuMuon = (body = {}) => {
  const errors = [];

  // 1. Xac dinh docGiaId hoac maDocGia
  let docGiaId = null;
  let maDocGia = null;

  if (
    body.docGiaId !== undefined &&
    body.docGiaId !== null &&
    body.docGiaId !== ''
  ) {
    if (
      typeof body.docGiaId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(body.docGiaId.trim())
    ) {
      errors.push({
        field: 'docGiaId',
        message: 'docGiaId khong dung dinh dang ObjectId',
      });
    } else {
      docGiaId = body.docGiaId.trim();
    }
  }

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
    }
  }

  if (!docGiaId && !maDocGia) {
    errors.push({
      field: 'docGiaId',
      message: 'Vui long cung cap docGiaId hoac maDocGia cua doc gia muon sach',
    });
  }

  // 2. ghiChu (tuy chon)
  let ghiChu = null;
  if (body.ghiChu !== undefined && body.ghiChu !== null) {
    if (typeof body.ghiChu !== 'string') {
      errors.push({
        field: 'ghiChu',
        message: 'ghiChu phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.ghiChu);
      ghiChu = cleaned !== '' ? cleaned : null;
    }
  }

  // 3. hanTraChung (tuy chon - neu muon set han tra chung cho ca phieu)
  let hanTraChung = null;
  if (body.hanTra !== undefined && body.hanTra !== null && body.hanTra !== '') {
    if (typeof body.hanTra !== 'string') {
      errors.push({
        field: 'hanTra',
        message: 'hanTra phai la chuoi ngay thang hop le',
      });
    } else {
      const parsed = new Date(body.hanTra.trim());
      if (Number.isNaN(parsed.getTime())) {
        errors.push({
          field: 'hanTra',
          message: 'hanTra khong dung dinh dang ngay thang',
        });
      } else {
        hanTraChung = parsed;
      }
    }
  }

  // 4. danhSachSach hoac chiTietMuon (bat buoc la mang >= 1 phan tu)
  const rawItems =
    body.danhSachSach !== undefined ? body.danhSachSach : body.chiTietMuon;

  const danhSachSach = [];
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    errors.push({
      field: 'danhSachSach',
      message: 'Phieu muon phai co it nhat 1 cuon sach trong danhSachSach',
    });
  } else {
    const tapSachId = new Set();
    const tapMaSach = new Set();

    rawItems.forEach((item, index) => {
      // Cho phep phan tu la chuoi sachId truc tiep hoac object { sachId, maSach, hanTra }
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!mongoose.Types.ObjectId.isValid(trimmed)) {
          errors.push({
            field: `danhSachSach[${index}]`,
            message: `Phan tu thu ${index + 1} khong phai ObjectId sachId hop le`,
          });
        } else if (tapSachId.has(trimmed)) {
          errors.push({
            field: `danhSachSach[${index}]`,
            message: 'Khong duoc muon trung 2 cuon cua cung 1 dau sach trong cung 1 phieu muon',
          });
        } else {
          tapSachId.add(trimmed);
          danhSachSach.push({
            sachId: trimmed,
            maSach: null,
            hanTra: hanTraChung,
          });
        }
      } else if (item && typeof item === 'object' && !Array.isArray(item)) {
        let itemSachId = null;
        let itemMaSach = null;
        let itemHanTra = hanTraChung;

        if (
          item.sachId !== undefined &&
          item.sachId !== null &&
          item.sachId !== ''
        ) {
          if (
            typeof item.sachId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(item.sachId.trim())
          ) {
            errors.push({
              field: `danhSachSach[${index}].sachId`,
              message: `sachId o dong thu ${index + 1} khong dung dinh dang ObjectId`,
            });
          } else {
            itemSachId = item.sachId.trim();
          }
        }

        if (
          item.maSach !== undefined &&
          item.maSach !== null &&
          item.maSach !== ''
        ) {
          if (typeof item.maSach !== 'string') {
            errors.push({
              field: `danhSachSach[${index}].maSach`,
              message: `maSach o dong thu ${index + 1} phai la kieu chuoi (string)`,
            });
          } else {
            itemMaSach = item.maSach.trim().toUpperCase();
          }
        }

        if (!itemSachId && !itemMaSach) {
          errors.push({
            field: `danhSachSach[${index}]`,
            message: `Dong sach thu ${index + 1} phai co sachId hoac maSach`,
          });
        }

        if (itemSachId) {
          if (tapSachId.has(itemSachId)) {
            errors.push({
              field: `danhSachSach[${index}].sachId`,
              message: 'Khong duoc muon trung 2 cuon cua cung 1 dau sach trong cung 1 phieu muon',
            });
          }
          tapSachId.add(itemSachId);
        }

        if (itemMaSach) {
          if (tapMaSach.has(itemMaSach)) {
            errors.push({
              field: `danhSachSach[${index}].maSach`,
              message: `Ma sach '${itemMaSach}' bi trung lap trong danh sach muon`,
            });
          }
          tapMaSach.add(itemMaSach);
        }

        if (
          item.hanTra !== undefined &&
          item.hanTra !== null &&
          item.hanTra !== ''
        ) {
          if (typeof item.hanTra !== 'string') {
            errors.push({
              field: `danhSachSach[${index}].hanTra`,
              message: `hanTra o dong thu ${index + 1} phai la chuoi ngay thang hop le`,
            });
          } else {
            const parsed = new Date(item.hanTra.trim());
            if (Number.isNaN(parsed.getTime())) {
              errors.push({
                field: `danhSachSach[${index}].hanTra`,
                message: `hanTra o dong thu ${index + 1} khong hop le`,
              });
            } else {
              itemHanTra = parsed;
            }
          }
        }

        danhSachSach.push({
          sachId: itemSachId,
          maSach: itemMaSach,
          hanTra: itemHanTra,
        });
      } else {
        errors.push({
          field: `danhSachSach[${index}]`,
          message: `Phan tu thu ${index + 1} trong danhSachSach khong hop le`,
        });
      }
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
    docGiaId,
    maDocGia,
    ghiChu,
    hanTraChung,
    danhSachSach,
  };
};

/**
 * Validate du lieu khi xac nhan tra sach toan phan hoac tung phan (POST /api/loans/:id/return)
 */
const validateTraSach = (body = {}) => {
  const errors = [];
  const rawItems =
    body.danhSachTra !== undefined ? body.danhSachTra : body.chiTietTra;

  const danhSachTra = [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    errors.push({
      field: 'danhSachTra',
      message: 'Vui long chon it nhat 1 cuon sach can tra trong danhSachTra',
    });
  } else {
    const tapChiTietId = new Set();

    rawItems.forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push({
          field: `danhSachTra[${index}]`,
          message: `Phan tu thu ${index + 1} trong danhSachTra phai la object`,
        });
        return;
      }

      let chiTietMuonId = null;
      let sachId = null;

      if (
        item.chiTietMuonId !== undefined &&
        item.chiTietMuonId !== null &&
        item.chiTietMuonId !== ''
      ) {
        if (
          typeof item.chiTietMuonId !== 'string' ||
          !mongoose.Types.ObjectId.isValid(item.chiTietMuonId.trim())
        ) {
          errors.push({
            field: `danhSachTra[${index}].chiTietMuonId`,
            message: `chiTietMuonId o dong thu ${index + 1} khong dung dinh dang ObjectId`,
          });
        } else {
          chiTietMuonId = item.chiTietMuonId.trim();
        }
      }

      if (
        item.sachId !== undefined &&
        item.sachId !== null &&
        item.sachId !== ''
      ) {
        if (
          typeof item.sachId !== 'string' ||
          !mongoose.Types.ObjectId.isValid(item.sachId.trim())
        ) {
          errors.push({
            field: `danhSachTra[${index}].sachId`,
            message: `sachId o dong thu ${index + 1} khong dung dinh dang ObjectId`,
          });
        } else {
          sachId = item.sachId.trim();
        }
      }

      if (!chiTietMuonId && !sachId) {
        errors.push({
          field: `danhSachTra[${index}]`,
          message: `Dong thu ${index + 1} phai cung cap chiTietMuonId hoac sachId`,
        });
      }

      const keyCheck = chiTietMuonId || `sach:${sachId}`;
      if (tapChiTietId.has(keyCheck)) {
        errors.push({
          field: `danhSachTra[${index}]`,
          message: `Cuon sach o dong thu ${index + 1} bi trung lap trong danhSachTra`,
        });
      }
      tapChiTietId.add(keyCheck);

      // tinhTrangKhiTra (mac dinh NGUYEN_VEN)
      let tinhTrangKhiTra = TINH_TRANG_KHI_TRA.NGUYEN_VEN;
      if (
        item.tinhTrangKhiTra !== undefined &&
        item.tinhTrangKhiTra !== null &&
        item.tinhTrangKhiTra !== ''
      ) {
        if (typeof item.tinhTrangKhiTra !== 'string') {
          errors.push({
            field: `danhSachTra[${index}].tinhTrangKhiTra`,
            message: 'tinhTrangKhiTra phai la kieu chuoi (string)',
          });
        } else {
          tinhTrangKhiTra = item.tinhTrangKhiTra.trim().toUpperCase();
          if (!Object.values(TINH_TRANG_KHI_TRA).includes(tinhTrangKhiTra)) {
            errors.push({
              field: `danhSachTra[${index}].tinhTrangKhiTra`,
              message: `tinhTrangKhiTra phai thuoc mot trong cac gia tri: ${Object.values(TINH_TRANG_KHI_TRA).join(', ')}`,
            });
          }
        }
      }

      // moTaHuHong (bat buoc khi HU_HONG_NHE, HU_HONG_NANG, hoac MAT)
      let moTaHuHong = null;
      if (item.moTaHuHong !== undefined && item.moTaHuHong !== null) {
        if (typeof item.moTaHuHong !== 'string') {
          errors.push({
            field: `danhSachTra[${index}].moTaHuHong`,
            message: 'moTaHuHong phai la kieu chuoi (string)',
          });
        } else {
          const cleaned = chuanHoaKhoangTrang(item.moTaHuHong);
          moTaHuHong = cleaned !== '' ? cleaned : null;
        }
      }

      if (
        (tinhTrangKhiTra === TINH_TRANG_KHI_TRA.HU_HONG_NHE ||
          tinhTrangKhiTra === TINH_TRANG_KHI_TRA.HU_HONG_NANG) &&
        !moTaHuHong
      ) {
        errors.push({
          field: `danhSachTra[${index}].moTaHuHong`,
          message: `Vui long nhap moTaHuHong khi tinhTrangKhiTra la '${tinhTrangKhiTra}'`,
        });
      }

      // soTienBoiThuong (tuy chon - neu thu thu nhap muc boi thuong cu the cho sach hu hong/mat)
      let soTienBoiThuong = null;
      if (
        item.soTienBoiThuong !== undefined &&
        item.soTienBoiThuong !== null &&
        item.soTienBoiThuong !== ''
      ) {
        const parsedMoney =
          typeof item.soTienBoiThuong === 'string'
            ? Number(item.soTienBoiThuong)
            : item.soTienBoiThuong;
        if (!laSoKhongAm(parsedMoney)) {
          errors.push({
            field: `danhSachTra[${index}].soTienBoiThuong`,
            message: 'soTienBoiThuong phai la so khong am (>= 0)',
          });
        } else {
          soTienBoiThuong = parsedMoney;
        }
      }

      danhSachTra.push({
        chiTietMuonId,
        sachId,
        tinhTrangKhiTra,
        moTaHuHong,
        soTienBoiThuong,
      });
    });
  }

  let ghiChu = null;
  if (body.ghiChu !== undefined && body.ghiChu !== null) {
    if (typeof body.ghiChu !== 'string') {
      errors.push({
        field: 'ghiChu',
        message: 'ghiChu phai la kieu chuoi (string)',
      });
    } else {
      const cleaned = chuanHoaKhoangTrang(body.ghiChu);
      ghiChu = cleaned !== '' ? cleaned : null;
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
    danhSachTra,
    ghiChu,
  };
};

/**
 * Validate du lieu khi gia han 1 cuon sach trong phieu muon (POST /api/loans/:id/extend)
 */
const validateGiaHanMuon = (body = {}) => {
  const errors = [];

  let chiTietMuonId = null;
  let sachId = null;

  if (
    body.chiTietMuonId !== undefined &&
    body.chiTietMuonId !== null &&
    body.chiTietMuonId !== ''
  ) {
    if (
      typeof body.chiTietMuonId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(body.chiTietMuonId.trim())
    ) {
      errors.push({
        field: 'chiTietMuonId',
        message: 'chiTietMuonId khong dung dinh dang ObjectId',
      });
    } else {
      chiTietMuonId = body.chiTietMuonId.trim();
    }
  }

  if (
    body.sachId !== undefined &&
    body.sachId !== null &&
    body.sachId !== ''
  ) {
    if (
      typeof body.sachId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(body.sachId.trim())
    ) {
      errors.push({
        field: 'sachId',
        message: 'sachId khong dung dinh dang ObjectId',
      });
    } else {
      sachId = body.sachId.trim();
    }
  }

  if (!chiTietMuonId && !sachId) {
    errors.push({
      field: 'chiTietMuonId',
      message: 'Vui long cung cap chiTietMuonId hoac sachId cua cuon sach can gia han',
    });
  }

  let soNgayGiaHan = null;
  if (
    body.soNgayGiaHan !== undefined &&
    body.soNgayGiaHan !== null &&
    body.soNgayGiaHan !== ''
  ) {
    const parsedDays =
      typeof body.soNgayGiaHan === 'string'
        ? Number(body.soNgayGiaHan)
        : body.soNgayGiaHan;
    if (
      typeof parsedDays !== 'number' ||
      !Number.isInteger(parsedDays) ||
      parsedDays < 1 ||
      parsedDays > 60
    ) {
      errors.push({
        field: 'soNgayGiaHan',
        message: 'soNgayGiaHan phai la so nguyen duong tu 1 den 60 ngay',
      });
    } else {
      soNgayGiaHan = parsedDays;
    }
  }

  let hanTraMoi = null;
  if (
    body.hanTraMoi !== undefined &&
    body.hanTraMoi !== null &&
    body.hanTraMoi !== ''
  ) {
    if (typeof body.hanTraMoi !== 'string') {
      errors.push({
        field: 'hanTraMoi',
        message: 'hanTraMoi phai la chuoi ngay thang hop le',
      });
    } else {
      const parsedDate = new Date(body.hanTraMoi.trim());
      if (Number.isNaN(parsedDate.getTime())) {
        errors.push({
          field: 'hanTraMoi',
          message: 'hanTraMoi khong dung dinh dang ngay thang',
        });
      } else {
        hanTraMoi = parsedDate;
      }
    }
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
    chiTietMuonId,
    sachId,
    soNgayGiaHan,
    hanTraMoi,
    lyDo,
  };
};

/**
 * Validate du lieu khi huy phieu muon lap sai (PATCH /api/loans/:id/cancel)
 */
const validateHuyPhieuMuon = (body = {}) => {
  const rawLyDo = body.lyDoHuy !== undefined ? body.lyDoHuy : body.lyDo;

  if (rawLyDo === undefined || rawLyDo === null) {
    throw new AppError(
      'Vui long nhap lyDoHuy khi huy phieu muon (BR-11 & BR-12)',
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'lyDoHuy', message: 'lyDoHuy la bat buoc' }]
    );
  }

  if (typeof rawLyDo !== 'string') {
    throw new AppError(
      'lyDoHuy phai la kieu chuoi (string)',
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'lyDoHuy', message: 'lyDoHuy phai la kieu chuoi (string)' }]
    );
  }

  const lyDoHuy = chuanHoaKhoangTrang(rawLyDo);
  if (!lyDoHuy) {
    throw new AppError(
      'lyDoHuy khong duoc de trong',
      400,
      'DU_LIEU_KHONG_HOP_LE',
      [{ field: 'lyDoHuy', message: 'lyDoHuy khong duoc de trong' }]
    );
  }

  return { lyDoHuy };
};

module.exports = {
  validateLapPhieuMuon,
  validateTraSach,
  validateGiaHanMuon,
  validateHuyPhieuMuon,
};

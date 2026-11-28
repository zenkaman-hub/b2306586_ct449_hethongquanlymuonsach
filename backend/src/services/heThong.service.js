const mongoose = require('mongoose');
const {
  CauHinhThuVien,
  NhatKyHeThong,
  Sach,
  NhaXuatBan,
  DocGia,
  NhanVien,
  PhieuMuon,
  KhoanPhat,
} = require('../models');
const {
  MA_CAU_HINH,
  CACH_CAP_TAI_KHOAN_DOC_GIA,
  HANH_DONG_NHAT_KY,
  VAI_TRO,
  TEN_COLLECTION,
  TRANG_THAI_HO_SO_DOC_GIA,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_LAM_VIEC,
  TRANG_THAI_PHIEU_MUON,
  TRANG_THAI_CHI_TIET_MUON,
  TRANG_THAI_KHOAN_PHAT,
  TRANG_THAI_NXB,
} = require('../constants/enums');
const AppError = require('../utils/AppError');

const CAC_TRUONG_CAU_HINH = [
  'soNgayMuonMacDinh',
  'soSachMuonToiDa',
  'tienPhatTraTreMoiNgay',
  'soLanGiaHanToiDa',
  'soNgayGiaHanMoiLan',
  'hanCheMuonKhiCoViPham',
  'choPhepDatTruoc',
  'cachCapTaiKhoanDocGia',
  'yeuCauXacMinhTaiKhoanDocGia',
  'yeuCauDienThoaiDuyNhat',
  'soNgayNhacTraTruocHan',
  'nguongSoNgayQuaHanKhoaMuon',
  'tyLeBoiThuongSachMat',
  'tyLeBoiThuongSachHuHong',
];

const duaVeDauNgay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const duaVeCuoiNgay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Lấy cấu hình thư viện, tự khởi tạo bản ghi mặc định nếu chưa có
const layCauHinhThuVien = async () => {
  let cauHinh = await CauHinhThuVien.findOne({
    maCauHinh: MA_CAU_HINH.MAC_DINH,
  })
    .populate('nguoiCapNhatId', 'tenDangNhap email vaiTro')
    .lean();

  if (!cauHinh) {
    await CauHinhThuVien.findOneAndUpdate(
      { maCauHinh: MA_CAU_HINH.MAC_DINH },
      {
        $setOnInsert: {
          maCauHinh: MA_CAU_HINH.MAC_DINH,
          soNgayMuonMacDinh: 14,
          soSachMuonToiDa: 5,
          tienPhatTraTreMoiNgay: 2000,
          soLanGiaHanToiDa: 1,
          soNgayGiaHanMoiLan: null,
          hanCheMuonKhiCoViPham: true,
          choPhepDatTruoc: false,
          cachCapTaiKhoanDocGia:
            CACH_CAP_TAI_KHOAN_DOC_GIA.TU_DANG_KY_VA_NHAN_VIEN_TAO,
          yeuCauXacMinhTaiKhoanDocGia: false,
          yeuCauDienThoaiDuyNhat: true,
          soNgayNhacTraTruocHan: null,
          nguongSoNgayQuaHanKhoaMuon: null,
          tyLeBoiThuongSachMat: null,
          tyLeBoiThuongSachHuHong: null,
          nguoiCapNhatId: null,
          ngayCapNhat: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    cauHinh = await CauHinhThuVien.findOne({
      maCauHinh: MA_CAU_HINH.MAC_DINH,
    })
      .populate('nguoiCapNhatId', 'tenDangNhap email vaiTro')
      .lean();
  }

  return cauHinh;
};

// Cập nhật cấu hình thư viện và ghi nhật ký hệ thống
const capNhatCauHinhThuVien = async ({ duLieuCapNhat, lyDo }, user) => {
  await layCauHinhThuVien();

  const cauHinh = await CauHinhThuVien.findOne({
    maCauHinh: MA_CAU_HINH.MAC_DINH,
  });

  const duLieuTruoc = {};
  const duLieuSau = {};

  for (const field of CAC_TRUONG_CAU_HINH) {
    if (duLieuCapNhat[field] !== undefined) {
      duLieuTruoc[field] = cauHinh[field];
      cauHinh[field] = duLieuCapNhat[field];
      duLieuSau[field] = duLieuCapNhat[field];
    }
  }

  cauHinh.nguoiCapNhatId = user.taiKhoanId;
  cauHinh.ngayCapNhat = new Date();
  await cauHinh.save();

  await NhatKyHeThong.create({
    hanhDong: HANH_DONG_NHAT_KY.CAP_NHAT_CAU_HINH,
    doiTuongCollection: TEN_COLLECTION.CAU_HINH_THU_VIEN,
    doiTuongId: cauHinh._id,
    nguoiThucHienId: user.taiKhoanId,
    vaiTroNguoiThucHien: user.vaiTro,
    duLieuTruoc,
    duLieuSau,
    lyDo,
    thoiDiem: cauHinh.ngayCapNhat,
  });

  return layCauHinhThuVien();
};

const layDanhSachNhatKyHeThong = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.hanhDong !== undefined && String(query.hanhDong).trim() !== '') {
    const hanhDong = String(query.hanhDong).trim().toUpperCase();
    if (!Object.values(HANH_DONG_NHAT_KY).includes(hanhDong)) {
      throw new AppError(
        `Gia tri loc hanhDong '${query.hanhDong}' khong hop le. Chi chap nhan: ${Object.values(HANH_DONG_NHAT_KY).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'hanhDong', message: 'Gia tri loc hanhDong khong hop le' }]
      );
    }
    filter.hanhDong = hanhDong;
  }

  if (
    query.doiTuongCollection !== undefined &&
    String(query.doiTuongCollection).trim() !== ''
  ) {
    const col = String(query.doiTuongCollection).trim().toLowerCase();
    if (!Object.values(TEN_COLLECTION).includes(col)) {
      throw new AppError(
        `Gia tri loc doiTuongCollection '${query.doiTuongCollection}' khong hop le. Chi chap nhan: ${Object.values(TEN_COLLECTION).join(', ')}`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'doiTuongCollection',
            message: 'Gia tri loc doiTuongCollection khong hop le',
          },
        ]
      );
    }
    filter.doiTuongCollection = col;
  }

  if (
    query.doiTuongId !== undefined &&
    String(query.doiTuongId).trim() !== ''
  ) {
    const dtId = String(query.doiTuongId).trim();
    if (!mongoose.Types.ObjectId.isValid(dtId)) {
      throw new AppError(
        'Gia tri loc doiTuongId khong dung dinh dang ObjectId',
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'doiTuongId', message: 'doiTuongId khong hop le' }]
      );
    }
    filter.doiTuongId = dtId;
  }

  if (
    query.nguoiThucHienId !== undefined &&
    String(query.nguoiThucHienId).trim() !== ''
  ) {
    const nthId = String(query.nguoiThucHienId).trim();
    if (!mongoose.Types.ObjectId.isValid(nthId)) {
      throw new AppError(
        'Gia tri loc nguoiThucHienId khong dung dinh dang ObjectId',
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [{ field: 'nguoiThucHienId', message: 'nguoiThucHienId khong hop le' }]
      );
    }
    filter.nguoiThucHienId = nthId;
  }

  if (
    query.vaiTroNguoiThucHien !== undefined &&
    String(query.vaiTroNguoiThucHien).trim() !== ''
  ) {
    const vt = String(query.vaiTroNguoiThucHien).trim().toUpperCase();
    if (!Object.values(VAI_TRO).includes(vt)) {
      throw new AppError(
        `Gia tri loc vaiTroNguoiThucHien '${query.vaiTroNguoiThucHien}' khong hop le`,
        400,
        'DU_LIEU_KHONG_HOP_LE',
        [
          {
            field: 'vaiTroNguoiThucHien',
            message: 'vaiTroNguoiThucHien khong hop le',
          },
        ]
      );
    }
    filter.vaiTroNguoiThucHien = vt;
  }

  if (query.tuNgay || query.denNgay) {
    filter.thoiDiem = {};
    if (query.tuNgay) {
      const tuNgay = new Date(query.tuNgay);
      if (Number.isNaN(tuNgay.getTime())) {
        throw new AppError(
          'Gia tri loc tuNgay khong hop le',
          400,
          'DU_LIEU_KHONG_HOP_LE',
          [{ field: 'tuNgay', message: 'tuNgay khong hop le' }]
        );
      }
      filter.thoiDiem.$gte = duaVeDauNgay(tuNgay);
    }
    if (query.denNgay) {
      const denNgay = new Date(query.denNgay);
      if (Number.isNaN(denNgay.getTime())) {
        throw new AppError(
          'Gia tri loc denNgay khong hop le',
          400,
          'DU_LIEU_KHONG_HOP_LE',
          [{ field: 'denNgay', message: 'denNgay khong hop le' }]
        );
      }
      filter.thoiDiem.$lte = duaVeCuoiNgay(denNgay);
    }
  }

  const tuKhoa =
    typeof query.tuKhoa === 'string' && query.tuKhoa.trim() !== ''
      ? query.tuKhoa.trim()
      : typeof query.search === 'string' && query.search.trim() !== ''
        ? query.search.trim()
        : null;

  if (tuKhoa) {
    const escaped = tuKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.lyDo = new RegExp(escaped, 'i');
  }

  const [danhSach, tongSo] = await Promise.all([
    NhatKyHeThong.find(filter)
      .populate('nguoiThucHienId', 'tenDangNhap email vaiTro trangThai')
      .sort({ thoiDiem: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NhatKyHeThong.countDocuments(filter),
  ]);

  return {
    danhSach,
    phanTrang: {
      page,
      limit,
      totalItems: tongSo,
      totalPages: Math.ceil(tongSo / limit) || 1,
    },
  };
};

const layChiTietNhatKyHeThong = async (id) => {
  const nhatKy = await NhatKyHeThong.findById(id)
    .populate('nguoiThucHienId', 'tenDangNhap email vaiTro trangThai')
    .lean();

  if (!nhatKy) {
    throw new AppError(
      'Khong tim thay ban ghi nhat ky he thong',
      404,
      'KHONG_TIM_THAY_NHAT_KY'
    );
  }

  return nhatKy;
};

// Thống kê tổng quan Dashboard cho quản trị và thủ thư
const layThongKeDashboard = async () => {
  const dauNgayHomNay = duaVeDauNgay(new Date());

  // Đồng bộ trạng thái quá hạn trước khi thống kê
  await PhieuMuon.updateMany(
    {
      trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO,
      chiTietMuon: {
        $elemMatch: {
          trangThai: TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
          hanTra: { $lt: dauNgayHomNay },
        },
      },
    },
    {
      $set: {
        'chiTietMuon.$[elem].trangThai': TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
        'chiTietMuon.$[elem].ngayCapNhatChiTiet': new Date(),
      },
    },
    {
      arrayFilters: [
        {
          'elem.trangThai': TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
          'elem.hanTra': { $lt: dauNgayHomNay },
        },
      ],
    }
  );

  const [
    thongKeSachAgg,
    tongSoNhaXuatBan,
    tongSoDocGia,
    soDocGiaBiHanChe,
    tongSoNhanVien,
    soPhieuMuonDangMo,
    soPhieuMuonHoanTat,
    soPhieuMuonDaHuy,
    thongKeChiTietQuaHanAgg,
    thongKeKhoanPhatAgg,
    phieuMuonMoiNhat,
    nhatKyMoiNhat,
  ] = await Promise.all([
    Sach.aggregate([
      {
        $group: {
          _id: null,
          tongSoDauSach: { $sum: 1 },
          tongSoQuyen: { $sum: '$tongSoQuyen' },
          soQuyenKhaDung: { $sum: '$soQuyenKhaDung' },
          soQuyenDangMuon: { $sum: '$soQuyenDangMuon' },
          soQuyenHuHong: { $sum: '$soQuyenHuHong' },
          soQuyenDaMat: { $sum: '$soQuyenDaMat' },
        },
      },
    ]),
    NhaXuatBan.countDocuments({ trangThai: TRANG_THAI_NXB.HOAT_DONG }),
    DocGia.countDocuments({
      trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
    }),
    DocGia.countDocuments({
      trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
      trangThaiQuyenMuon: TRANG_THAI_QUYEN_MUON.BI_HAN_CHE,
    }),
    NhanVien.countDocuments({
      trangThaiLamViec: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
    }),
    PhieuMuon.countDocuments({ trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO }),
    PhieuMuon.countDocuments({ trangThai: TRANG_THAI_PHIEU_MUON.HOAN_TAT }),
    PhieuMuon.countDocuments({ trangThai: TRANG_THAI_PHIEU_MUON.DA_HUY }),
    PhieuMuon.aggregate([
      { $match: { trangThai: TRANG_THAI_PHIEU_MUON.DANG_MO } },
      { $unwind: '$chiTietMuon' },
      {
        $match: {
          'chiTietMuon.trangThai': TRANG_THAI_CHI_TIET_MUON.QUA_HAN,
        },
      },
      { $count: 'soSachQuaHan' },
    ]),
    KhoanPhat.aggregate([
      {
        $group: {
          _id: null,
          tongSoKhoanPhat: { $sum: 1 },
          soKhoanPhatChuaXuLy: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$trangThai',
                    [
                      TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
                      TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          tongTienPhatDaThu: { $sum: '$soTienDaThanhToan' },
          tongTienPhatChuaThu: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$trangThai',
                    [
                      TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
                      TRANG_THAI_KHOAN_PHAT.THANH_TOAN_MOT_PHAN,
                    ],
                  ],
                },
                { $subtract: ['$soTienPhat', '$soTienDaThanhToan'] },
                0,
              ],
            },
          },
        },
      },
    ]),
    PhieuMuon.find()
      .populate('docGiaId', 'maDocGia hoLot ten')
      .populate('nhanVienLapId', 'msnv hoTenNV')
      .sort({ ngayMuon: -1 })
      .limit(5)
      .lean(),
    NhatKyHeThong.find()
      .populate('nguoiThucHienId', 'tenDangNhap vaiTro')
      .sort({ thoiDiem: -1 })
      .limit(5)
      .lean(),
  ]);

  const tkSach = thongKeSachAgg[0] || {
    tongSoDauSach: 0,
    tongSoQuyen: 0,
    soQuyenKhaDung: 0,
    soQuyenDangMuon: 0,
    soQuyenHuHong: 0,
    soQuyenDaMat: 0,
  };

  const soSachQuaHan = thongKeChiTietQuaHanAgg[0]?.soSachQuaHan || 0;

  const tkPhat = thongKeKhoanPhatAgg[0] || {
    tongSoKhoanPhat: 0,
    soKhoanPhatChuaXuLy: 0,
    tongTienPhatDaThu: 0,
    tongTienPhatChuaThu: 0,
  };

  return {
    sach: {
      tongSoDauSach: tkSach.tongSoDauSach,
      tongSoQuyen: tkSach.tongSoQuyen,
      soQuyenKhaDung: tkSach.soQuyenKhaDung,
      soQuyenDangMuon: tkSach.soQuyenDangMuon,
      soQuyenHuHong: tkSach.soQuyenHuHong,
      soQuyenDaMat: tkSach.soQuyenDaMat,
      tongSoNhaXuatBan,
    },
    docGia: {
      tongSoDocGia,
      soDocGiaDuocMuon: Math.max(0, tongSoDocGia - soDocGiaBiHanChe),
      soDocGiaBiHanChe,
    },
    nhanVien: {
      tongSoNhanVien,
    },
    muonTra: {
      soPhieuMuonDangMo,
      soPhieuMuonHoanTat,
      soPhieuMuonDaHuy,
      soSachDangMuon: tkSach.soQuyenDangMuon,
      soSachQuaHan,
    },
    khoanPhat: {
      tongSoKhoanPhat: tkPhat.tongSoKhoanPhat,
      soKhoanPhatChuaXuLy: tkPhat.soKhoanPhatChuaXuLy,
      tongTienPhatDaThu: tkPhat.tongTienPhatDaThu,
      tongTienPhatChuaThu: tkPhat.tongTienPhatChuaThu,
    },
    hoatDongGanDay: {
      phieuMuonMoiNhat,
      nhatKyMoiNhat,
    },
  };
};

module.exports = {
  layCauHinhThuVien,
  capNhatCauHinhThuVien,
  layDanhSachNhatKyHeThong,
  layChiTietNhatKyHeThong,
  layThongKeDashboard,
};
